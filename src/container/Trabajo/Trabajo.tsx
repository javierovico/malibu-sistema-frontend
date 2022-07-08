import React, {useCallback, useMemo, useState} from "react";
import {EstadoMesa, getStatusFromMesa, IMesa, QueryBusquedaMesa, useCarritos, useMesas} from "../../modelos/Carrito";
import {Button, Dropdown, Menu, Modal, Space, Tooltip} from "antd";
import {DownOutlined} from "@ant-design/icons";
import SelectDeCliente from "./SelectDeCliente";
import {ICliente} from "../../modelos/Cliente";
import {ItemType} from "antd/lib/menu/hooks/useItems";
import './Trabajo.css'
import TablaClientes, {ConfiguracionColumnaSimple} from "./TablaClientes";
import {useTablaOfflineAuxiliar} from "../../modelos/Generico";

enum TipoAsignacion {
    TIPO_CLIENTE,
    TIPO_ANONIMO,
    NINGUN_TIPO,
}

export default function Trabajo() {
    const queryItems = useMemo((): Partial<QueryBusquedaMesa>=>({
        activo: "1",
        withCarrito: "1",
        withMozo: '1',
    }),[])
    const {
        paginacion,
        errorMesas,
        isMesasLoading
    } = useMesas(1,1000,undefined, queryItems)
    const {
        reservarMesa,
        asignacionLoading
    } = useCarritos()
    const [mesaAsignacion, setMesaAsignacion] = useState<IMesa>()
    const [tipoAsignacion,setTipoAsignacion] = useState<TipoAsignacion>(TipoAsignacion.TIPO_ANONIMO)
    const isModalSelectClienteVisible = useMemo<boolean>(()=>!!mesaAsignacion && tipoAsignacion === TipoAsignacion.TIPO_CLIENTE,[mesaAsignacion, tipoAsignacion])
    const handleAsignarACliente = useCallback((m: IMesa)=>{
        setClienteSeleccionado(undefined)
        setTipoAsignacion(TipoAsignacion.TIPO_CLIENTE)
        setMesaAsignacion(m)
    },[])
    const handleAsignarSinCliente = useCallback((m:IMesa)=>{
        setTipoAsignacion(TipoAsignacion.TIPO_ANONIMO)
        setMesaAsignacion(m)
        reservarMesa(m)
    },[reservarMesa])
    const crearMenuAsignacion = useCallback((m:IMesa):ItemType[]=>[
        {
            label: 'A cliente',
            key: 'cliente',
            onClick: ()=> handleAsignarACliente(m)
        },
        {
            label: 'No registrar cliente',
            key: 'anonimo',
            onClick: ()=>handleAsignarSinCliente(m)
        },
    ],[handleAsignarACliente, handleAsignarSinCliente])
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ICliente>()
    const handleCancelModalCliente = useCallback(()=>{
        setClienteSeleccionado(undefined)
        setMesaAsignacion(undefined)
    },[])
    const handleAceptarModalCliente = useCallback(()=>{ // cuando ya eligio un cliente y clico en "aceptar"
        setTipoAsignacion(TipoAsignacion.NINGUN_TIPO)
        mesaAsignacion && reservarMesa(mesaAsignacion, clienteSeleccionado)
    },[clienteSeleccionado, reservarMesa, mesaAsignacion])
    const footerModalSelectCliente = useMemo(()=>[
        <Button key='back' onClick={handleCancelModalCliente}>Cancelar</Button>,
        <Tooltip key='confirm' title={!clienteSeleccionado?'Debe seleccionar un cliente primero':''}><Button type='primary' onClick={handleAceptarModalCliente} disabled={!clienteSeleccionado}>Aceptar</Button></Tooltip>,
    ],[clienteSeleccionado, handleAceptarModalCliente, handleCancelModalCliente])
    const configuracionColumnasSimple: ConfiguracionColumnaSimple<IMesa>[]= useMemo<ConfiguracionColumnaSimple<IMesa>[]>(()=>[
        {
            key:'id',
            sortable: true,
            searchable: true,
        },
        {
            key:'code',
            titulo:'Codigo',
            sortable: true,
            searchable: true,
        },
        {
            key:'descripcion',
            sortable: true,
            searchable: true,
        },
        {
            key:'estado',
            render: (_,m) =>  m.carrito_activo ? EstadoMesa.ESTADO_ASIGNADO : EstadoMesa.ESTADO_LIBRE,
            sortable: true,
            sorter: (m1: IMesa, m2: IMesa) => {
                return (m1?.carrito_activo?1:0) - (m2?.carrito_activo?1:0)
            },
            valoresAdmitidosFiltro: [
                {
                    value: EstadoMesa.ESTADO_LIBRE,
                    text:  EstadoMesa.ESTADO_LIBRE
                },
                {
                    value: EstadoMesa.ESTADO_ASIGNADO,
                    text:  EstadoMesa.ESTADO_ASIGNADO
                }
            ],
            filter:(item, filter) => {
                const arr: string[] = Array.isArray(filter)?filter:(filter?[filter]:[])   //convierte a array
                return arr.includes(getStatusFromMesa(item))
            }
        },{
            key:'acciones',
            render: (_,m)=> <Space size="middle">
                {(getStatusFromMesa(m) === EstadoMesa.ESTADO_LIBRE) && <Dropdown overlay={<Menu items={crearMenuAsignacion(m)}/>} trigger={['click']}>
                    <a href='/#' onClick={e => e.preventDefault()}>
                        <Space>
                            Asignar
                            <DownOutlined/>
                        </Space>
                    </a>
                </Dropdown>}
            </Space>
        }
    ],[crearMenuAsignacion])
    const {
        items,
        setSortBy,
        onFiltroValuesChange,
        configuracionColumnas
    } = useTablaOfflineAuxiliar(paginacion.data, configuracionColumnasSimple)
    return <>
        {errorMesas || <TablaClientes
            rowClassName={(m) => getStatusFromMesa(m) === EstadoMesa.ESTADO_LIBRE ? '' :  'table-row-dark'}
            loading={isMesasLoading || asignacionLoading}
            title='Estado de mesas'
            configuracionColumnas={configuracionColumnas}
            items={items}
            totalItems={paginacion.total}
            onOrderByChange={setSortBy}
            onBusquedaValuesChange={onFiltroValuesChange}
            onFiltroValuesChange={onFiltroValuesChange}
        />}
        <Modal
            destroyOnClose={true}
            width={'85%'}
            footer={footerModalSelectCliente}
            visible={isModalSelectClienteVisible}
            onCancel={handleCancelModalCliente}
        >
            <SelectDeCliente
                handleSelectCliente={setClienteSeleccionado}
                clienteSelected={clienteSeleccionado}
                titulo={'Seleccione cliente para mesa ' + mesaAsignacion?.code}
            />
        </Modal>
    </>
}

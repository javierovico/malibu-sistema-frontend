import React, {useCallback, useMemo, useState} from "react";
import {IMesa, QueryBusquedaMesa, useMesas} from "../../modelos/Carrito";
import {Button, Dropdown, Menu, Modal, Space, Table, Tooltip} from "antd";
import {ColumnsType} from "antd/lib/table/interface";
import {DownOutlined} from "@ant-design/icons";
import SelectDeCliente from "./SelectDeCliente";
import {ICliente} from "../../modelos/Cliente";
import {ItemType} from "antd/lib/menu/hooks/useItems";

enum TipoAsignacion {
    TIPO_CLIENTE,
    TIPO_ANONIMO,
    NINGUN_TIPO,
}

export default function Trabajo() {
    const queryItems = useMemo<Partial<QueryBusquedaMesa>>(()=>({
        activo: "1",
        withCarrito: "1"
    }),[])
    const {
        paginacion,
        errorMesas,
        isMesasLoading
    } = useMesas(1,1000,undefined, queryItems)
    const mesas = paginacion.data
    const [mesaAsignacion, setMesaAsignacion] = useState<IMesa>()
    const [tipoAsignacion,setTipoAsignacion] = useState<TipoAsignacion>(TipoAsignacion.TIPO_ANONIMO)
    const isModalSelectClienteVisible = useMemo<boolean>(()=>!!mesaAsignacion && tipoAsignacion === TipoAsignacion.TIPO_CLIENTE,[mesaAsignacion, tipoAsignacion])
    const handleAsignarACliente = useCallback((m: IMesa)=>{
        setTipoAsignacion(TipoAsignacion.TIPO_CLIENTE)
        setMesaAsignacion(m)
    },[])
    const handleReservarMesa = useCallback((m:IMesa, c?:ICliente)=>{        //cuando ya tenemos la mesa reservada y con el posible cliente (puede ser anonimo)
        console.log({m,c})
    },[])
    const handleAsignarSinCliente = useCallback((m:IMesa)=>{
        setTipoAsignacion(TipoAsignacion.TIPO_ANONIMO)
        setMesaAsignacion(m)
        handleReservarMesa(m)
    },[handleReservarMesa])
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
    const columnas = useMemo(():ColumnsType<IMesa>=>[
        {
            title:'ID',
            key:'id',
            dataIndex: 'id',
        },{
            title:'Codigo',
            key:'code',
            dataIndex: 'code'
        },{
            title:'Descripcion',
            key:'descripcion',
            dataIndex: 'descripcion'
        },{
            title:'Activa',
            key:'activo',
            dataIndex: 'activo',
            render: (r) => r ? 'SI' : 'NO'
        },{
            title:'Acciones',
            key:'acciones',
            render: (_,m)=> <Space size="middle">
                <Dropdown overlay={<Menu items={crearMenuAsignacion(m)} />} trigger={['click']}>
                    <a href='/#' onClick={e => e.preventDefault()}>
                        <Space>
                            Asignar
                            <DownOutlined />
                        </Space>
                    </a>
                </Dropdown>
            </Space>
        }
    ],[crearMenuAsignacion])
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ICliente>()
    const handleCancelModalCliente = useCallback(()=>{
        setClienteSeleccionado(undefined)
        setMesaAsignacion(undefined)
    },[])
    const handleAceptarModalCliente = useCallback(()=>{ // cuando ya eligio un cliente y clico en "aceptar"
        setTipoAsignacion(TipoAsignacion.NINGUN_TIPO)
        mesaAsignacion && handleReservarMesa(mesaAsignacion, clienteSeleccionado)
    },[clienteSeleccionado, handleReservarMesa, mesaAsignacion])
    const footerModalSelectCliente = useMemo(()=>[
        <Button key='back' onClick={handleCancelModalCliente}>Cancelar</Button>,
        <Tooltip key='confirm' title={!clienteSeleccionado?'Debe seleccionar un cliente primero':''}><Button type='primary' onClick={handleAceptarModalCliente} disabled={!clienteSeleccionado}>Aceptar</Button></Tooltip>,
    ],[clienteSeleccionado, handleAceptarModalCliente, handleCancelModalCliente])
    return <>
        {errorMesas || <Table
            loading={isMesasLoading}
            title={() => 'Estado de Mesas'}
            rowKey={'id'}
            dataSource={mesas}
            columns={columnas}
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

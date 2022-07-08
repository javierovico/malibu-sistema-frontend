import React, {useCallback, useMemo, useState} from "react";
import {
    EstadoMesa,
    getStatusFromMesa,
    ICarrito,
    IMesa,
    QueryBusquedaMesa,
    useCarritos,
    useMesas
} from "../../modelos/Carrito";
import {Button, Dropdown, Menu, MenuProps, Modal, Space, Tooltip} from "antd";
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

enum Acciones {
    ASIGNAR_MESA_A_CLIENTE = 'asignarMesaACliente',
    ASIGNAR_MESA_A_ANONIMO = 'asignarMesaAAnonimo',
    ASIGNAR_PRODUCTO_A_CARRITO = 'asignarProductoACarrito',
    VER_LISTA_PRODUCTOS = 'listaProductos',
}

export default function Trabajo() {
    const queryItems = useMemo((): Partial<QueryBusquedaMesa>=>({
        activo: "1",
        withCarrito: "1",
        withMozo: '1',
        withCliente: '1',
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
    const [carritoViendo, setCarritoViendo] = useState<ICarrito>()
    const [tipoAsignacion,setTipoAsignacion] = useState<TipoAsignacion>(TipoAsignacion.TIPO_ANONIMO)
    const isModalSelectClienteVisible = useMemo<boolean>(()=>!!mesaAsignacion && tipoAsignacion === TipoAsignacion.TIPO_CLIENTE,[mesaAsignacion, tipoAsignacion])
    const handleAsignarACliente = useCallback((m: IMesa)=>{
        setClienteSeleccionado(undefined)
        setTipoAsignacion(TipoAsignacion.TIPO_CLIENTE)
        setMesaAsignacion(m)
    },[])
    const handleVerListaProductos = useCallback((c: ICarrito)=>{
        setCarritoViendo(c)
    },[])
    const handleAsignarSinCliente = useCallback((m:IMesa)=>{
        setTipoAsignacion(TipoAsignacion.TIPO_ANONIMO)
        setMesaAsignacion(m)
        reservarMesa(m)
    },[reservarMesa])
    const crearMenuAccion = useCallback((m:IMesa):ItemType[]=>{
        const estado = getStatusFromMesa(m)
        const menus: ItemType[] = []
        if (estado === EstadoMesa.ESTADO_LIBRE) {
            menus.push({
                key: 'menu1',
                type: 'group',
                label: 'Asignar a:',
                children:[
                    {
                        label: 'Cliente registrado',
                        key: Acciones.ASIGNAR_MESA_A_CLIENTE,
                        onClick: ()=> handleAsignarACliente(m)
                    },
                    {
                        label: 'Cliente anonimo',
                        key: Acciones.ASIGNAR_MESA_A_ANONIMO,
                        onClick: ()=>handleAsignarSinCliente(m)
                    },
                ]
            })
        }
        if (estado === EstadoMesa.ESTADO_ASIGNADO) {
            menus.push({
                key: 'menu2',
                type: 'group',
                label: 'Pedidos:',
                children:[
                    {
                        label: 'Asignar Producto',
                        key: Acciones.ASIGNAR_PRODUCTO_A_CARRITO,
                        onClick: ()=> m.carrito_activo && handleVerListaProductos(m.carrito_activo)
                    },
                    {
                        label: 'Ver Lista de Pedidos',
                        key: Acciones.VER_LISTA_PRODUCTOS,
                        onClick: ()=> m.carrito_activo && handleVerListaProductos(m.carrito_activo)
                    }
                ]
            })
        }
        return menus
    },[handleAsignarACliente, handleAsignarSinCliente, handleVerListaProductos])
    const [menuAccionVisible,setMenuAccionVisible] = useState<number|undefined>(undefined)  // indica de cual mesa (id) estara abierto
    const onAccionesClick: MenuProps['onClick'] = useCallback(()=>{
        setMenuAccionVisible(undefined)
    },[])
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
            key:'code',
            titulo:'Mesa',
            sortable: true,
            searchable: true,
        },
        {
            key:'mozo',
            render: (_, m) => m.carrito_activo?.mozo?.user
        },
        {
            key:'cliente',
            render: (_, m) => m.carrito_activo?.cliente?.nombre
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
            render: (_,m)=>{
                return  <Space size="middle">
                    <Dropdown visible={menuAccionVisible === m.id} onVisibleChange={(r)=>setMenuAccionVisible(r?m.id:undefined)} overlay={<Menu onClick={onAccionesClick} items={crearMenuAccion(m)}/>} trigger={['click']}>
                        <a href='/#' onClick={e => e.preventDefault()}>
                            <Space>
                                Accion
                                <DownOutlined/>
                            </Space>
                        </a>
                    </Dropdown>
                </Space>
            }
        }
    ],[crearMenuAccion, menuAccionVisible, onAccionesClick])
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
        <Modal  //Modal para mostrar los productos actuales
            destroyOnClose={true}
            width={'85%'}
            footer={null}
            visible={!!carritoViendo}
            onCancel={()=>setCarritoViendo(undefined)}
        >
            <SelectDeCliente
                handleSelectCliente={setClienteSeleccionado}
                clienteSelected={clienteSeleccionado}
                titulo={'Seleccione cliente para mesa ' + mesaAsignacion?.code}
            />
        </Modal>
    </>
}

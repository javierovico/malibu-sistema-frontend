import React, {useCallback, useMemo, useState} from "react";
import {
    carritoVacio,
    ESTADO_CARRITO_OCUPADO,
    EstadoCarrito,
    ICarrito,
    IMesa, isCarritoHasDelivery,
    useCarrito
} from "../../modelos/Carrito";
import {Button, Col, Dropdown, Menu, MenuProps, Modal, Row, Space, Tooltip} from "antd";
import {DownOutlined, PlusOutlined} from "@ant-design/icons";
import SelectDeCliente from "./SelectDeCliente";
import {ICliente} from "../../modelos/Cliente";
import {ItemType} from "antd/lib/menu/hooks/useItems";
import './Trabajo.css'
import TablaGenerica, {ConfiguracionColumnaSimple} from "./TablaGenerica";
import {useTablaOfflineAuxiliar} from "../../modelos/Generico";
import VisorDeCarrito from "./VisorDeCarrito";

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

export default function Operacion() {
    const {
        mesas,
        errorMesas,
        isMesasLoading,
        reservarMesa,
        isPedidosLoading,
        pedidoUpdate,
        pedidos: pedidosOriginales,
        deliveris
    } = useCarrito()
    const mesasDisponibles = useMemo(()=>mesas.filter(m=>!pedidosOriginales.find(p=>p.mesa_id === m.id)),[mesas, pedidosOriginales])
    const [menuAccionPedidoVisible,setMenuAccionPedidoVisible] = useState<number|undefined>(undefined)  // indica de cual pedido (id) estara abierto
    const [carritoIdViendo, setCarritoIdViendo] = useState<{ id?: number, abrirSelectProducto?: boolean, crearNuevo?:boolean }>({})
    const carritoViendo = useMemo(()=>({carrito: carritoIdViendo.crearNuevo ? (carritoVacio) : pedidosOriginales.find(p=>p.id === carritoIdViendo?.id), abrirSelectProducto: carritoIdViendo.abrirSelectProducto}),[carritoIdViendo, pedidosOriginales])
    const crearMenuAccionPedido = useCallback((c:ICarrito):ItemType[]=>{
        const menus: ItemType[] = []
        if (ESTADO_CARRITO_OCUPADO.includes(c.status)) {
            menus.push({
                key: 'menuPedidos',
                type: 'group',
                label: 'Pedidos:',
                children:[
                    {
                        label: 'Asignar Producto',
                        key: Acciones.ASIGNAR_PRODUCTO_A_CARRITO,
                        onClick: ()=> setCarritoIdViendo({id: c.id, abrirSelectProducto: true})
                    },
                    {
                        label: 'Ver Carrito',
                        key: Acciones.VER_LISTA_PRODUCTOS,
                        onClick: ()=> setCarritoIdViendo({id:c.id})
                    }
                ]
            })
        }
        return menus
    },[])
    const configuracionColumnasSimplePedidos = useMemo<ConfiguracionColumnaSimple<ICarrito>[]>(()=>[
        {
            key: 'id',
            sortable: true,
        },
        {
            key: 'clientes',
            render: (_, c) => c.cliente?.nombre || 'ANONIMO',
            sortable: true,
            searchable: true,
        },
        {
            key: 'encargado',
            render: (_, c) => c.mozo?.user,
            sortable: true,
            filtroDesdeValores:true
        },
        {
            key: 'esDelivery',
            titulo: 'Es delivery',
            render: (_, c) => isCarritoHasDelivery(c) ? 'SI':'NO',
            sortable: true,
            filtroDesdeValores:true
        },
        {
            key: 'mesa',
            render: (_, c) => c.mesa?.code,
            searchable: true,
            sortable: true,
        },
        {
            key: 'status',
            titulo: 'Estado',
            filtroDesdeValores: true,
            sortable: true,
        },
        {
            key:'acciones',
            render: (_, c) => <Space size="middle">
                <Dropdown visible={menuAccionPedidoVisible === c.id} onVisibleChange={(r)=>setMenuAccionPedidoVisible(r?c.id:undefined)} overlay={<Menu onClick={()=>setMenuAccionPedidoVisible(undefined)} items={crearMenuAccionPedido(c)}/>} trigger={['click']}>
                    <a href='/#' onClick={e => e.preventDefault()}>
                        <Space>
                            Accion
                            <DownOutlined/>
                        </Space>
                    </a>
                </Dropdown>
            </Space>
        }
    ],[crearMenuAccionPedido, menuAccionPedidoVisible])
    const {
        items: pedidos,
        setSortBy: setSortByPedidos,
        onFiltroValuesChange: onFiltroValuesChangePedidos,
        configuracionColumnas: configuracionColumnasPedidos
    } = useTablaOfflineAuxiliar(pedidosOriginales, configuracionColumnasSimplePedidos)
    /** Fin de pedidos*/
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
    const crearMenuAccionMesa = useCallback((m:IMesa):ItemType[]=>{
        // const estado = getStatusFromMesa(m)
        const estado: EstadoCarrito|undefined = pedidosOriginales.find(p=>p.mesa_id === m.id)?.status
        const menus: ItemType[] = []
        if (!estado || !ESTADO_CARRITO_OCUPADO.includes(estado)) {
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
        if (estado && ESTADO_CARRITO_OCUPADO.includes(estado)) {
            menus.push({
                key: 'menu2',
                type: 'group',
                label: 'Pedidos:',
                children:[
                    {
                        label: 'Asignar Producto',
                        key: Acciones.ASIGNAR_PRODUCTO_A_CARRITO,
                        onClick: ()=> setCarritoIdViendo({id: pedidosOriginales.find(p => p.mesa_id === m.id)?.id, abrirSelectProducto: true})
                    },
                    {
                        label: 'Ver Carrito',
                        key: Acciones.VER_LISTA_PRODUCTOS,
                        onClick: ()=> setCarritoIdViendo({id: pedidosOriginales.find(p => p.mesa_id === m.id)?.id})
                    }
                ]
            })
        }
        return menus
    },[handleAsignarACliente, handleAsignarSinCliente, pedidosOriginales])
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
            render: (_, m) => pedidosOriginales.find(p=>p.mesa_id === m.id)?.mozo?.user
        },
        {
            key:'cliente',
            render: (_, m) => pedidosOriginales.find(p=>p.mesa_id === m.id)?.cliente?.nombre
        },
        {
            key:'estado',
            render: (_,m) =>  pedidosOriginales.find(p=>p.mesa_id === m.id)?.status,
            sortable: true,
            // searchable: true,
            filtroDesdeValores:true,
        },{
            key:'acciones',
            render: (_,m)=>{
                return  <Space size="middle">
                    <Dropdown visible={menuAccionVisible === m.id} onVisibleChange={(r)=>setMenuAccionVisible(r?m.id:undefined)} overlay={<Menu onClick={onAccionesClick} items={crearMenuAccionMesa(m)}/>} trigger={['click']}>
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
    ],[crearMenuAccionMesa, menuAccionVisible, onAccionesClick, pedidosOriginales])
    const {
        items,
        setSortBy,
        onFiltroValuesChange,
        configuracionColumnas
    } = useTablaOfflineAuxiliar(mesas, configuracionColumnasSimple)
    const handleCarritoChange = useCallback((c: ICarrito)=>{
        return new Promise<void>(((resolve, reject) => {
            pedidoUpdate(c,false,false)
                .then((cSubido)=>{
                    setCarritoIdViendo({id:cSubido?.id})
                    resolve()
                })
                .catch(reject)
        }))
    },[pedidoUpdate])
    const cabezeraTablaPedidos = useMemo(()=><>
        <Row justify="space-between">
            <Col lg={12}>
                <h3>Lista de pedidos actuales</h3>
            </Col>
            <Col offset={4} lg={8}>
                <Button onClick={()=>setCarritoIdViendo({crearNuevo: true})} style={{float:'right'}} type="primary" icon={<PlusOutlined />}>
                    Crear Carrito
                </Button>
            </Col>
        </Row>
    </>,[])
    return <>
        {errorMesas || <TablaGenerica
            rowClassName={(m) => {
                const estado: EstadoCarrito|undefined = pedidosOriginales.find(p=>p.mesa_id === m.id)?.status
                return (!estado || !ESTADO_CARRITO_OCUPADO.includes(estado)) ? '' :  'table-row-dark'
            }}
            loading={isMesasLoading || isPedidosLoading}
            title='Estado de mesas'
            configuracionColumnas={configuracionColumnas}
            items={items}
            totalItems={mesas.length}
            onOrderByChange={setSortBy}
            onBusquedaValuesChange={onFiltroValuesChange}
            onFiltroValuesChange={onFiltroValuesChange}
        />}
        {errorMesas || <TablaGenerica
            loading={isPedidosLoading}
            title={cabezeraTablaPedidos}
            configuracionColumnas={configuracionColumnasPedidos}
            items={pedidos}
            totalItems={pedidos.length}
            onOrderByChange={setSortByPedidos}
            onBusquedaValuesChange={onFiltroValuesChangePedidos}
            onFiltroValuesChange={onFiltroValuesChangePedidos}
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
        <Modal  //Modal para mostrar los carritos actuales
            destroyOnClose={true}
            width={'85%'}
            footer={null}
            visible={!!carritoViendo.carrito}
            onCancel={()=>setCarritoIdViendo({})}
        >
            {carritoViendo.carrito && <VisorDeCarrito
                deliveris={deliveris}
                mesas={[...mesasDisponibles, ...(carritoViendo.carrito.mesa?[carritoViendo.carrito.mesa]:[])]}      // se les agrega las mesas disponibles mas la mesa actual (si esta)
                carrito={carritoViendo.carrito}
                abrirSelectProducto={carritoViendo.abrirSelectProducto}
                carritoChange={handleCarritoChange}
            />}
        </Modal>
    </>
}

import {Card, Col, Modal, notification, Row, Statistic, Tooltip} from "antd";
import {calcularPrecioCarrito, getEstadoStrFromPedido, productoCarritoCompare, useCarrito} from "../../modelos/Carrito";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {formateadorNumero} from "../../utils/utils";
import {
    EditOutlined,
    EllipsisOutlined,
    ExclamationCircleOutlined,
    SettingOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import './OperacionCaja.css'
import ModalVisorProductosCaja from "./ModalVisorProductosCaja";
import {createItemNumberOrNull, ParamsQuerys, useParametros} from "../../hook/hookQuery";
import {useNavigate} from "react-router-dom";
import {
    avanzarProducto,
    CARRITO_PRODUCTO_SUCESION_ESTADOS,
    IProducto,
    productoAvanzable,
    productoQuitable
} from "../../modelos/Producto";
import {AuthContext} from "../../context/AuthProvider";
import {comprobarRol, RolesDisponibles} from "../../modelos/Usuario";

interface ParametrosOperacionCaja {
    productosCarritoShowing: number|null,
}

export default function OperacionCaja() {
    const {user} = useContext(AuthContext)
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
    // let navigate = useNavigate();
    const itemList = useMemo((): ParamsQuerys<ParametrosOperacionCaja> =>({
        productosCarritoShowing: createItemNumberOrNull(0)
    }),[])
    const {
        paramsURL,
        setParamsToURL
    } = useParametros<ParametrosOperacionCaja>(itemList)
    const pedidos = useMemo(() => pedidosOriginales, [pedidosOriginales])      //Filtro de pedidos
    // const [modalProductosShowing, setModalProductosShowing] = useState<number|undefined>(4)
    const modalProductosShowing = useMemo(()=>paramsURL.productosCarritoShowing,[paramsURL.productosCarritoShowing])
    const setModalProductosShowing = useCallback((id: number|undefined)=>{
        setParamsToURL({productosCarritoShowing: id ?? null})
        // if (id) {
        //     setParamsToURL({productosCarritoShowing: id})
        // } else {
        //     navigate(-1)
        // }
    },[setParamsToURL])
    const visorProductoCarritoShowing = useMemo(()=> modalProductosShowing ? pedidosOriginales.find(p => p.id === modalProductosShowing) : undefined, [modalProductosShowing, pedidosOriginales])
    const calcTiempoTranscurrido = useCallback((millis: number) => {
        const segundos = ('0' + Math.round((millis / 1000) % 60)).slice(-2)
        const minutos = ('0' + Math.round((millis / 1000 / 60) % 60)).slice(-2)
        const horas = ('0' + Math.round(millis / 1000 / 60 / 60)).slice(-2)
        return horas + ':' + minutos + ':' + segundos
    }, [])
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => {
            setTiempoTranscurrido((t) => t + 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [])
    const quitarProductoHandle = useCallback((p: IProducto) => {
        if (visorProductoCarritoShowing) {
            if (!productoQuitable(p)) {
                notification['error']({
                    message: 'No se puede quitar',
                    description: "Producto `" + p.nombre + "` no se puede quitar porque ya está en estado `" + p.pivot?.estado + "`"
                })
            } else if (!user || !comprobarRol(user, RolesDisponibles.ROL_OPERADOR)) {
                notification['error']({
                    message: 'No se puede quitar',
                    description: "El usuario no tiene permisos de " + RolesDisponibles.ROL_OPERADOR
                })
            } else {
                Modal.confirm({
                    title: '¿Quitar producto ' + p.nombre + '?',
                    icon: <ExclamationCircleOutlined />,
                    content: '',
                    okText: 'Si',
                    okType: 'danger',
                    cancelText: 'No',
                    onOk() {
                        const nuevoPedido = {...visorProductoCarritoShowing, productos: [...(visorProductoCarritoShowing.productos??[]).filter(productoOriginal => !productoCarritoCompare(productoOriginal,p))]}
                        pedidoUpdate(nuevoPedido)
                            .then(()=>{
                                notification['success']({
                                    message: 'Quitado',
                                    description: "Se quito el producto " + p.nombre
                                })
                            }).catch(e=>{
                            notification['error']({
                                message: 'Error',
                                description: e.message
                            })
                        })
                    },
                });
            }
        }
    },[pedidoUpdate, user, visorProductoCarritoShowing])
    const avanzarProductoHandle = useCallback((p:IProducto) => {
        if (visorProductoCarritoShowing) {
            console.log('si')
            if (!productoAvanzable(p)) {
                notification['error']({
                    message: 'No se puede avanzar',
                    description: "Producto `" + p.nombre + "` ya esta en estado final `" + p.pivot?.estado + "`"
                })
            } else if (!user || !comprobarRol(user, RolesDisponibles.ROL_COCINERO)) {
                notification['error']({
                    message: 'No se puede avanzar',
                    description: "El usuario no tiene permisos de " + RolesDisponibles.ROL_COCINERO
                })
            } else {
                const estadoAvance: number = CARRITO_PRODUCTO_SUCESION_ESTADOS.findIndex(se => se === p.pivot?.estado) + 1
                Modal.confirm({
                    title: '¿Avanzar producto ' + p.nombre + ' a ' + CARRITO_PRODUCTO_SUCESION_ESTADOS[estadoAvance] + '?',
                    icon: <ExclamationCircleOutlined />,
                    content: '',
                    okText: 'Si',
                    okType: 'danger',
                    cancelText: 'No',
                    onOk() {
                        const nuevoPedido = {...visorProductoCarritoShowing, productos: [...(visorProductoCarritoShowing.productos??[]).map(productoOriginal => productoCarritoCompare(productoOriginal,p) ? avanzarProducto(p, visorProductoCarritoShowing) : productoOriginal)]}
                        pedidoUpdate(nuevoPedido)
                            .then(()=>{
                                notification['success']({
                                    message: 'Quitado',
                                    description: "Se avanzó el producto " + p.nombre
                                })
                            }).catch(e=>{
                            notification['error']({
                                message: 'Error',
                                description: e.message
                            })
                        })
                    },
                });
            }
        }
    },[])
    return <>
        <Statistic title="Transcurrido" value={calcTiempoTranscurrido(tiempoTranscurrido*1000)}/>
        <Row gutter={[10, 10]}>
            {pedidos.map(p => (<Col className='col-card' key={p.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                    className='flexible-card'
                    actions={[
                        <Tooltip title={'Ver Productos'} key={'agregar'}><UnorderedListOutlined onClick={()=>setModalProductosShowing(p.id)}/></Tooltip>,
                        <SettingOutlined key="setting"/>,
                        <EditOutlined key="edit"/>,
                        <EllipsisOutlined key="ellipsis"/>,
                    ]}
                >
                    <Statistic title="Cliente" value={p.cliente?.nombre ?? 'Anonimo'}/>
                    <Statistic title="Mesa" value={p.mesa?.code ?? 'Sin mesa'}/>
                    <Statistic title="Monto" value={formateadorNumero(calcularPrecioCarrito(p)) + ' Gs.'}/>
                    <Statistic title="Estado" value={getEstadoStrFromPedido(p)}/>
                    <Statistic title="Transcurrido" value={calcTiempoTranscurrido(Date.now() - Date.parse(p.fecha_creacion))}/>
                </Card>
            </Col>))}
        </Row>
        <ModalVisorProductosCaja
            carrito={visorProductoCarritoShowing}
            onCancel={()=>setModalProductosShowing(undefined)}
            quitarProductoHandle={quitarProductoHandle}
            avanzarProductoHandle={avanzarProductoHandle}
        />
    </>
}

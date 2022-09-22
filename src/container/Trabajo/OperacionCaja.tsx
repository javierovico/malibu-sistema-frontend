import {Card, Col, Modal, notification, Row, Statistic, Tooltip} from "antd";
import {
    calcularPrecioCarrito,
    getEstadoStrFromPedido,
    productoCarritoCompare,
    productoCarritoPivotFromProducto,
    useCarrito
} from "../../modelos/Carrito";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {formateadorNumero} from "../../utils/utils";
import {
    EllipsisOutlined,
    ExclamationCircleOutlined, PlusOutlined,
    SettingOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import './OperacionCaja.css'
import ModalVisorProductosCaja from "./ModalVisorProductosCaja";
import {
    createItemNumber,
    ParamsQuerys,
    useParametros
} from "../../hook/hookQuery";
import {
    avanzarProducto,
    CARRITO_PRODUCTO_SUCESION_ESTADOS,
    IProducto,
    productoAvanzable,
    productoQuitable
} from "../../modelos/Producto";
import {AuthContext} from "../../context/AuthProvider";
import {comprobarRol, RolesDisponibles} from "../../modelos/Usuario";
import ModalAddProductoToCarrito from "./ModalAddProductoToCarrito";

enum Acciones {
    NO_ACCION,
    MOSTRAR_PRODUCTOS,
    AGREGAR_PRODUCTO,
}

interface ParametrosOperacionCaja {
    carritoOperacionId: number,
    carritoOperacionAccion: Acciones,
}

export default function OperacionCaja() {
    const {user} = useContext(AuthContext)
    const {
        // mesas,
        // errorMesas,
        // isMesasLoading,
        // reservarMesa,
        // isPedidosLoading,
        pedidoUpdate,
        pedidos: pedidosOriginales,
        // deliveris,
    } = useCarrito()
    // let navigate = useNavigate();
    const itemList = useMemo((): ParamsQuerys<ParametrosOperacionCaja> => ({
        carritoOperacionId: createItemNumber(0),
        carritoOperacionAccion: {
            defaultValue: Acciones.NO_ACCION,
            queryToValue: a => isNaN(parseInt(a)) ? Acciones.NO_ACCION : parseInt(a),
            valueToQuery: a => '' + a
        }
    }), [])
    const {
        paramsURL,
        setParamsToURL
    } = useParametros<ParametrosOperacionCaja>(itemList)
    const {carritoOperacionId, carritoOperacionAccion} = paramsURL
    const carritoActivo = useMemo(() => pedidosOriginales.find(p => p.id === carritoOperacionId), [carritoOperacionId, pedidosOriginales])
    const pedidos = useMemo(() => pedidosOriginales, [pedidosOriginales])      //Filtro de pedidos
    const setModalProductosShowing = useCallback((id: number | undefined) => setParamsToURL({
        carritoOperacionId: id ?? 0,
        carritoOperacionAccion: id ? Acciones.MOSTRAR_PRODUCTOS : Acciones.NO_ACCION,
    }), [setParamsToURL])
    const setModalProductoAdd = useCallback((id: number | undefined) => setParamsToURL({
        carritoOperacionId: id ?? 0,
        carritoOperacionAccion: id ? Acciones.AGREGAR_PRODUCTO : Acciones.NO_ACCION
    }), [setParamsToURL])
    const cerrarAccion = useCallback(() => setParamsToURL({
        carritoOperacionId: 0,
        carritoOperacionAccion: Acciones.NO_ACCION
    }), [setParamsToURL])
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
        if (carritoActivo) {
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
                    icon: <ExclamationCircleOutlined/>,
                    content: '',
                    okText: 'Si',
                    okType: 'danger',
                    cancelText: 'No',
                    onOk() {
                        const nuevoPedido = {
                            ...carritoActivo,
                            productos: [...(carritoActivo.productos ?? []).filter(productoOriginal => !productoCarritoCompare(productoOriginal, p))]
                        }
                        pedidoUpdate(nuevoPedido)
                            .then(() => {
                                notification['success']({
                                    message: 'Quitado',
                                    description: "Se quito el producto " + p.nombre
                                })
                            }).catch(e => {
                            notification['error']({
                                message: 'Error',
                                description: e.message
                            })
                        })
                    },
                });
            }
        }
    }, [pedidoUpdate, user, carritoActivo])
    const avanzarProductoHandle = useCallback((p: IProducto) => {
        if (carritoActivo) {
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
                    icon: <ExclamationCircleOutlined/>,
                    content: '',
                    okText: 'Si',
                    okType: 'danger',
                    cancelText: 'No',
                    onOk() {
                        const nuevoPedido = {
                            ...carritoActivo,
                            productos: [...(carritoActivo.productos ?? []).map(productoOriginal => productoCarritoCompare(productoOriginal, p) ? avanzarProducto(p, carritoActivo) : productoOriginal)]
                        }
                        pedidoUpdate(nuevoPedido)
                            .then(() => {
                                notification['success']({
                                    message: 'Quitado',
                                    description: "Se avanzó el producto " + p.nombre
                                })
                            }).catch(e => {
                            notification['error']({
                                message: 'Error',
                                description: e.message
                            })
                        })
                    },
                });
            }
        }
    }, [pedidoUpdate, user, carritoActivo])
    const handleAddProducto = useCallback((productoAdd: IProducto, c: number): Promise<void> => {   // su promesa siempre retorna resolve a proposito
        return new Promise((resolve, reject) => {
            if (carritoActivo && productoAdd.id) {
                //Primero buscamos si el producto a agregar ya estaba en el carrito como producto quitable (que se puede modificar su cantidad)
                const productoExistente = carritoActivo?.productos?.filter(p => productoQuitable(p))?.find(p => p.id === productoAdd.id)
                //preparamos el nuevo producto
                let nuevoProducto: IProducto
                //preparamos los nuevos productos
                let nuevosProductos: IProducto[] = [...(carritoActivo?.productos ?? [])]
                if (productoExistente) {
                    nuevoProducto = {...productoExistente, pivot: {...productoExistente.pivot!!}}       //creamos el producto desde el producto existente
                    nuevoProducto.pivot!!.cantidad += c         //le agregamos la cantidad nueva
                    nuevosProductos = nuevosProductos.map(productoOriginal => productoCarritoCompare(productoOriginal, productoExistente) ? nuevoProducto : productoOriginal)
                } else {
                    nuevoProducto = {
                        ...productoAdd,
                        pivot: {...productoCarritoPivotFromProducto(productoAdd, carritoActivo), cantidad: c}
                    }        //creamos el producto desde el nuevo producto
                    nuevosProductos.push(nuevoProducto)
                }
                //actualizamos el nuevo pedido
                pedidoUpdate({...carritoActivo, productos: nuevosProductos})
                    .then(() => {
                        notification['success']({
                            message: 'Agregado',
                            description: "Se " + (c > 1 ? "agregaron " : "agregó ") + c + (c > 1 ? " cantidades" : " cantidad") + " del producto " + productoAdd.nombre
                        })
                    }).catch(e => {
                    notification['error']({
                        message: 'Error',
                        description: e.message
                    })
                }).finally(resolve)
            }
        })
    }, [carritoActivo, pedidoUpdate])
    return <>
        <Statistic title="Transcurrido" value={calcTiempoTranscurrido(tiempoTranscurrido * 1000)}/>
        <Row gutter={[10, 10]}>
            {pedidos.map(p => (<Col className='col-card' key={p.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                    className='flexible-card'
                    actions={[
                        <Tooltip title={'Ver Productos'} key='verProductos'><UnorderedListOutlined
                            onClick={() => setModalProductosShowing(p.id)}/></Tooltip>,
                        <Tooltip title={'Agregar producto'} key='agregarProducto'><PlusOutlined
                            onClick={() => setModalProductoAdd(p.id)}/></Tooltip>,
                        <SettingOutlined key="setting"/>,
                        <EllipsisOutlined key="ellipsis"/>,
                    ]}
                >
                    <Statistic title="Cliente" value={p.cliente?.nombre ?? 'Anonimo'}/>
                    <Statistic title="Mesa" value={p.mesa?.code ?? 'Sin mesa'}/>
                    <Statistic title="Monto" value={formateadorNumero(calcularPrecioCarrito(p)) + ' Gs.'}/>
                    <Statistic title="Estado" value={getEstadoStrFromPedido(p)}/>
                    <Statistic title="Transcurrido"
                               value={calcTiempoTranscurrido(Date.now() - Date.parse(p.fecha_creacion))}/>
                </Card>
            </Col>))}
        </Row>
        <ModalVisorProductosCaja
            carrito={carritoOperacionAccion === Acciones.MOSTRAR_PRODUCTOS ? carritoActivo : undefined}
            onCancel={cerrarAccion}
            quitarProductoHandle={quitarProductoHandle}
            avanzarProductoHandle={avanzarProductoHandle}
        />
        <ModalAddProductoToCarrito
            carrito={carritoOperacionAccion === Acciones.AGREGAR_PRODUCTO ? carritoActivo : undefined}
            onCancel={cerrarAccion}
            handleAddProducto={handleAddProducto}
        />
    </>
}

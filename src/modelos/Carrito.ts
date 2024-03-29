import {LaravelBoolean, Postable, useGenericModel, WithQuery} from "./Generico";
import {useCallback, useContext, useEffect, useMemo} from "react";
import {ICliente} from "./Cliente";
import {AuthContext} from "../context/AuthProvider";
import {IUsuario} from "./Usuario";
import {
    CarritoProductoEstado,
    EnumTipoProducto,
    IProducto,
    isProductoDelivery,
    PivotCarritoProducto,
    QueryGetProductos,
    useProductos
} from "./Producto";


export enum EstadoCarrito {
    CREADO = 'creado',
    MODIFICADO = 'modificado',
    PAGADO = 'pagado',
    FINALIZADO = 'finalizado',
}

const ENVENTO_CARRITO_CREADO: EstadoCarrito = EstadoCarrito.CREADO
const ENVENTO_CARRITO_MODIFICADO: EstadoCarrito = EstadoCarrito.MODIFICADO
const ENVENTO_CARRITO_PAGADO: EstadoCarrito = EstadoCarrito.PAGADO
const ENVENTO_CARRITO_FINALIZADO: EstadoCarrito = EstadoCarrito.FINALIZADO

export interface ICarrito {
    id: number,
    cliente?: ICliente,
    mesa?: IMesa,
    cliente_id: number | null,
    fecha_creacion: string,
    mesa_id: number | null,
    pagado: boolean,
    entregado: boolean,
    finalizado: boolean,
    status: EstadoCarrito,
    mozo?: IUsuario,
    mozo_id: number,
    productos?: IProducto[],
    is_delivery: boolean
}


// export class Carrito extends ClaseModel<ICarrito> implements ICarrito{
//     static readonly url: string = 'carrito'
//     static readonly nombreGet: string = 'carrito'
//
//     id: number;
//     cliente?: ICliente;
//     mesa?: IMesa;
//     cliente_id: number|null;
//     fecha_creacion: string;
//     is_delivery: boolean;
//     mesa_id: number|null;
//     pagado: boolean;
//     status: EstadoCarrito;
//     mozo?: IUsuario;
//     mozo_id: number;
//     productos?: IProducto[];
//
//     public constructor(m: ICarrito) {
//         super()
//         this.id = m.id
//         this.cliente = m.cliente
//         this.mesa = m.mesa
//         this.cliente_id = m.cliente_id
//         this.fecha_creacion = m.fecha_creacion
//         this.is_delivery = m.is_delivery
//         this.mesa_id = m.mesa_id
//         this.pagado = m.pagado
//         this.status = m.status
//         this.mozo = m.mozo
//         this.mozo_id = m.mozo_id
//         this.productos = m.productos
//     }
//
//     postable (carritoOriginal?: ICarrito): ParametrosAPICarrito {       //TODO: VER COMO SE COMPORTA EL THIS
//         const data: ParametrosAPICarrito = {
//             withProductos: "1",
//             withCliente: '1',
//             withMesa: '1',
//             withMozo: '1',
//         }
//         data.productosIdAgrega = this.productos?.filter(p1=>p1.id && !carritoOriginal?.productos?.find(p2 => p2.id === p1.id))?.map(p=>p.id as number) || []
//         data.productosIdQuita = carritoOriginal?.productos?.filter(p1=>p1.id && !this?.productos?.find(p2 => p2.id === p1.id))?.map(p=>p.id as number) || []
//         if (this.mesa_id !== carritoOriginal?.mesa_id) {
//             data.mesaId = this.mesa_id || null
//         }
//         if (this.cliente_id !== carritoOriginal?.cliente_id) {
//             data.clienteId = this.cliente_id || null
//         }
//         return data
//     }
//
// }
//
// const c: Carrito = new Carrito( {
//     id: 0,
//     mesa_id: null,
//     pagado: false,
//     status: EstadoCarrito.CREADO,
//     mozo_id: 0,
//     is_delivery: false,
//     fecha_creacion: 'now',
//     cliente_id: null
// })

export const carritoVacio: ICarrito = {
    entregado: false,
    finalizado: false,
    id: 0,
    mesa_id: null,
    pagado: false,
    status: EstadoCarrito.CREADO,
    mozo_id: 0,
    fecha_creacion: 'now',
    cliente_id: null,
    is_delivery: false,
}

export interface IMesa {
    id: number,
    code: string,
    descripcion: string,
    activo: "1" | "0",
    carrito_activo?: ICarrito
}

interface ParametrosAPI {
    code?: string,
    descripcion?: string
}

interface CambiosEstadosApi {
    id: number,
    estado: CarritoProductoEstado
}

interface CambiosEstadosApiV2 {
    carrito_producto_id?: number,        //si se trata de una actualizacion de un carritoProducto que ya existia (debe estar presente `cantidad`, `estado`, o `borrar` (1))
    producto_id?: number,                //si se trata de un nuevo carritoProducto
    cantidad?: number,                   //cantidad de producto pedido
    estado?: CarritoProductoEstado,      //Estado de preparacion
    borrar?: LaravelBoolean              //Si se va borrar el producto (debe estar presente el carrito_producto_id)
}

type ParametrosAPICarrito = WithCarrito & {
    productosIdAgrega?: number[],
    productosIdQuita?: number[],
    clienteId?: number | null,    //null para desasignar cliente
    mesaId?: number | null,   //null es para desasignar la mesa, undefined para no hacer nada
    producto_delivery_id?: number | null,
    pagado?: LaravelBoolean,
    cambiosEstados?: CambiosEstadosApi[],
    productos?: CambiosEstadosApiV2[],
    is_delivery?: LaravelBoolean,
    finalizado?: LaravelBoolean,
}

type SortMesa = "id" | "code"

interface WithMesa extends WithQuery {
    withCarrito?: LaravelBoolean,
    withMozo?: LaravelBoolean,
    withCliente?: LaravelBoolean,
    withCarritoProductos?: LaravelBoolean
}

interface WithCarrito extends WithQuery {
    withMozo?: LaravelBoolean,
    withCliente?: LaravelBoolean,
    withProductos?: LaravelBoolean,
    withMesa?: LaravelBoolean,
    withDelivery?: LaravelBoolean,
}

export type QueryBusquedaMesa = WithMesa & {
    id: number,
    code: string,
    activo: LaravelBoolean,
}

type QueryBusquedaCarrito = WithCarrito & {
    soloActivos: LaravelBoolean,
}

export const URL_MESA = 'mesa'
export const URL_CARRITO = 'carrito'


const postableMesa: Postable<IMesa> = (mesaNuevo, mesaOriginal): ParametrosAPI => {
    const data: ParametrosAPI = {}
    // se necesitan datos
    if (mesaNuevo.code && mesaNuevo.code !== mesaOriginal?.code) {
        //se detecto cambio en nombre
        data.code = mesaNuevo.code
    }
    if (mesaNuevo.descripcion && mesaNuevo.descripcion !== mesaOriginal?.descripcion) {
        //se detecto cambio en nombre
        data.descripcion = mesaNuevo.descripcion
    }
    return data
}

const postableCarrito: Postable<ICarrito> = (carritoNuevo, carritoOriginal): ParametrosAPICarrito => {
    const data: ParametrosAPICarrito = {
        withProductos: "1",
        withCliente: '1',
        withMesa: '1',
        withMozo: '1',
    }
    if (carritoNuevo.mesa_id !== carritoOriginal?.mesa_id) {
        data.mesaId = carritoNuevo.mesa_id || null
    }
    if (carritoNuevo.cliente_id !== carritoOriginal?.cliente_id) {
        data.clienteId = carritoNuevo.cliente_id || null
    }
    if (carritoNuevo.is_delivery !== carritoOriginal?.is_delivery) {
        data.is_delivery = carritoNuevo.is_delivery ? '1' : '0'
        if (!carritoNuevo.is_delivery) {
            carritoNuevo.productos = addDeliveryToProductos(carritoNuevo)
        } else {
            data.mesaId = null      //si es delivery, le sacamos la mesa
        }
    }
    if (getDeliveryFromCarrito(carritoNuevo)?.id !== getDeliveryFromCarrito(carritoOriginal)?.id) {
        data.producto_delivery_id = getDeliveryFromCarrito(carritoNuevo)?.id ?? null
        if (isCarritoHasDelivery(carritoNuevo)) {
            data.mesaId = null      //si es delivery, le sacamos la mesa
        }
    }
    if (carritoNuevo.pagado !== carritoOriginal?.pagado) {
        data.pagado = carritoNuevo.pagado ? '1' : '0'
    }
    if (carritoNuevo.finalizado !== carritoOriginal?.finalizado) {
        data.finalizado = carritoNuevo.finalizado ? '1' : '0'
    }
    // data.cambiosEstados = carritoNuevo.productos?.filter(p1 => p1.pivot?.estado && carritoOriginal?.productos?.find(p2 => p2.id === p1.id)?.pivot?.estado !== p1.pivot.estado).map(p1 => ({id: p1.id!!, estado: p1.pivot!!.estado}))
    //Primero vamos poblando los que se van a borrar
    //luego los demas (modificacion o add)
    data.productos = (carritoOriginal?.productos?.filter(prodOrig => !isProductoDelivery(prodOrig) && !carritoNuevo?.productos?.find(prodNuev => productoCarritoCompare(prodOrig, prodNuev)))?.map((p): CambiosEstadosApiV2 => ({
        carrito_producto_id: p.pivot!!.id!!,
        borrar: "1"
    })) ?? []).concat(carritoNuevo.productos?.map((pNuev) : CambiosEstadosApiV2 => {
        const cambioEstado: CambiosEstadosApiV2 = {}
        const pOrig = carritoOriginal?.productos?.find(pO => productoCarritoCompare(pO,pNuev))
        if (isProductoDelivery(pNuev)) {

        } else if (!pOrig) { //comprobar si es producto nuevo
            cambioEstado.producto_id = pNuev.id!!
            cambioEstado.estado = pNuev.pivot?.estado ?? CarritoProductoEstado.CARRITO_PRODUCTO_ESTADO_PENDIENTE
            cambioEstado.cantidad = pNuev.pivot?.cantidad ?? 1
        } else {
            if (pNuev.pivot?.cantidad !== pOrig.pivot?.cantidad) {
                cambioEstado.carrito_producto_id = pNuev.pivot!!.id     //Como todos los POrigniales tienen pivot.id, entonces pNuevo tambien tiene pivot.id
                cambioEstado.cantidad = pNuev.pivot?.cantidad ?? 1
            }
            if (pNuev.pivot?.estado !== pOrig.pivot?.estado) {
                cambioEstado.carrito_producto_id = pNuev.pivot!!.id     //Como todos los POrigniales tienen pivot.id, entonces pNuevo tambien tiene pivot.id
                cambioEstado.estado = pNuev.pivot?.estado
            }
        }
        return cambioEstado
    })??[])
        .filter(r=> r.producto_id || r.carrito_producto_id)     // solo sirven los que tengan uno de estas propiedades
    return data
}

export const useMesas = () => {
    const busquedaMesas = useMemo((): Partial<QueryBusquedaMesa> => ({
        activo: "1",
    }), [])
    const {
        paginacion: paginacionMesas,
        setPaginacion: setPaginacionMesas,
        isModelLoading: isMesasLoading,
        errorModel: errorMesas,
        modelUpdate: productoUpdate,
        modelModificando: productoModificando,
        setModelModificando: setProductoModificando,
        handleBorrarModel: handleBorrarProducto
    } = useGenericModel<IMesa, SortMesa, QueryBusquedaMesa>(URL_MESA, 'mesa', 1, 1000, postableMesa, undefined, busquedaMesas)
    return {
        paginacionMesas,
        setPaginacionMesas,
        isMesasLoading,
        errorMesas,
        productoUpdate,
        productoModificando,
        setProductoModificando,
        handleBorrarProducto,
    }
}

export const useCarrito = () => {
    const {
        paginacionMesas,
        isMesasLoading,
        errorMesas,
        productoUpdate,
        productoModificando,
        setProductoModificando,
        handleBorrarProducto,
    } = useMesas()
    const busquedaCarritos = useMemo<QueryBusquedaCarrito>(() => ({
        soloActivos: '1',
        withCliente: '1',
        withProductos: '1',
        withMozo: '1',
        withMesa: '1',
        withDelivery: '1',
    }), [])
    const {
        paginacion: paginacionCarrito,
        updateModelInPagination: updateCarritoInPagination,
        isModelLoading: isPedidosLoading,
        modelUpdate: pedidoUpdate,
    } = useGenericModel<ICarrito, "", QueryBusquedaCarrito>(URL_CARRITO, 'carrito', 1, 1000, postableCarrito, undefined, busquedaCarritos)
    const itemBusquedaDelivery: Partial<QueryGetProductos> = useMemo(()=>({tiposProducto: [EnumTipoProducto.TIPO_DELIVERY]}),[])
    const {
        paginacion: paginacionDeliveris
    } = useProductos(1,1000,undefined,itemBusquedaDelivery)
    const deliveris = useMemo(()=>paginacionDeliveris.data,[paginacionDeliveris.data])
    const reservarMesa = useCallback((m: IMesa, c?: ICliente) => {        //cuando ya tenemos la mesa reservada y con el posible cliente (puede ser anonimo)
        const nuevoPedido = {...carritoVacio}
        nuevoPedido.mesa_id = m.id
        nuevoPedido.cliente_id = c?.id || null
        return pedidoUpdate(nuevoPedido)
    }, [pedidoUpdate])
    const {
        channelCarrito,
    } = useContext(AuthContext)
    const handleCarritoChange = useCallback((carrito: ICarrito) => {      // se dio de alta o se modifico un carrito, o se finalizo uno
        console.log(carrito)
        updateCarritoInPagination(carrito, carrito.finalizado)
    }, [updateCarritoInPagination])
    useEffect(() => {
        channelCarrito?.bind(ENVENTO_CARRITO_CREADO, handleCarritoChange)
        channelCarrito?.bind(ENVENTO_CARRITO_MODIFICADO, handleCarritoChange)
        channelCarrito?.bind(ENVENTO_CARRITO_PAGADO, handleCarritoChange)
        channelCarrito?.bind(ENVENTO_CARRITO_FINALIZADO, handleCarritoChange)
        return () => {
            channelCarrito?.unbind(ENVENTO_CARRITO_CREADO, handleCarritoChange)
            channelCarrito?.unbind(ENVENTO_CARRITO_MODIFICADO, handleCarritoChange)
            channelCarrito?.unbind(ENVENTO_CARRITO_PAGADO, handleCarritoChange)
            channelCarrito?.unbind(ENVENTO_CARRITO_FINALIZADO, handleCarritoChange)
        }
    }, [channelCarrito, handleCarritoChange])
    return {
        mesas: paginacionMesas.data,
        isMesasLoading,
        errorMesas,
        productoUpdate,
        productoModificando,
        setProductoModificando,
        handleBorrarProducto,
        reservarMesa,
        isPedidosLoading,
        pedidos: paginacionCarrito.data,
        pedidoUpdate,
        deliveris
    }
}

export function isCarritoHasDelivery(c: ICarrito): boolean {
    return !!getDeliveryFromCarrito(c)
}

export function precioCarritoProducto(item: IProducto): number {
    return (item.pivot?.cantidad ?? 1) * (item.pivot?.precio ?? item.precio)
}

export function costoCarritoProducto(item: IProducto): number {
    return (item.pivot?.cantidad ?? 1) * (item.pivot?.costo ?? item.costo)
}

/**
 * Compara dos productos de un carrito, para determinar si se trata del mismo
 * Condicion: Si al menos uno de los dos tienen `pivot.id` deben ser iguales (tambien deben ser iguales los precios y costos)
 * Si ninguno de los dos tienen `pivot.id` entonces deben tener mismo `producto.id`
 * @param p1
 * @param p2
 */
export function productoCarritoCompare(p1: IProducto, p2: IProducto): boolean {
    return (p1.pivot?.id || p2.pivot?.id) ? (p1.pivot?.id === p2.pivot?.id && p1.pivot?.precio === p2.pivot?.precio && p1.pivot?.costo === p2.pivot?.costo) : (p1.id === p2.id)
}

export function productoCarritoPivotFromProducto(item: IProducto, carrito: ICarrito, estado?: CarritoProductoEstado): PivotCarritoProducto {
    return {
        producto_id: item.id!!,
        cantidad: 1,
        precio: item.precio,
        costo: item.costo,
        carrito_id: carrito.id,
        estado: estado ?? CarritoProductoEstado.CARRITO_PRODUCTO_ESTADO_PENDIENTE,
    }
}

/**
 * Determina si el carrito puede finalizarse
 * Debe tener al menos un producto
 * Tiene que estar pagado
 * y todos los productos debe estar finalizado
 * @param c
 */
export function isCarritoFinalizable(c: ICarrito): boolean {
    return c.pagado && !!c.productos?.length && (c.productos?.every(p => p.pivot?.estado === CarritoProductoEstado.CARRITO_PRODUCTO_ESTADO_FINALIZADO) ?? false)
}

/**
 * Obtiene el producto delivery del carrito
 * @param c
 */
export function getDeliveryFromCarrito(c?: ICarrito): IProducto|undefined {
    return c?.productos?.find(p=> p?.tipo_producto?.code === EnumTipoProducto.TIPO_DELIVERY)
}

export function addDeliveryToProductos(carrito: ICarrito, del?:IProducto): IProducto[] {
    const nuevos = carrito.productos?.filter(p => p.tipo_producto?.code !== EnumTipoProducto.TIPO_DELIVERY) ?? []
    if (del) {
        nuevos.push({
            ...del,
            pivot: productoCarritoPivotFromProducto(del, carrito,CarritoProductoEstado.CARRITO_PRODUCTO_ESTADO_FINALIZADO)
        })
    }
    return nuevos;
}

export function calcularPrecioCarrito(values: ICarrito): number {
    return values.productos?.reduce<number>((prev, curr) => prev + (curr.pivot?.cantidad ?? 1) * (curr?.pivot?.precio ?? curr.precio), 0) ?? 0
}

export function calcularCostoCarrito(values: ICarrito): number {
    return values.productos?.reduce<number>((prev, curr) => prev + (curr.pivot?.cantidad ?? 1) * (curr?.pivot?.costo ?? curr.costo), 0) ?? 0
}

export enum EstadoStr {
    ESTADO_FINALIZADO = 'Finalizado',
    ESTADO_PENDIENTE_COCINA = 'En cocina',
    ESTADO_PAGADO = 'Pagado',
    ESTADO_PENDIENTE_PAGO = 'Pendiente de pago',
    ESTADO_MODIFICADO = 'Modificado',
    ESTADO_CREADO = 'Creado',
}

export function getEstadoStrFromPedido(pedido: ICarrito): EstadoStr {
    if (pedido.finalizado) {
        return EstadoStr.ESTADO_FINALIZADO
    } else if(getCarritoPedidoPendiente(pedido)) {
        return EstadoStr.ESTADO_PENDIENTE_COCINA
    } else if(pedido.pagado) {
        return EstadoStr.ESTADO_PAGADO
    } else if(pedido.productos?.length) {
        return EstadoStr.ESTADO_PENDIENTE_PAGO
    } else {
        return EstadoStr.ESTADO_CREADO
    }
}

/**
 * Determina si el carrito tiene pedidos pendientes de finalizacion
 * @param pedido
 * retorna true si tiene productos y si algunos de los productos tiene pivot.estado distinto de finalizado
 */
export function getCarritoPedidoPendiente(pedido: ICarrito): boolean {
    return !!pedido.productos?.length && pedido.productos.some(prod => prod.pivot?.estado !== CarritoProductoEstado.CARRITO_PRODUCTO_ESTADO_FINALIZADO)
}

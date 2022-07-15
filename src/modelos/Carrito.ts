import {LaravelBoolean, Postable, useGenericModel, WithQuery} from "./Generico";
import {useCallback, useContext, useEffect, useMemo} from "react";
import {ICliente} from "./Cliente";
import {AuthContext} from "../context/AuthProvider";
import {mostrarMensaje} from "../utils/utils";
import {IUsuario} from "./Usuario";
import {IProducto} from "./Producto";


export enum EstadoCarrito {
    CREADO = 'creado',
    MODIFICADO = 'modificado',
    FINALIZADO = 'finalizado',
}

export const ESTADO_CARRITO_OCUPADO: EstadoCarrito[] = [EstadoCarrito.CREADO, EstadoCarrito.MODIFICADO]

// type EstadoCarrito2 = "creado" | "finalizado"
// export const CARRITO_ESTADO_CREADO: EstadoCarrito = "creado"

const ENVENTO_CARRITO_CREADO: EstadoCarrito = EstadoCarrito.CREADO
const ENVENTO_CARRITO_MODIFICADO: EstadoCarrito = EstadoCarrito.MODIFICADO

export interface ICarrito {
    id: number,
    cliente?: ICliente,
    mesa?: IMesa,
    cliente_id: number|null,
    fecha_creacion: string,
    is_delivery: boolean,
    mesa_id: number|null,
    pagado: boolean,
    status: EstadoCarrito,
    mozo?: IUsuario,
    mozo_id: number,
    productos?: IProducto[]
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
    id: 0,
    mesa_id: null,
    pagado: false,
    status: EstadoCarrito.CREADO,
    mozo_id: 0,
    is_delivery: false,
    fecha_creacion: 'now',
    cliente_id: null
}

export interface IMesa {
    id:number,
    code:string,
    descripcion: string,
    activo: "1" | "0",
    carrito_activo?: ICarrito
}

interface ParametrosAPI {
    code?: string,
    descripcion?: string
}

type ParametrosAPICarrito = WithCarrito & {
    productosIdAgrega?: number[],
    productosIdQuita?: number[],
    clienteId?: number|null,    //null para desasignar cliente
    mesaId?: number|null,   //null es para desasignar la mesa, undefined para no hacer nada
    is_delivery?: LaravelBoolean
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
    console.log({carritoNuevo, carritoOriginal})
    data.productosIdAgrega = carritoNuevo.productos?.filter(p1=>p1.id && !carritoOriginal?.productos?.find(p2 => p2.id === p1.id && (p2.pivot?.precio === p1.pivot?.precio && p2.pivot?.costo === p1.pivot?.costo)))?.map(p=>p.id as number) || []
    data.productosIdQuita = carritoOriginal?.productos?.filter(p1=>p1.id && !carritoNuevo?.productos?.find(p2 => p2.id === p1.id && (p2.pivot?.precio === p1.pivot?.precio && p2.pivot?.costo === p1.pivot?.costo)))?.map(p=>p.id as number) || []
    if (carritoNuevo.mesa_id !== carritoOriginal?.mesa_id) {
        data.mesaId = carritoNuevo.mesa_id || null
    }
    if (carritoNuevo.cliente_id !== carritoOriginal?.cliente_id) {
        data.clienteId = carritoNuevo.cliente_id || null
    }
    if (carritoNuevo.is_delivery !== carritoOriginal?.is_delivery) {
        data.is_delivery = carritoNuevo.is_delivery ? '1' : '0'
        if (data.is_delivery) {
            data.mesaId = null      //si es delivery, le sacamos la mesa
        }
    }
    return data
}

export const useMesas = () => {
    const busquedaMesas = useMemo((): Partial<QueryBusquedaMesa>=>({
        activo: "1",
    }),[])
    const {
        paginacion: paginacionMesas,
        setPaginacion: setPaginacionMesas,
        isModelLoading: isMesasLoading,
        errorModel: errorMesas,
        modelUpdate: productoUpdate,
        modelModificando: productoModificando,
        setModelModificando: setProductoModificando,
        handleBorrarModel: handleBorrarProducto
    } = useGenericModel<IMesa, SortMesa, QueryBusquedaMesa>(URL_MESA,'mesa', 1, 1000, postableMesa, undefined, busquedaMesas)
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

export const useCarrito =  () => {
    const {
        paginacionMesas,
        setPaginacionMesas,
        isMesasLoading,
        errorMesas,
        productoUpdate,
        productoModificando,
        setProductoModificando,
        handleBorrarProducto,
    } = useMesas()
    const busquedaCarritos = useMemo<QueryBusquedaCarrito>(()=>({
        soloActivos: '1',
        withCliente: '1',
        withProductos: '1',
        withMozo: '1',
        withMesa: '1',
    }),[])
    const {
        paginacion: paginacionCarrito,
        updateModelInPagination: updateCarritoInPagination,
        isModelLoading: isPedidosLoading,
        // errorModel: errorPedidos,
        modelUpdate: pedidoUpdate,
        // modelModificando: pedidoModificando,
        // setModelModificando: setPedidoModificando,
        // handleBorrarModel: handleBorrarPedido
    } = useGenericModel<ICarrito, "", QueryBusquedaCarrito>(URL_CARRITO,'carrito', 1, 1000, postableCarrito,undefined,busquedaCarritos)
    const reservarMesa = useCallback((m:IMesa, c?:ICliente)=>{        //cuando ya tenemos la mesa reservada y con el posible cliente (puede ser anonimo)
        const nuevoPedido = {...carritoVacio}
        nuevoPedido.mesa_id = m.id
        nuevoPedido.cliente_id = c?.id || null
        return pedidoUpdate(nuevoPedido)
    },[pedidoUpdate])
    const {
        channelCarrito,
    } = useContext(AuthContext)
    const handleCarritoChange = useCallback((carrito: ICarrito)=>{      // se dio de alta o se modifico un carrito
        updateCarritoInPagination(carrito)
    },[updateCarritoInPagination])
    useEffect(()=>{
        channelCarrito?.bind(ENVENTO_CARRITO_CREADO,handleCarritoChange)
        channelCarrito?.bind(ENVENTO_CARRITO_MODIFICADO,handleCarritoChange)
        return ()=>{
            channelCarrito?.unbind(ENVENTO_CARRITO_CREADO,handleCarritoChange)
            channelCarrito?.unbind(ENVENTO_CARRITO_MODIFICADO,handleCarritoChange)
        }
    },[channelCarrito, handleCarritoChange])
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
        pedidoUpdate
    }
}


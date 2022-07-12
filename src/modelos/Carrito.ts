import {ItemSorteado, LaravelBoolean, Postable, useGenericModel, WithQuery} from "./Generico";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {ICliente} from "./Cliente";
import axios from "axios";
import {AuthContext} from "../context/AuthProvider";
import {mostrarMensaje} from "../utils/utils";
import {IUsuario} from "./Usuario";
import {IProducto} from "./Producto";


export enum EstadoCarrito {
    CREADO = 'creado',
    FINALIZADO = 'finalizado',
}

export const ESTADO_CARRITO_OCUPADO: EstadoCarrito[] = [EstadoCarrito.CREADO]

// type EstadoCarrito2 = "creado" | "finalizado"
// export const CARRITO_ESTADO_CREADO: EstadoCarrito = "creado"

const ENVENTO_CARRITO_CREADO: EstadoCarrito = EstadoCarrito.CREADO

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

export enum EstadoMesa {
    ESTADO_LIBRE= 'Libre',
    ESTADO_ASIGNADO = 'Asignado'
}
export interface IMesa {
    id:number,
    code:string,
    descripcion: string,
    activo: "1" | "0",
    carrito_activo?: ICarrito
}

export function getStatusFromMesa(m: IMesa): EstadoMesa {
    if (m.carrito_activo) {
        return EstadoMesa.ESTADO_ASIGNADO
    } else {
        return EstadoMesa.ESTADO_LIBRE
    }
}

interface ParametrosAPI {
    code?: string,
    descripcion?: string
}

type ParametrosAPICarrito = WithCarrito & {
    productosIdAgrega?: number[],
    productosIdQuita?: number[],
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
    data.productosIdAgrega = carritoNuevo.productos?.filter(p1=>p1.id && !carritoOriginal?.productos?.find(p2 => p2.id === p1.id))?.map(p=>p.id as number) || []
    data.productosIdQuita = carritoOriginal?.productos?.filter(p1=>p1.id && !carritoNuevo?.productos?.find(p2 => p2.id === p1.id))?.map(p=>p.id as number) || []
    return data
}

export const useCarrito =  () => {
    const {
        setErrorException
    } = useContext(AuthContext)
    const [asignacionLoading,setAsignacionLoading] = useState(false)
    const reservarMesa = useCallback((m:IMesa, c?:ICliente)=>{        //cuando ya tenemos la mesa reservada y con el posible cliente (puede ser anonimo)
        setAsignacionLoading(true)
        axios.post(URL_MESA + '/' + m.id + '/asignar',{
            clienteId: c?.id
        })
            .catch(setErrorException)
            .finally(()=>setAsignacionLoading(false))
    },[setErrorException])
    const busquedaCarritos = useMemo<QueryBusquedaCarrito>(()=>({
        soloActivos: '1',
        withCliente: '1',
        withProductos: '1',
        withMozo: '1',
        withMesa: '1',
    }),[])
    const {
        paginacion: paginacionCarrito,
        setPaginacion: setPaginacionCarrito,
        isModelLoading: isPedidosLoading,
        // errorModel: errorPedidos,
        modelUpdate: pedidoUpdate,
        // modelModificando: pedidoModificando,
        // setModelModificando: setPedidoModificando,
        // handleBorrarModel: handleBorrarPedido
    } = useGenericModel<ICarrito, "", QueryBusquedaCarrito>(URL_CARRITO,'carrito', 1, 1000, postableCarrito,undefined,busquedaCarritos)
    const busquedaMesas = useMemo((): Partial<QueryBusquedaMesa>=>({
        activo: "1",
        // withCarrito: "1",
        // withMozo: '1',
        // withCliente: '1',
        // withCarritoProductos: '1',
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
    const {
        channelCarrito,
    } = useContext(AuthContext)
    const handleMesaAsignada = useCallback((mesa: IMesa)=>{
        const mesas = [...paginacionMesas.data]
        const indexMesa = mesas.findIndex(m=> m.id === mesa.id)
        if (indexMesa >= 0) {   //se encontro
            mesas.splice(indexMesa, 1, mesa)
            setPaginacionMesas({...paginacionMesas, data: mesas})
        } else {
            mostrarMensaje("No se encontro la mesa o no se recibio la mesa", 'error')
        }
    },[paginacionMesas, setPaginacionMesas])
    const handleCarritoCreado = useCallback((carrito: ICarrito)=>{      // se dio de alta un nuevo carrito
        console.log(carrito)
        if (carrito.mesa) {
            handleMesaAsignada({...carrito.mesa, carrito_activo: carrito})
        }
        setPaginacionCarrito({...paginacionCarrito, data: [...paginacionCarrito.data,carrito]})
    },[handleMesaAsignada, paginacionCarrito, setPaginacionCarrito])
    useEffect(()=>{
        channelCarrito?.bind(ENVENTO_CARRITO_CREADO,handleCarritoCreado)
        return ()=>{
            channelCarrito?.unbind(ENVENTO_CARRITO_CREADO,handleCarritoCreado)
        }
    },[channelCarrito, handleCarritoCreado])
    return {
        mesas: paginacionMesas.data,
        isMesasLoading,
        errorMesas,
        productoUpdate,
        productoModificando,
        setProductoModificando,
        handleBorrarProducto,
        reservarMesa,
        asignacionLoading,
        isPedidosLoading,
        pedidos: paginacionCarrito.data,
        pedidoUpdate
    }
}


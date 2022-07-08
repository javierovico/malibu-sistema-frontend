import {ItemSorteado, LaravelBoolean, Postable, useGenericModel} from "./Generico";
import {useCallback, useContext, useEffect, useState} from "react";
import {ICliente} from "./Cliente";
import axios from "axios";
import {AuthContext} from "../context/AuthProvider";
import {mostrarMensaje} from "../utils/utils";
import {IUsuario} from "./Usuario";


type EstadoCarrito = "creado" | "finalizado"

const EVENTO_CARRITO_MESA_ASIGNADA: string = 'mesa-asignada'

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
    mozo?: IUsuario

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

type SortMesa = "id" | "code"

export interface QueryBusquedaMesa {
    id: number,
    code: string,
    activo: LaravelBoolean,
    withCarrito: LaravelBoolean,
    withMozo: LaravelBoolean,
    withCliente: LaravelBoolean
}

export const URL_MESA = 'mesa'


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


export const useMesas =  (page: number, perPage: number, sortBy?: ItemSorteado<SortMesa>[], itemsBusqueda?: Partial<QueryBusquedaMesa>) => {
    const {
        paginacion,
        setPaginacion,
        isModelLoading: isMesasLoading,
        errorModel: errorMesas,
        modelUpdate: productoUpdate,
        modelModificando: productoModificando,
        setModelModificando: setProductoModificando,
        handleBorrarModel: handleBorrarProducto
    } = useGenericModel<IMesa, SortMesa, QueryBusquedaMesa>(URL_MESA,'mesa', page, perPage, postableMesa, sortBy, itemsBusqueda)
    const {
        channelCarrito,
    } = useContext(AuthContext)
    const handleMesaAsignada = useCallback((mesa: IMesa)=>{
        const mesas = [...paginacion.data]
        const indexMesa = mesas.findIndex(m=> m.id === mesa.id)
        if (indexMesa >= 0) {   //se encontro
            mesas.splice(indexMesa, 1, mesa)
            setPaginacion({...paginacion, data: mesas})
        } else {
            mostrarMensaje("No se encontro la mesa o no se recibio la mesa", 'error')
        }
    },[paginacion, setPaginacion])
    useEffect(()=>{
        channelCarrito?.bind(EVENTO_CARRITO_MESA_ASIGNADA,handleMesaAsignada)
        return ()=>{
            channelCarrito?.unbind(EVENTO_CARRITO_MESA_ASIGNADA,handleMesaAsignada)
        }
    },[channelCarrito, handleMesaAsignada])
    return {
        paginacion,
        isMesasLoading,
        errorMesas,
        productoUpdate,
        productoModificando,
        setProductoModificando,
        handleBorrarProducto
    }
}

export function useCarritos() {
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
    return {
        reservarMesa,
        asignacionLoading
    }
}

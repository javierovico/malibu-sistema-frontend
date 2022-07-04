import {IArchivo} from "./Archivo";
import {ItemSorteado, Postable, useGenericModel} from "./Generico";


export const URL_CLIENTE = 'cliente'
export interface ICliente {
    id?: number|null,
    nombre: string,
    ruc: string|null,
    telefono: string|null,
    barrio: string|null,
    ciudad: string|null,
    imagen?: IArchivo|null,
}

export const clienteVacio: ICliente = {
    id: null,
    ruc: '',
    telefono: '',
    barrio: '',
    ciudad: '',
    nombre: '',
}

export type TipoBusqueda = {
    [n: string]: string|string[]|undefined;
}

export interface QueryBusquedaCliente extends TipoBusqueda{
    nombre: string,
    ruc: string,
    id: string,
    telefono: string,
    barrio: string,
    ciudad: string,
}

export type SortCliente = "id" | "ruc" | "telefono" | "nombre" | "ciudad" | "barrio"


interface ParametrosAPI {
    nombre?: string,
    base64Image?: string,
    deleteImage?: "si" | "no",
    ruc?:string,
    telefono?:string,
    barrio?:string,
    ciudad?:string
}

const postableCliente: Postable<ICliente> = (clienteNuevo, clienteOriginal): ParametrosAPI => {
    const data: ParametrosAPI = {}
    // se necesitan datos
    if (clienteNuevo.nombre && clienteNuevo.nombre !== clienteOriginal?.nombre) {
        //se detecto cambio en nombre
        data.nombre = clienteNuevo.nombre
    }
    if (clienteNuevo.imagen?.url !== clienteOriginal?.imagen?.url) {
        //se detecto cambio
        if (clienteNuevo.imagen?.url) {
            data.base64Image = clienteNuevo.imagen.url
        } else {
            //borrar imagen => producto original tenia url y producto subiendo no
            data.deleteImage = 'si'
        }
    }
    if (clienteNuevo.ruc && clienteNuevo.ruc !== clienteOriginal?.ruc) {
        //se detecto cambio en nombre
        data.ruc = clienteNuevo.ruc
    }
    if (clienteNuevo.barrio && clienteNuevo.barrio !== clienteOriginal?.barrio) {
        //se detecto cambio en nombre
        data.barrio = clienteNuevo.barrio
    }
    if (clienteNuevo.ciudad && clienteNuevo.ciudad !== clienteOriginal?.ciudad) {
        //se detecto cambio en nombre
        data.ciudad = clienteNuevo.ciudad
    }
    if (clienteNuevo.telefono && clienteNuevo.telefono !== clienteOriginal?.telefono) {
        //se detecto cambio en nombre
        data.telefono = clienteNuevo.telefono
    }
    return data
}


export const useCliente =  (page: number, perPage: number, sortBy?: ItemSorteado<SortCliente>[], itemsBusqueda?: Partial<QueryBusquedaCliente>) => {
    const {
        paginacion,
        isModelLoading: isClientesLoading,
        errorModel: errorCliente,
        modelUpdate: clienteUpdate,
        modelModificando: clienteModificando,
        setModelModificando: setClienteModificando,
        handleBorrarModel: handleBorrarCliente
    } = useGenericModel<ICliente, SortCliente, QueryBusquedaCliente>(URL_CLIENTE,'cliente', page, perPage, postableCliente, sortBy, itemsBusqueda)
    return {
        paginacion,
        isClientesLoading,
        errorCliente,
        clienteUpdate,
        clienteModificando,
        setClienteModificando,
        handleBorrarCliente
    }
}



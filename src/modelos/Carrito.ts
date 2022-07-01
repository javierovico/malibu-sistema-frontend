import {ItemSorteado, LaravelBoolean, Postable, useGenericModel} from "./Generico";

export interface IMesa {
    id:number,
    code:string,
    descripcion: string,
    activo: "1" | "0"
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
    withCarrito: LaravelBoolean
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
        isModelLoading: isMesasLoading,
        errorModel: errorMesas,
        modelUpdate: productoUpdate,
        modelModificando: productoModificando,
        setModelModificando: setProductoModificando,
        handleBorrarModel: handleBorrarProducto
    } = useGenericModel<IMesa, SortMesa, QueryBusquedaMesa>(URL_MESA, page, perPage, postableMesa, sortBy, itemsBusqueda)
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



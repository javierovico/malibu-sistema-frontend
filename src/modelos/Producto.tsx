import {editorModel, ItemSorteado, Postable, useGenericModel} from "./Generico";
import axios from "axios";
import {errorRandomToIError, IError} from "./ErrorModel";
import {IArchivo} from "./Archivo";

export const URL_GET_PRODUCTOS = 'producto'

export const PRODUCTO_TIPO_SIMPLE = 'simple'
export const PRODUCTO_TIPO_COMBO = 'combo'

export interface ITipoProducto {
    code: TipoProductoAdmitido,
    descripcion: string,
}

export const PRODUCTO_TIPOS_ADMITIDOS: ITipoProducto[] = [
    {
        code: PRODUCTO_TIPO_SIMPLE,
        descripcion: 'Tipo Simple'
    },
    {
        code: PRODUCTO_TIPO_COMBO,
        descripcion: 'Tipo Combo'
    }
]

export type TipoProductoAdmitido = typeof PRODUCTO_TIPO_SIMPLE | typeof PRODUCTO_TIPO_COMBO

export interface IProducto {
    producto_combos?: IProducto[]
    tipo_producto?: ITipoProducto,
    imagen?: IArchivo;
    id: number|null,        //si es null es porque no existe
    codigo: string,
    nombre: string,
    descripcion: string,
    precio: number,
    costo: number,
    s3_key: string,
    url: string
}

export const productoVacio: IProducto = {
    precio: 0,
    costo: 0,
    nombre: '',
    codigo: '',
    id: null,
    url: '',
    descripcion: '',
    s3_key: '',
    tipo_producto: {
        code: PRODUCTO_TIPO_SIMPLE,
        descripcion: 'Tipo Simple'
    }
}


export interface QueryGetProductos {
    id: number,
    codigo: string,
    nombre: string,
    tiposProducto: TipoProductoAdmitido[]
}

export type SortsProductos =  'id' | 'codigo' | 'nombre' | 'tipo_producto_id' | 'precio' | 'costo'

export type TipoBusquedaProductos = 'id' | 'codigo' | 'nombre'

interface ParametrosAPI {
    nombre?: string,
    base64Image?: string,
    deleteImage?: "si" | "no",
    codigo?: string,
    costo?: number,
    precio?: number,
    tipoProducto?: string,
    combos?: number[]
}

export const useProductos =  (page: number, perPage: number, sortBy?: ItemSorteado<SortsProductos>[], itemsBusqueda?: Partial<QueryGetProductos>) => {
    const {
        paginacion,
        isModelLoading: isProductosLoading,
        errorModel: errorProductos,
        modelUpdate: productoUpdate,
        modelModificando: productoModificando,
        setModelModificando: setProductoModificando,
        handleBorrarModel: handleBorrarProducto
    } = useGenericModel(URL_GET_PRODUCTOS, page, perPage, postableProducto, sortBy, itemsBusqueda)
    return {
        paginacion,
        isProductosLoading,
        errorProductos,
        productoUpdate,
        productoModificando,
        setProductoModificando,
        handleBorrarProducto
    }
}

const postableProducto: Postable<IProducto> = (productoSubiendo, productoOriginal) => {
    const data: Record<string,any> = {}
    // se necesitan datos
    if (productoSubiendo.nombre && productoSubiendo.nombre !== productoOriginal?.nombre) {
        //se detecto cambio en nombre
        data.nombre = productoSubiendo.nombre
    }
    if (productoSubiendo.imagen?.url !== productoOriginal?.imagen?.url) {
        //se detecto cambio
        if (productoSubiendo.imagen?.url) {
            data.base64Image = productoSubiendo.imagen.url
        } else {
            //borrar imagen => producto original tenia url y producto subiendo no
            data.deleteImage = 'si'
        }
    }
    if (productoSubiendo.codigo && productoSubiendo.codigo !== productoOriginal?.codigo) {
        //se detecto cambio en nombre
        data.codigo = productoSubiendo.codigo
    }
    if (productoSubiendo.precio && productoSubiendo.precio !== productoOriginal?.precio) {
        //se detecto cambio en nombre
        data.precio = productoSubiendo.precio
    }
    if (productoSubiendo.costo && productoSubiendo.costo !== productoOriginal?.costo) {
        //se detecto cambio en nombre
        data.costo = productoSubiendo.costo
    }
    if (productoSubiendo.tipo_producto?.code && productoSubiendo.tipo_producto.code !== productoOriginal?.tipo_producto?.code) {
        data.tipoProducto = productoSubiendo.tipo_producto.code
    }
    if (productoSubiendo.tipo_producto?.code === PRODUCTO_TIPO_COMBO) {
        const combosNuevos: IProducto[] = productoSubiendo.producto_combos || []
        const combosViejos: IProducto[] = productoOriginal?.producto_combos || []
        if (combosNuevos.length !== combosViejos.length || combosNuevos.some(p1=> !combosViejos.find(p2=> p2.id === p1.id))) {
            data.combos = combosNuevos.map(p1=>p1.id || 0)
        }
    }
    return data
}

export function isTipoProductoAdmitido(a: any): a is TipoProductoAdmitido{
    return PRODUCTO_TIPOS_ADMITIDOS.map(tp=>tp.code.toString()).includes(a)
}

import {ItemSorteado, Postable, useGenericModel} from "./Generico";
import {IArchivo} from "./Archivo";
import {TipoBusqueda} from "./Cliente";

export const URL_GET_PRODUCTOS = 'producto'

/**
 * TIPO PRODUCTO
 * Donde Actualizar:
 * EnumTipoProducto
 * PRODUCTO_TIPOS_ADMITIDOS
 * TipoProductoAdmitido
 */

export interface ITipoProducto {
    code: EnumTipoProducto,
    descripcion: string,
}


// export type TipoProductoAdmitido = typeof PRODUCTO_TIPO_SIMPLE | typeof PRODUCTO_TIPO_COMBO

export enum EnumTipoProducto {
    TIPO_SIMPLE = 'simple',
    TIPO_COMBO = 'combo',
    TIPO_DELIVERY = 'delivery'
}

// export const PRODUCTO_TIPO_SIMPLE = 'simple'
// export const PRODUCTO_TIPO_COMBO = 'combo'

export const PRODUCTO_TIPOS_ADMITIDOS: ITipoProducto[] = [
    {
        code: EnumTipoProducto.TIPO_SIMPLE,
        descripcion: 'Tipo Simple'
    },
    {
        code: EnumTipoProducto.TIPO_COMBO,
        descripcion: 'Tipo Combo'
    },
    {
        code: EnumTipoProducto.TIPO_DELIVERY,
        descripcion: 'Costo Delivery'
    }
]

// export const CARRITO_PRODUCTO_ESTADO_INICIADO = 'iniciado'
// export const CARRITO_PRODUCTO_ESTADO_PREPARACION = 'preparacion'
//
// type CarritoProductoEstado2 = typeof CARRITO_PRODUCTO_ESTADO_INICIADO | typeof CARRITO_PRODUCTO_ESTADO_PREPARACION

export enum CarritoProductoEstado {
    CARRITO_PRODUCTO_ESTADO_PENDIENTE = 'pendiente',
    CARRITO_PRODUCTO_ESTADO_PREPARACION = 'preparacion',
    CARRITO_PRODUCTO_ESTADO_FINALIZADO = 'finalizado',
}

export const TIPOS_PRODUCTOS_SELECCIONABLES = [EnumTipoProducto.TIPO_COMBO,EnumTipoProducto.TIPO_SIMPLE]

/** Son los estados en los cuales todavia se puede cancelar el producto*/
export const CARRITO_PRODUCTO_ESTADOS_CANCELABLES: CarritoProductoEstado[] = [CarritoProductoEstado.CARRITO_PRODUCTO_ESTADO_PREPARACION, CarritoProductoEstado.CARRITO_PRODUCTO_ESTADO_FINALIZADO]

/**
 * Indica el orden en el que debe transcurrir el estado del producto
 */
export const CARRITO_PRODUCTO_SUCESION_ESTADOS: CarritoProductoEstado[] = [
    CarritoProductoEstado.CARRITO_PRODUCTO_ESTADO_PENDIENTE,
    CarritoProductoEstado.CARRITO_PRODUCTO_ESTADO_PREPARACION,
    CarritoProductoEstado.CARRITO_PRODUCTO_ESTADO_FINALIZADO
]

export interface PivotCarritoProducto {
    carrito_id: number,
    costo: number,
    precio: number,
    cantidad: number,
    estado: CarritoProductoEstado,
    producto_id: number,
    created_at: string,
    updated_at: string,
}

export interface IProducto {
    producto_combos?: IProducto[]
    tipo_producto?: ITipoProducto,
    imagen?: IArchivo;
    id: number | null,        //si es null es porque no existe
    codigo: string,
    nombre: string,
    descripcion: string,
    precio: number,
    costo: number,
    s3_key: string,
    url: string,
    pivot?: PivotCarritoProducto
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
        code: EnumTipoProducto.TIPO_SIMPLE,
        descripcion: 'Tipo Simple'
    }
}


export interface QueryGetProductos extends TipoBusqueda{
    id: string,
    codigo: string,
    nombre: string,
    tiposProducto: EnumTipoProducto[]
}

export type SortsProductos = 'id' | 'codigo' | 'nombre' | 'tipo_producto_id' | 'precio' | 'costo' | 'estado'

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

/**
 * Nos indica si el producto puede ser sacado de un carrito
 * @param p
 */
export function productoQuitable(p: IProducto): boolean
{
    return (!(p.pivot?.estado) || !CARRITO_PRODUCTO_ESTADOS_CANCELABLES.includes(p.pivot?.estado))
}

export const useProductos = (page: number, perPage: number, sortBy?: ItemSorteado<string>[], itemsBusqueda?: Partial<QueryGetProductos>) => {
    const {
        paginacion,
        isModelLoading: isProductosLoading,
        errorModel: errorProductos,
        modelUpdate: productoUpdate,
        modelModificando: productoModificando,
        setModelModificando: setProductoModificando,
        handleBorrarModel: handleBorrarProducto
    } = useGenericModel(URL_GET_PRODUCTOS, 'producto', page, perPage, postableProducto, sortBy, itemsBusqueda)
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
    const data: ParametrosAPI = {}
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
    if (productoSubiendo.tipo_producto?.code === EnumTipoProducto.TIPO_COMBO) {
        const combosNuevos: IProducto[] = productoSubiendo.producto_combos || []
        const combosViejos: IProducto[] = productoOriginal?.producto_combos || []
        if (combosNuevos.length !== combosViejos.length || combosNuevos.some(p1 => !combosViejos.find(p2 => p2.id === p1.id))) {
            data.combos = combosNuevos.map(p1 => p1.id || 0)
        }
    }
    return data
}

export function isTipoProductoAdmitido(a: any): a is EnumTipoProducto {
    return Object.values(EnumTipoProducto).includes(a)
}

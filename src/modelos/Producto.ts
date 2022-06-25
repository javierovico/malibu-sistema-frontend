import {useCallback} from "react";
import axios from "axios";
import {errorRandomToIError} from "./ErrorModel";

export const PRODUCT_TIPO_SIMPLE = 'simple'
export const PRODUCTO_TIPO_COMBO = 'combo'

export type TipoProductoAdmitido = typeof PRODUCT_TIPO_SIMPLE | typeof PRODUCTO_TIPO_COMBO


export interface ITipoProducto {
    code: TipoProductoAdmitido
}

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

export interface IArchivo {
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
        code: PRODUCT_TIPO_SIMPLE
    }
}

export const URL_GET_PRODUCTOS = 'producto'


interface ParametrosAPI {
    nombre?: string,
    base64Image?: string,
    deleteImage?: "si" | "no",
    codigo?: string,
    costo?: number,
    precio?: number,
    tipoProducto?: string
}

/**
 * productoSubiendo: El producto que se va subir (nulo si se va eliminar)
 * productoOriginal: El producto original (nulo si se va crear )
 */
export const useEditorProducto = () => useCallback((productoSubiendo?: IProducto, productoOriginal?: IProducto)=>{
    return new Promise<IProducto|undefined>((resolve,reject)=> {
        let url = URL_GET_PRODUCTOS
        let method: string
        const data: ParametrosAPI = {}
        if (productoOriginal && productoOriginal.id) {
            //se va hacer una operacion sobre un producto existente
            url += '/' + productoOriginal.id
            if (!productoSubiendo) {
                // no hay un producto que se va subir, entonces es un delete
                method = 'delete'
            } else {
                // hay un nuevo producto, entonces es un update
                method = 'put'
            }
        } else {
            //se va crear uno nuevo
            method = 'post'
        }
        url += '?XDEBUG_SESSION_START=PHPSTORM'
        if (productoSubiendo && (method === 'put' || method === 'post')) {
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
        }
        if (Object.keys(data).length) {
            axios.request({
                data,
                url,
                method
            })
                .then(({data}) => resolve(data.data.producto))
                .catch((e)=>{
                    reject(errorRandomToIError(e,{
                        tipoProducto: 'tipo_producto.code'
                    }))
                })
        } else {
            reject({
                name: "No se detecto ningun cambio",
                message: "No se detecto ningun cambio para actualizar/crear el producto",
            })
        }
    })
},[])

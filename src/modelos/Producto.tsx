import React, {useCallback, useContext, useEffect, useState} from "react";
import axios from "axios";
import {errorRandomToIError, IError} from "./ErrorModel";
import {PaginacionVacia, ResponseAPIPaginado} from "./ResponseAPI";
import {AuthContext} from "../context/AuthProvider";
import VistaError from "../components/UI/VistaError";

export const PRODUCTO_TIPO_SIMPLE = 'simple'
export const PRODUCTO_TIPO_COMBO = 'combo'

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

export function isTipoProductoAdmitido(a: any): a is TipoProductoAdmitido{
    return PRODUCTO_TIPOS_ADMITIDOS.map(tp=>tp.code.toString()).includes(a)
}


export interface ITipoProducto {
    code: TipoProductoAdmitido,
    descripcion: string,
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
        code: PRODUCTO_TIPO_SIMPLE,
        descripcion: 'Tipo Simple'
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
    tipoProducto?: string,
    combos?: number[]
}

/**
 * productoSubiendo: El producto que se va subir (nulo si se va eliminar)
 * productoOriginal: El producto original (nulo si se va crear )
 */
export const useEditorProducto = () => useCallback((productoSubiendo?: IProducto, productoOriginal?: IProducto)=>{
    return new Promise<IProducto|undefined>((resolve,reject)=> {
        let url = URL_GET_PRODUCTOS
        let method: "put" | "delete" | "post"
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
        if (productoSubiendo && method !== "delete") {
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
        }
        if (Object.keys(data).length || method === "delete") {
            axios.request({
                data,
                url,
                method
            })
                .then(({data}) => resolve(data.data.producto))
                .catch((e)=>{
                    reject(errorRandomToIError(e,{
                        tipoProducto: 'tipo_producto.code',
                        combos: 'producto_combos'
                    }))
                })
        } else {
            const error: IError = {
                title: "No se detecto ningun cambio",
                message: "No se detecto ningun cambio para actualizar/crear el producto",
                items: [],
                code: 'sinCambios'
            }
            reject(error)
        }
    })
},[])


export type TipoBusqueda = "id"|"codigo"|"nombre"
export type PosiblesOrdenacionesProducto = "id" | "codigo" | "nombre" | "tipoProducto" | "precio" | "costo" | null

export const useProductos = (busqueda: string, page: number, perPage: number, tipoBusqueda: TipoBusqueda, sortBy: PosiblesOrdenacionesProducto = null) => {
    const [paginacion, setPaginacion] = useState<ResponseAPIPaginado<IProducto>>(PaginacionVacia);
    const [isProductosLoading, setIsProductoLoading] = useState<boolean>(true)
    const [errorProductos, setErrorProductos] = useState<JSX.Element|undefined>();
    const {setErrorException} = useContext(AuthContext)
    useEffect(()=>{
        setIsProductoLoading(true)
        setPaginacion(PaginacionVacia)
        setErrorProductos(undefined)
        axios.get<ResponseAPIPaginado<IProducto>>(URL_GET_PRODUCTOS,{
            params:{
                page,
                perPage,
                [tipoBusqueda]: busqueda,
                sortBy
            }
        })
            .then(({data}) => {
                setPaginacion(data)
            })
            .catch(e=> {
                setErrorException(e)
                setErrorProductos(<VistaError error={errorRandomToIError(e)}/>)
                setPaginacion(PaginacionVacia)
            })
            .finally(()=>setIsProductoLoading(false))
    },[busqueda, sortBy, page, perPage, setErrorException, tipoBusqueda])
    const editorProducto = useEditorProducto()
    const [productoModificando, setProductoModificando] = useState<IProducto>()
    const productoUpdate = useCallback((p: IProducto, borrar: boolean = false)=>{
        return new Promise<void>((res,rej) => {
            const posicionItem: number = paginacion.data.findIndex(pItem => pItem.id === p.id)      // -1 si se va agregar nuevo
            const productoOriginal = (posicionItem>=0) ? paginacion.data[posicionItem] : undefined  //undefind si se vacrear
            editorProducto(borrar?undefined:p, productoOriginal)
                .then((productoSubido)=>{
                    const nuevaPaginacion = {...paginacion}
                    nuevaPaginacion.data.splice((posicionItem<0)?0:posicionItem,(posicionItem<0)?0:1,...productoSubido?[productoSubido]:[])
                    setPaginacion(nuevaPaginacion)
                    setProductoModificando(productoSubido)
                    res()
                })
                .catch(rej)
        });
    },[editorProducto, paginacion])

    const handleBorrarProducto = useCallback((p: IProducto) => {
        return new Promise<void>(res=>{
            productoUpdate(p, true)
                .then(()=>{
                    const nuevaPaginacion = {...paginacion}
                    const posicionItem: number = paginacion.data.findIndex(pItem => pItem.id === p.id)
                    nuevaPaginacion.data.splice(posicionItem,1)
                    setPaginacion(nuevaPaginacion)
                })
                .catch((e)=>{
                    setErrorException(e)
                })
                .finally(res)
        })
    },[productoUpdate, paginacion, setErrorException])

    return {
        paginacion,
        isProductosLoading,
        errorProductos,
        productoUpdate,
        productoModificando,
        setProductoModificando,
        handleBorrarProducto,
    }
}

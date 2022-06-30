import {SortOrder} from "antd/es/table/interface";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {PaginacionVacia, ResponseAPIPaginado} from "./ResponseAPI";
import {AuthContext} from "../context/AuthProvider";
import axios from "axios";
import VistaError from "../components/UI/VistaError";
import {errorRandomToIError, IError} from "./ErrorModel";
import {IProducto, PRODUCTO_TIPO_COMBO, productoVacio, URL_GET_PRODUCTOS} from "./Producto";

export type ItemSorteado<T extends string> = {
    code: T,
    orden?: SortOrder
}

export interface ItemBusqueda<T> {
    columna: keyof T,
    valor: string|number|string[]|number[]
}

export interface Ideable {
    id?: number|null
}

// Funcion que toma un modelo T y lo convierte en un post
export type Postable<T> = {(mNuevo: T, mAnterior: T|undefined) : {[n: string]: any}}


type Editor<T> = {
    (url:string, nuevo?:T, original?:T): Promise<T|undefined>
}


export const useGenericModel = <Model extends Ideable, ModelSort extends string, ModelQuery>(url:string, page: number, perPage: number, postable?: Postable<Model>, sortBy?: ItemSorteado<ModelSort>[], itemsBusqueda?: Partial<ModelQuery>) => {
    const editor: undefined|Editor<Model> = useMemo(()=>postable ? ((url1, nuevo, original) => editorModel<Model>(url,nuevo,original,postable)) : undefined,[postable, url])
    const [paginacion, setPaginacion] = useState<ResponseAPIPaginado<Model>>(PaginacionVacia);
    const [isModelLoading, setIsModelLoading] = useState<boolean>(true)
    const [errorModel, setErrorModel] = useState<JSX.Element|undefined>();
    const {setErrorException} = useContext(AuthContext)
    useEffect(()=>{
        setIsModelLoading(true)
        setPaginacion(PaginacionVacia)
        setErrorModel(undefined)
        // const queryBusqueda: Partial<ModelQuery> = itemsBusqueda?.reduce<Partial<ModelQuery>>((prev,curr: ItemBusqueda<ModelQuery>)=>{
        //     return {...prev, [curr.columna]:curr.valor}
        // }, {}) || {}
        const queryOrden: Partial<ModelSort> = sortBy?.reduce<Partial<ModelSort>>((prev,curr: ItemSorteado<ModelSort>)=>{
            return {...prev, [curr.code]:curr.orden}
        },{}) || {}
        axios.get<ResponseAPIPaginado<Model>>(url,{
            params:{
                XDEBUG_SESSION_START: 'PHPSTORM',
                page,
                perPage,
                sortByListPriority: queryOrden,
                ...itemsBusqueda
            }
        })
            .then(({data}) => {
                setPaginacion(data)
            })
            .catch(e=> {
                setErrorException(e)
                setErrorModel(<VistaError error={errorRandomToIError(e)}/>)
                setPaginacion(PaginacionVacia)
            })
            .finally(()=>setIsModelLoading(false))
    },[sortBy, page, perPage, setErrorException, itemsBusqueda, url])
    const [modelModificando, setModelModificando] = useState<Model>()
    const modelUpdate = useCallback((p: Model, borrar: boolean = false)=>{
        return new Promise<void>((res,rej) => {
            if (editor) {
                const posicionItem: number = paginacion.data.findIndex(pItem => pItem.id === p.id)      // -1 si se va agregar nuevo
                const modelOriginal = (posicionItem>=0) ? paginacion.data[posicionItem] : undefined  //undefind si se vacrear
                editor(url, borrar?undefined:p, modelOriginal)
                    .then((modelSubido)=>{
                        const nuevaPaginacion = {...paginacion}
                        nuevaPaginacion.data.splice((posicionItem<0)?0:posicionItem,(posicionItem<0)?0:1,...modelSubido?[modelSubido]:[])
                        setPaginacion(nuevaPaginacion)
                        setModelModificando(modelSubido)
                        res()
                    })
                    .catch(rej)
            } else {
                rej(new Error("No esta definido el editor"))
            }
        });
    },[editor, paginacion, url])

    const handleBorrarModel = useCallback((p: Model) => {
        return new Promise<void>(res=>{
            modelUpdate(p, true)
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
    },[modelUpdate, paginacion, setErrorException])

    return {
        paginacion,
        isModelLoading,
        errorModel,
        modelUpdate,
        modelModificando,
        setModelModificando,
        handleBorrarModel,
    }
}

export function editorModel<T extends Ideable>(url: string, productoSubiendo: T|undefined, productoOriginal: T|undefined, postableFunction: Postable<T>) {
    return new Promise<T|undefined>((resolve,reject)=> {
        let method: "put" | "delete" | "post"
        let data: Record<string,any> = {}
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
            data = postableFunction(productoSubiendo, productoOriginal)
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
                message: "No se detecto ningun cambio para actualizar/crear el Modelo",
                items: [],
                code: 'sinCambios'
            }
            reject(error)
        }
    })
}

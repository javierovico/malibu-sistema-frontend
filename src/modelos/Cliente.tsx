import React, {useCallback, useContext, useEffect, useState} from "react";
import {PaginacionVacia, ResponseAPIPaginado} from "./ResponseAPI";
import {AuthContext} from "../context/AuthProvider";
import axios from "axios";
import VistaError from "../components/UI/VistaError";
import {errorRandomToIError, IError} from "./ErrorModel";
import {SortOrder} from "antd/es/table/interface";
import {IArchivo} from "./Archivo";

export const URL_CLIENTE = 'cliente'
export interface ICliente {
    id?: number,
    nombre: string,
    ruc: string|null,
    telefono: string|null,
    barrio: string|null,
    ciudad: string|null,
    imagen?: IArchivo|null;
}
type ItemSorteado<T> = {
    code: keyof T,
    orden?: SortOrder
}

export interface QueryBusquedaCliente {
    id?: number,
    ruc?: string,
    nombre?: string,
    telefono?: string,
}

export type TipoBusquedaCliente = keyof QueryBusquedaCliente

export interface ItemBusquedaCliente {
    columna: TipoBusquedaCliente,
    valor: string|number
}

interface ParametrosAPI {
    nombre?: string,
    base64Image?: string,
    deleteImage?: "si" | "no",
    ruc?:string,
    telefono?:string,
    barrio?:string,
    ciudad?:string
}

export function editorCliente(clienteNuevo?: ICliente, clienteOriginal?: ICliente) {
    return new Promise<ICliente|undefined>((resolve,reject)=>{
        let url = URL_CLIENTE
        let method: "put" | "delete" | "post"
        const data: ParametrosAPI = {}
        if (clienteOriginal && clienteOriginal.id) {
            //se va hacer una operacion sobre un producto existente
            url += '/' + clienteOriginal.id
            if (!clienteNuevo) {
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
        if (clienteNuevo && method !== "delete") {
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
}

interface QuerySort {
    ruc?: string,
    telefono?: string,
    nombre?: string,
    ciudad?: string,
    barrio?: string,
}

type SortItem = ItemSorteado<QuerySort>


export const useCliente = (page: number, perPage: number, sortBy?: SortItem[], itemsBusqueda?: ItemBusquedaCliente[]) => {
    const [paginacion, setPaginacion] = useState<ResponseAPIPaginado<ICliente>>(PaginacionVacia);
    const [isClientesLoading, setIsClientesLoading] = useState<boolean>(true)
    const [errorClientes, setErrorClientes] = useState<JSX.Element|undefined>();
    const {setErrorException} = useContext(AuthContext)
    useEffect(()=>{
        setIsClientesLoading(true)
        setPaginacion(PaginacionVacia)
        setErrorClientes(undefined)
        const queryBusqueda: QueryBusquedaCliente = itemsBusqueda?.reduce<QueryBusquedaCliente>((prev,curr: ItemBusquedaCliente)=>{
            return {...prev, [curr.columna]:curr.valor}
        },{}) || {}
        const queryOrden: QuerySort = sortBy?.reduce<QuerySort>((prev,curr: SortItem)=>{
            return {...prev, [curr.code]:curr.orden}
        },{}) || {}
        axios.get<ResponseAPIPaginado<ICliente>>(URL_CLIENTE + '?XDEBUG_SESSION_START=PHPSTORM',{
            params:{
                page,
                perPage,
                sortByList: queryOrden,
                ...queryBusqueda
            }
        })
            .then(({data}) => {
                setPaginacion(data)
            })
            .catch(e=> {
                setErrorException(e)
                setErrorClientes(<VistaError error={errorRandomToIError(e)}/>)
                setPaginacion(PaginacionVacia)
            })
            .finally(()=>setIsClientesLoading(false))
    },[sortBy, page, perPage, setErrorException, itemsBusqueda])
    const [clienteModificando, setClienteModificando] = useState<ICliente>()
    const clienteUpdate = useCallback((p: ICliente, borrar: boolean = false)=>{
        return new Promise<void>((res,rej) => {
            const posicionItem: number = paginacion.data.findIndex(pItem => pItem.id === p.id)      // -1 si se va agregar nuevo
            const clienteOriginal = (posicionItem>=0) ? paginacion.data[posicionItem] : undefined  //undefind si se vacrear
            editorCliente(borrar?undefined:p, clienteOriginal)
                .then((productoSubido)=>{
                    const nuevaPaginacion = {...paginacion}
                    nuevaPaginacion.data.splice((posicionItem<0)?0:posicionItem,(posicionItem<0)?0:1,...productoSubido?[productoSubido]:[])
                    setPaginacion(nuevaPaginacion)
                    setClienteModificando(productoSubido)
                    res()
                })
                .catch(rej)
        });
    },[paginacion])

    const handleBorrarCliente = useCallback((p: ICliente) => {
        return new Promise<void>(res=>{
            clienteUpdate(p, true)
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
    },[clienteUpdate, paginacion, setErrorException])

    return {
        paginacion,
        isClientesLoading,
        errorClientes,
        clienteUpdate,
        clienteModificando,
        setClienteModificando,
        handleBorrarCliente,
    }
}

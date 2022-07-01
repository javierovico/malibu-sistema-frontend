import {SortOrder} from "antd/es/table/interface";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {PaginacionVacia, ResponseAPIPaginado} from "./ResponseAPI";
import {AuthContext} from "../context/AuthProvider";
import axios from "axios";
import VistaError from "../components/UI/VistaError";
import {errorRandomToIError, IError} from "./ErrorModel";
import {ColumnType} from "antd/lib/table/interface";
import {Button, Input, Space} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import Highlighter from "react-highlight-words";

export type ColumnTipoModel<M> = ColumnType<M> & {
    dataIndex: keyof M
}

export type ColumnasTipoModel<M> = ColumnTipoModel<M>[]

export type LaravelBoolean = "0" | "1"

export type ItemSorteado<T extends string> = {
    code: T,
    orden?: SortOrder
}

export interface ItemBusqueda<T> {
    columna: keyof T,
    valor: string|number|string[]|number[]
}

export type Modelable = Record<string,any>

export interface Ideable extends Modelable{
    id?: number|null
}

// Funcion que toma un modelo T y lo convierte en un post
export type Postable<T> = {(mNuevo: T, mAnterior: T|undefined) : {[n: string]: any}}


type Editor<T> = {
    (url:string, nuevo?:T, original?:T): Promise<T|undefined>
}

/**
 * Retorna true si son iguales en base a los keys
 * @param arr1
 * @param arr2
 * @param keys
 * comparador debe retornar true si son iguales
 */
export function compararArray<T>(arr1:T[], arr2:T[], keys?: ({ key: keyof T, comparador?: {(i1: any, i2:any):boolean} })[]): boolean {
    return arr1.length === arr2.length
        && arr1.every(a1 => arr2.find(a2 => keys ?
            keys.every(k=> k.comparador? k.comparador(a2[k.key],a1[k.key]) : a2[k.key] === a1[k.key])
            : a2 === a1)
        )
}

/**
 * Recibe un item y un array de items y determina si el item se encuentra dentro del array
 * @param item
 * @param arr
 * @param keys
 * comparador debe retornar true si los dos items son iguales
 */
export function existeItemEnArray<T>(item: T, arr: T[], keys?: ({ key: keyof T, comparador?: {(i1: any, i2:any):boolean} })[]): boolean {
    return 0<=arr.findIndex(i=> keys ?
        keys.every(k => k.comparador ? k.comparador(i[k.key], item[k.key]) : i[k.key] === item[k.key])
        : i === item
    )
}

export function createColumnItemFromKey<M extends Modelable>(k: keyof M, titulo?: string, sortOrder?: SortOrder, sortable?: boolean, searchable?:boolean): ColumnTipoModel<M> {
    const key = typeof k === 'number' ? k : k as string
    const keyString = k as string
    const title = titulo || ((k as string).charAt(0).toUpperCase() + (k as string).slice(1))
    const searchInput = undefined
    const handleSearch = (...a:any) => {}
    const setSearchText = (...a:any) => {}
    const setSearchedColumn = (...a:any) => {}
    const searchText = ''
    return {
        dataIndex: key,
        key,
        title,
        sortOrder: sortOrder,
        sorter: sortable?{
            multiple: 1
        }: undefined,
        filterDropdown: searchable ? ({ setSelectedKeys, selectedKeys, confirm}) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${keyString}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={(e) => {
                        e.stopPropagation()
                        handleSearch(selectedKeys as string[], confirm, keyString)
                    }}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, keyString)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => {
                            setSelectedKeys([''])
                            handleSearch(selectedKeys as string[], confirm, keyString)
                            // clearFilters && handleReset(clearFilters)
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText((selectedKeys as string[])[0]);
                            setSearchedColumn(keyString);
                        }}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        ) : undefined,
        filterIcon: searchable ? (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ) : undefined,
        render: searchable ? text => (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : undefined,
    }
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

import {Reducer, useCallback, useEffect, useReducer} from "react";
import {useSearchParams} from "react-router-dom";


export interface ItemQuery<T> {
    // nombre: string,
    defaultValue: T,
    queryToValue: { (a: string): T },
    valueToQuery: {(a:T): string},
    comparador?: { (arg1: T, arg2:T): boolean } //retornar true si son iguales
}

export type ParamsQuerys<T> = Record<keyof T, ItemQuery<any>>
type ParamValue<T> = Record<keyof T,any>

function searchToItem<T>(itemBusqueda: ItemQuery<T>, search: URLSearchParams, nombre: string): T {
    const valueString: string|null =search.get(nombre)
    return valueString ? itemBusqueda.queryToValue(valueString) : itemBusqueda.defaultValue
}

/**
 * Deberia traer solo los cambios, no todx todx
 * @param searchParams
 * @param itemsList
 * @param items se compara con estos items, si es undefined se toma que todos son nuevos
 */
function getCurrentFromSearch<T>(searchParams: URLSearchParams, itemsList: ParamsQuerys<T>, items: ParamValue<T>|undefined = undefined): ParamValue<T> {
    // @ts-ignore
    const value: ParamValue<T> = {}
    for (const key in itemsList) {
        const nuevoValor = searchToItem(itemsList[key], searchParams, key)
        const comparador = itemsList[key].comparador
        if (!items || !(comparador ? comparador(nuevoValor, items[key]) : items[key] === nuevoValor)) {
            //Si no es igual al que ya estaba
            value[key] = nuevoValor
        }
    }
    return value
}

function setSearchFromCurrent<T>(items: T, itemsList: ParamsQuerys<T>): Record<string,string> {
    const value: Record<string,string> = {}
    for (const key in itemsList) {
        const valActual = items[key]
        const comparador = itemsList[key].comparador
        const stringAppend = itemsList[key].valueToQuery(items[key])
        if (!(comparador ? comparador(valActual,itemsList[key].defaultValue) : valActual === itemsList[key].defaultValue)) {
            if (stringAppend) {
                value[key] = stringAppend
            } else {
                delete(value[key])
            }
        }
    }
    return value
}

interface ReducerArg<T> {
    searchParams: URLSearchParams,
    itemsList: ParamsQuerys<T>
}

function reducerUrl<T>(a:T, b: ReducerArg<T>): T{
    const {
        searchParams,
        itemsList
    } = b
    const nuevos = getCurrentFromSearch<T>(searchParams, itemsList,a)
    return {...a, ...nuevos}
}

export function useParametros<T>(itemsList: ParamsQuerys<T>): { paramsURL: T, setParamsToURL: {(arg: T):void} } {
    const [searchParams, setSearchParams] = useSearchParams();
    const value = getCurrentFromSearch<T>(searchParams, itemsList)
    const [paramsURL, dispatchParamsUrl] = useReducer<Reducer<T,ReducerArg<T>>>(reducerUrl,value)
    useEffect(()=>{
        dispatchParamsUrl({searchParams, itemsList})
    },[itemsList, searchParams])
    const setParamsToURL = useCallback<{ (arg: T): void }>((arg)=>{
        setSearchParams(setSearchFromCurrent(arg, itemsList))
    },[itemsList, setSearchParams])
    return {
        paramsURL,
        setParamsToURL
    }
}

export const createItemNumber = (defaultValue: number = 1): ItemQuery<number> => ({
    defaultValue: defaultValue,
    queryToValue: a =>  parseInt(a),
    valueToQuery: a => '' + a
})

export const createItemNumberOrNull = (defaultValue: number|null = null): ItemQuery<number|null> => ({
    defaultValue: defaultValue,
    queryToValue: a =>  parseInt(a),
    valueToQuery: a => a? '' + a:''
})

export const createItemString = (defaultValue: string = ''): ItemQuery<string> => ({
    defaultValue: defaultValue,
    queryToValue: a =>  a,
    valueToQuery: a => a
})

export const createItemArray = function<T>(defaultValue: T[] = [], item: ItemQuery<T>, separator: string = ','): ItemQuery<T[]> {
    return {
        defaultValue: defaultValue,
        queryToValue: a =>  a.split(separator).map((s: string) => item.queryToValue(s)),
        valueToQuery: a => a.map(i => item.valueToQuery(i)).join(separator),
        comparador: (arg1,arg2) => !((arg1.length !== arg2.length) || (arg1.some(i => !arg2.find(i2 => (item.comparador) ? item.comparador(i2, i) : (i2 === i)))))
    }
}

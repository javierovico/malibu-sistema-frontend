import {useCallback, useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";


export interface ItemQuery<T> {
    // nombre: string,
    defaultValue: T,
    queryToValue: { (a: string): T },
    valueToQuery: {(a:T): string},
    comparador?: { (arg1: T, arg2:T): boolean } //retornar true si son iguales
}

function searchToItem<T>(itemBusqueda: ItemQuery<T>, search: URLSearchParams, nombre: string): T {
    const valueString: string|null =search.get(nombre)
    return valueString ? itemBusqueda.queryToValue(valueString) : itemBusqueda.defaultValue
}


function getCurrentFromSearch<T>(searchParams: URLSearchParams, itemsList: Record<keyof T, ItemQuery<any>>): Record<keyof T,any> {
    const value: Record<any, any> = {}
    for (const key in itemsList) {
        value[key] = searchToItem(itemsList[key], searchParams, key)
    }
    return value
}

function setSearchFromCurrent<T>(items: T, itemsList: Record<keyof T, ItemQuery<any>>): Record<keyof T,string> {
    const value: Record<any, string> = {}
    for (const key in itemsList) {
        const valActual = items[key]
        if (valActual !== itemsList[key].defaultValue) {
            value[key] = itemsList[key].valueToQuery(items[key])
        }
    }
    return value
}

export function useParametros<T>(itemsList: Record<keyof T, ItemQuery<any>>): { paramsURL: T, setParamsToURL: {(arg: T):void} } {
    const [searchParams, setSearchParams] = useSearchParams();
    const value = getCurrentFromSearch<T>(searchParams, itemsList)
    const [paramsURL, setParamsURL] = useState<T>(value)
    useEffect(()=>{
        setParamsURL(getCurrentFromSearch<T>(searchParams, itemsList))
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

import {useCallback, useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";


export interface ItemQuery<T> {
    // nombre: string,
    defaultValue: T,
    quertyToValue: { (a: string): T },
    valueToQuery: {(a:T): string}
}

function searchToItem<T>(itemBusqueda: ItemQuery<T>, search: URLSearchParams, nombre: string): T {
    const valueString: string|null =search.get(nombre)
    return valueString ? itemBusqueda.quertyToValue(valueString) : itemBusqueda.defaultValue
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
    quertyToValue: a =>  parseInt(a),
    valueToQuery: a => '' + a
})

export const createItemString = (defaultValue: string = ''): ItemQuery<string> => ({
    defaultValue: defaultValue,
    quertyToValue: a =>  a,
    valueToQuery: a => a
})

import {useEffect, useState} from "react";


export interface ItemQuery<T> {
    nombre: string,
    defaultValue: T,
    quertyToValue: { (a: string): T },
    valueToQuery: {(a:T): string}
}

function searchToItem<T>(itemBusqueda: ItemQuery<T>, search: URLSearchParams): T {
    const valueString: string|null =search.get(itemBusqueda.nombre)
    return valueString ? itemBusqueda.quertyToValue(valueString) : itemBusqueda.defaultValue
}

function getCurrentFromSearch<T>(searchParams: URLSearchParams, itemsList: Record<string, ItemQuery<any>>): Record<keyof T,any> {
    const value: Record<any, any> = {}
    for (const key in itemsList) {
        value[itemsList[key].nombre] = searchToItem(itemsList[key], searchParams)
    }
    return value
}

export function useParametros<T>(searchParams: URLSearchParams, itemsList: Record<string, ItemQuery<any>>): T {
    const value = getCurrentFromSearch<T>(searchParams, itemsList)
    const [state, setState] = useState<T>(value)
    useEffect(()=>{
        setState(getCurrentFromSearch<T>(searchParams, itemsList))
    },[itemsList, searchParams])
    return state
}

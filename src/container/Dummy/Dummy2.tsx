import {Button} from "antd";
import {Reducer, useContext, useEffect, useMemo, useReducer, useState} from "react";
import {AuthContext} from "../../context/AuthProvider";
import {useSearchParams} from "react-router-dom";

interface Query<T> {
    [n: string]: T[keyof T],
}

interface IPrueba extends Query<IPrueba>{
    page: number,
    perPage: number,
    busqueda: string,
}

interface IPruebaOriginal{
    page: number,
    perPage: number,
    busqueda: string,
}

const test: Record<keyof IPruebaOriginal, any> = {
    busqueda: '',
    page:0,
    perPage:3
}
const test2: IPruebaOriginal = test

interface GenericIdentityFn {
    <Type>(arg: Type): Type;
    <Type>(arg: Type): number;
}

interface ItemQuery<T> {
    nombre: string,
    defaultValue: T,
    quertyToValue: { (a: string): T },
    valueToQuery: {(a:T): string}
}

const pr2: IPrueba = {
    page: 2,
    perPage:3,
    busqueda: 'ss',
}

type A = keyof IPrueba

function identity<Type>(arg: Type): Type {
    return arg;
}


let myIdentity: GenericIdentityFn = identity;

function fPrueba<Query>(a: Query): Query {
    console.log(a)
    for (const key in a) {
        console.log({key})
    }
    return a
}

function fPrueba2<T>(a: T): T {
    console.log(a)
    for (const key in a) {
        console.log({key})
    }
    return a
}

const itemPerPage: ItemQuery<number> = {
    defaultValue: 10,
    nombre: 'perPage',
    quertyToValue: a =>  parseInt(a),
    valueToQuery: a => '' + a
}
const itemPage: ItemQuery<number> = {
    defaultValue: 1,
    nombre: 'page',
    quertyToValue: a =>  parseInt(a),
    valueToQuery: a => '' + a
}
const itemBusqueda: ItemQuery<string> = {
    defaultValue: '',
    nombre: 'busqueda',
    quertyToValue: a =>  a,
    valueToQuery: a => a
}

function searchToItem<T>(itemBusqueda: ItemQuery<T>, search: URLSearchParams): T {
    const valueString: string|null =search.get(itemBusqueda.nombre)
    return valueString ? itemBusqueda.quertyToValue(valueString) : itemBusqueda.defaultValue
}

interface ParametrosAdminProducto {
    page: number,
    perPage: number,
    busqueda: string
}

interface IAccion {
    type: string,
    payload: any
}

const reducidor = (state: ParametrosAdminProducto, action: IAccion): ParametrosAdminProducto => {
    return {...state, ...action.payload}

}

const useParametros = (searchParams: URLSearchParams) => {
    const [state, dispatch] = useReducer<Reducer<ParametrosAdminProducto,IAccion>>(reducidor,{
        page: searchToItem(itemPage, searchParams),
        perPage: searchToItem(itemPerPage, searchParams),
        busqueda:searchToItem(itemBusqueda, searchParams),
    })
    useEffect(()=>{
        dispatch({
            type: 'all',
            payload:{
                page: searchToItem(itemPage, searchParams),
                perPage: searchToItem(itemPerPage, searchParams),
                busqueda:searchToItem(itemBusqueda, searchParams),
            }
        })
    },[searchParams])
    return state
}

export default function Dummy2() {
    const {user} = useContext(AuthContext)
    const [searchParams, setSearchParams] = useSearchParams();
    const [value,setValue] = useState('si')
    const click = () => {
        console.log("CLICK BUTTON")
        setSearchParams({perPage:window.prompt("perPage") || ''})
    }
    const {
        busqueda,
        perPage
    } = useParametros(searchParams)
    useEffect(()=>{
        console.log({busqueda})
    },[busqueda])
    useEffect(()=>{
        console.log({perPage})
    },[perPage])
    useEffect(()=>{
        console.log({value})
    },[value])
    useEffect(()=>{
        console.log({user})
    },[user])
    return <>
        <Button onClick={click}>PUSH</Button>
    </>
}

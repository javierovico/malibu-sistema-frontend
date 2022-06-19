import {Button} from "antd";
import { useContext, useEffect, useMemo, useState} from "react";
import {AuthContext} from "../../context/AuthProvider";
import {useSearchParams} from "react-router-dom";
import {ItemQuery, useParametros} from "../../hook/hookQuery";

interface ParametrosAdminProducto{
    page: number,
    perPage: number,
    busqueda: string,
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

export default function Dummy2() {
    const [searchParams, setSearchParams] = useSearchParams();
    const click = () => {
        console.log("CLICK BUTTON")
        setSearchParams({perPage:window.prompt("perPage") || ''})
    }
    const itemList = useMemo(()=>({itemBusqueda,itemPage,itemPerPage}),[])
    const {
        busqueda,
        perPage,
        page,
    } = useParametros<ParametrosAdminProducto>(searchParams,itemList)
    useEffect(()=>{
        console.log({busqueda})
    },[busqueda])
    useEffect(()=>{
        console.log({page})
    },[page])
    useEffect(()=>{
        console.log({perPage})
    },[perPage])
    return <>
        <Button onClick={click}>PUSH</Button>
    </>
}

import {Button} from "antd";
import {useEffect, useMemo} from "react";
import {createItemNumber, createItemString, ParamsQuerys, useParametros} from "../../hook/hookQuery";

interface ParametrosAdminProducto{
    page: number,
    perPage: number,
    busqueda: string,
    nuevo: number,
}

const itemPerPage = createItemNumber(10)
const itemPage = createItemNumber()
const itemBusqueda = createItemString()

export default function Dummy2() {
    const itemList = useMemo((): ParamsQuerys<ParametrosAdminProducto> =>({
        busqueda: itemBusqueda,
        page: itemPage,
        perPage: itemPerPage,
        nuevo: createItemNumber(),
    }),[])
    const {
        paramsURL,
        setParamsToURL
    } = useParametros<ParametrosAdminProducto>(itemList)
    const {
        busqueda,
        perPage,
        page,
    } = paramsURL
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
        <Button onClick={()=>setParamsToURL({perPage:parseInt(window.prompt('perPage') || ''+itemPerPage.defaultValue),page:parseInt(window.prompt('page') || ''+itemPage.defaultValue)})}>perPage</Button>
        {/*<Button onClick={()=>click2('perPage')}>perPage</Button>*/}
        {/*<Button onClick={()=>click('page')}>page</Button>*/}
        <Button onClick={()=>setParamsToURL({ busqueda: window.prompt('busqueda') || itemBusqueda.defaultValue})}>busqueda</Button>
    </>
}

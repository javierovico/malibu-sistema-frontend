import {PosiblesOrdenacionesProducto, TipoBusqueda, TipoProductoAdmitido, useProductos} from "../../modelos/Producto";
import {useCallback, useMemo, useState} from "react";
import TablaProductos from "./TablaProductos";

interface Parametros {

}

export default function SelectDeProductos({} : Parametros){
    const [page,setPage] = useState<number>(1)
    const [perPage, setPerpage] = useState<number>(10)
    const [busqueda, setBusqueda] = useState<string>('')
    const [tipoBusqueda, setTipoBusqueda] = useState<TipoBusqueda>('nombre')
    const [sortBy, setSortBy] = useState<PosiblesOrdenacionesProducto>("codigo")
    const [tiposProducto,setTiposProducto] = useState<TipoProductoAdmitido[]>([])
    const busquedaNombre = useMemo(()=>tipoBusqueda === 'nombre'?busqueda:'',[busqueda, tipoBusqueda])
    const busquedaCode = useMemo(()=>tipoBusqueda === 'codigo'?busqueda:'',[busqueda, tipoBusqueda])
    const busquedaId = useMemo(()=>tipoBusqueda === 'id'?busqueda:'',[busqueda, tipoBusqueda])
    const changeBusqueda = useCallback((key:TipoBusqueda,value:string)=>{
        setTipoBusqueda(key)
        setBusqueda(value)
    },[])
    const {
        paginacion
    } = useProductos(busqueda, page, perPage, tipoBusqueda, sortBy, tiposProducto)
    return <>
        <TablaProductos
            productos={paginacion.data}
            title=''
            busquedaId={busquedaId}
            onBusquedaIdChange={(s)=>changeBusqueda('id',s)}
            busquedaCode={busquedaCode}
            onBusquedaCodeChange={(s)=>changeBusqueda('codigo',s)}
            busquedaNombre={busquedaNombre}
            onBusquedaNombreChange={(s)=>changeBusqueda('nombre',s)}
            onFilterTipoProductoChange={setTiposProducto}
            tiposProductos={tiposProducto}
        />
    </>
}

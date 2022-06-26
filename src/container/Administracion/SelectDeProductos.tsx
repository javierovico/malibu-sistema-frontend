import {PosiblesOrdenacionesProducto, TipoBusqueda, useProductos} from "../../modelos/Producto";
import {useMemo, useState} from "react";
import TablaProductos from "./TablaProductos";

interface Parametros {

}

export default function SelectDeProductos({} : Parametros){
    const [page,setPage] = useState<number>(1)
    const [perPage, setPerpage] = useState<number>(10)
    const [busqueda, setBusqueda] = useState<string>('')
    const [tipoBusqueda, setTipoBusqueda] = useState<TipoBusqueda>('nombre')
    const [sortBy, setSortBy] = useState<PosiblesOrdenacionesProducto>("codigo")
    const {
        paginacion
    } = useProductos(busqueda, page, perPage, tipoBusqueda, sortBy)
    return <>
        <TablaProductos
            productos={paginacion.data}
            title=''
            // onFilterTipoProductoChange={(filtro)=>console.log('NUevo filtro producto: ', filtro)}
        />
    </>
}

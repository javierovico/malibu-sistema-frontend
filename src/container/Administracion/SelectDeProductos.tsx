import {
    IProducto,
    ItemBusqueda, SortItems,
    TipoBusqueda,
    TipoProductoAdmitido,
    useProductos
} from "../../modelos/Producto";
import React, {useCallback, useMemo, useState} from "react";
import TablaProductos from "./TablaProductos";
import {Button, Space} from "antd";
import {IconText} from "./AdminProducto";
import {CheckOutlined} from "@ant-design/icons";

interface Parametros {
    titulo: string,
    onProductoSelect: {(p:IProducto):void}
}

export default function SelectDeProductos({titulo,onProductoSelect} : Parametros){
    const [page,setPage] = useState<number>(1)
    const [perPage, setPerpage] = useState<number>(5)
    const [busqueda, setBusqueda] = useState<string>('')
    const [tipoBusqueda, setTipoBusqueda] = useState<TipoBusqueda>('nombre')
    const [orderBy, setOrderBy] = useState<SortItems>([])
    const [tiposProducto,setTiposProducto] = useState<TipoProductoAdmitido[]>([])
    const busquedaNombre = useMemo(()=>tipoBusqueda === 'nombre'?busqueda:'',[busqueda, tipoBusqueda])
    const busquedaCode = useMemo(()=>tipoBusqueda === 'codigo'?busqueda:'',[busqueda, tipoBusqueda])
    const busquedaId = useMemo<number|undefined>(()=>(tipoBusqueda === 'id' && !isNaN(parseInt(busqueda)))?parseInt(busqueda):undefined,[busqueda, tipoBusqueda])
    const changeBusqueda = useCallback((key:TipoBusqueda,value:string)=>{
        setTipoBusqueda(key)
        setBusqueda(value)
    },[])
    const itemsBusqueda = useMemo<ItemBusqueda[]>(()=>busqueda?[{columna:tipoBusqueda, valor:busqueda}]:[],[busqueda, tipoBusqueda])
    const {
        paginacion
    } = useProductos(page, perPage, orderBy, tiposProducto, itemsBusqueda)
    return <>
        <TablaProductos
            productos={paginacion.data}
            title={titulo}
            busquedaId={busquedaId}
            onBusquedaIdChange={(s)=>changeBusqueda('id',s?(''+s):'')}
            busquedaCode={busquedaCode}
            onBusquedaCodeChange={(s)=>changeBusqueda('codigo',s)}
            busquedaNombre={busquedaNombre}
            onBusquedaNombreChange={(s)=>changeBusqueda('nombre',s)}
            onFilterTipoProductoChange={setTiposProducto}
            tiposProductos={tiposProducto}
            orderBy={orderBy}
            onOrderByChange={setOrderBy}
            page={page}
            perPage={perPage}
            totalItems={paginacion.total}
            onPaginationChange={(p,pp)=>{
                setPerpage(pp)
                setPage(p)
            }}
            acciones={(p)=><Space size="middle">
                <Button
                    type="link"
                    onClick={()=>{
                        onProductoSelect(p)
                    }}
                >
                    <IconText icon={CheckOutlined} text="Seleccionar"/>
                </Button>
            </Space>}
        />
    </>
}

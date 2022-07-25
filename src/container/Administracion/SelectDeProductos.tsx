import {
    EnumTipoProducto,
    IProducto, QueryGetProductos, SortsProductos, TipoBusquedaProductos, useProductos,
} from "../../modelos/Producto";
import React, {useCallback, useMemo, useState} from "react";
import TablaProductos from "./TablaProductos";
import {ItemSorteado} from "../../modelos/Generico";


export interface ProductoSelected {
    producto: IProducto,
    selected: boolean
}

interface Parametros {
    titulo: string,
    onProductosSelectChange: { (items: ProductoSelected[]): void },
    productosExistentes?: number[],      //lista de productos que ya estan en la lista
    productosIdNoSeleccionables?: number[], //lista de productos que no se puede seleccionar o desseleccionar
    tiposProductosAdmitidos?: EnumTipoProducto[]
}

export default function SelectDeProductos({
                                              tiposProductosAdmitidos,
                                              titulo,
                                              onProductosSelectChange,
                                              productosExistentes,
                                              productosIdNoSeleccionables
                                          }: Parametros) {
    const [page, setPage] = useState<number>(1)
    const [perPage, setPerpage] = useState<number>(5)
    const [busqueda, setBusqueda] = useState<string>('')
    const [tipoBusqueda, setTipoBusqueda] = useState<TipoBusquedaProductos>('nombre')
    const [orderBy, setOrderBy] = useState<ItemSorteado<SortsProductos>[]>([])
    const [tiposProducto, setTiposProducto] = useState<EnumTipoProducto[]>(tiposProductosAdmitidos || [])
    const tiposProductosFiltro = useMemo(() => (tiposProductosAdmitidos && tiposProducto.length === 0) ? tiposProductosAdmitidos : tiposProducto, [tiposProducto, tiposProductosAdmitidos])
    const busquedaNombre = useMemo(() => tipoBusqueda === 'nombre' ? busqueda : '', [busqueda, tipoBusqueda])
    const busquedaCode = useMemo(() => tipoBusqueda === 'codigo' ? busqueda : '', [busqueda, tipoBusqueda])
    const busquedaId = useMemo<number | undefined>(() => (tipoBusqueda === 'id' && !isNaN(parseInt(busqueda))) ? parseInt(busqueda) : undefined, [busqueda, tipoBusqueda])
    const changeBusqueda = useCallback((key: TipoBusquedaProductos, value: string) => {
        setTipoBusqueda(key)
        setBusqueda(value)
    }, [])
    const itemsBusqueda = useMemo((): Partial<QueryGetProductos> => ({
        id: (tipoBusqueda === 'id' && busqueda && !isNaN(parseInt(busqueda))) ? parseInt(busqueda) : undefined,
        codigo: (tipoBusqueda === 'codigo' && busqueda) ? busqueda : undefined,
        nombre: (tipoBusqueda === 'nombre' && busqueda) ? busqueda : undefined,
        tiposProducto: tiposProductosFiltro.length ? tiposProductosFiltro : undefined
    }), [busqueda, tipoBusqueda, tiposProductosFiltro])
    const {
        paginacion,
        isProductosLoading
    } = useProductos(page, perPage, orderBy, itemsBusqueda)
    return <>
        <TablaProductos
            loading={isProductosLoading}
            tiposProductosAdmitidos={tiposProductosAdmitidos}
            productos={paginacion.data}
            title={titulo}
            busquedaId={busquedaId}
            onBusquedaIdChange={(s) => changeBusqueda('id', s ? ('' + s) : '')}
            busquedaCode={busquedaCode}
            onBusquedaCodeChange={(s) => changeBusqueda('codigo', s)}
            busquedaNombre={busquedaNombre}
            onBusquedaNombreChange={(s) => changeBusqueda('nombre', s)}
            onFilterTipoProductoChange={setTiposProducto}
            tiposProductos={tiposProductosFiltro}
            orderBy={orderBy}
            onOrderByChange={setOrderBy}
            page={page}
            perPage={perPage}
            totalItems={paginacion.total}
            onPaginationChange={(p, pp) => {
                setPerpage(pp)
                setPage(p)
            }}
            productosIdSelected={productosExistentes || []}
            productosIdNoSeleccionables={productosIdNoSeleccionables}
            onProductosIdSelectedChange={onProductosSelectChange}
        />
    </>
}

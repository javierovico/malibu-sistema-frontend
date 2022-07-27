import {
    EnumTipoProducto,
    IProducto, PRODUCTO_TIPOS_ADMITIDOS, QueryGetProductos, TipoBusquedaProductos, useProductos,
} from "../../modelos/Producto";
import React, {useCallback, useMemo, useState} from "react";
import {ItemSorteado} from "../../modelos/Generico";
import TablaGenerica, {
    ConfiguracionColumna,
    generadorColumna,
    ItemsSelected, ValorBuscado
} from "../Trabajo/TablaGenerica";
import {formateadorNumero} from "../../utils/utils";


export interface ProductoSelected {
    producto: IProducto,
    selected: boolean
}

interface Parametros {
    titulo: string,
    onProductosSelectChange: { (items: ItemsSelected<IProducto>[]): void },
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
    const [orderBy, setOrderBy] = useState<ItemSorteado<string>[]>([])
    const [tiposProducto, setTiposProducto] = useState<EnumTipoProducto[]>(tiposProductosAdmitidos || [])
    const tiposProductosFiltro = useMemo(() => (tiposProductosAdmitidos && tiposProducto.length === 0) ? tiposProductosAdmitidos : tiposProducto, [tiposProducto, tiposProductosAdmitidos])
    const changeBusqueda = useCallback((key: TipoBusquedaProductos, value: string) => {
        setTipoBusqueda(key)
        setBusqueda(value)
    }, [])
    const itemsBusqueda = useMemo((): Partial<QueryGetProductos> => ({
        id: (tipoBusqueda === 'id' && busqueda) ? busqueda : undefined,
        codigo: (tipoBusqueda === 'codigo' && busqueda) ? busqueda : undefined,
        nombre: (tipoBusqueda === 'nombre' && busqueda) ? busqueda : undefined,
        tiposProducto: tiposProductosFiltro.length ? tiposProductosFiltro : undefined,
    }), [busqueda, tipoBusqueda, tiposProductosFiltro])
    const {
        paginacion,
        isProductosLoading
    } = useProductos(page, perPage, orderBy, itemsBusqueda)
    const configuracionColumnas = useMemo((): ConfiguracionColumna<IProducto>[]=> [
        generadorColumna<IProducto,QueryGetProductos>('id',orderBy,true,true,undefined, itemsBusqueda),
        generadorColumna<IProducto,QueryGetProductos>('codigo',orderBy,true,true,undefined, itemsBusqueda),
        generadorColumna<IProducto,QueryGetProductos>('nombre',orderBy,true,true,undefined, itemsBusqueda),
        generadorColumna<IProducto,QueryGetProductos>('tiposProducto',orderBy,true,false,PRODUCTO_TIPOS_ADMITIDOS.filter(tpa => !tiposProductosAdmitidos || tiposProductosAdmitidos.includes(tpa.code)).map(tp=> ({
            text: tp.descripcion,
            value: tp.code
        })), itemsBusqueda, (_, item) => item.tipo_producto?.descripcion, 'Tipo',(values)=>{
            setTiposProducto(values as EnumTipoProducto[])
        }),
        generadorColumna<IProducto,QueryGetProductos>('precio',orderBy,true,false,undefined, itemsBusqueda, (_, item) => formateadorNumero(item.pivot?.precio ?? item.precio) + ' Gs.'),
        generadorColumna<IProducto,QueryGetProductos>('costo',orderBy,true,false,undefined, itemsBusqueda,(_,item) => formateadorNumero(item.pivot?.costo ?? item.costo) + ' Gs.'),
    ],[itemsBusqueda, orderBy, tiposProductosAdmitidos])
    const onBusquedaValuesChange = useCallback((v: ValorBuscado[])=>{
        const primero = v.find(a => a.value)
        if (primero) {
            changeBusqueda(primero.code as TipoBusquedaProductos, primero.value!)
        } else {
            setBusqueda('')
        }
    },[changeBusqueda])
    return <>
        <TablaGenerica
            items={paginacion.data}
            loading={isProductosLoading}
            title={titulo}
            itemsIdSelected={productosExistentes || []}
            itemsIdNoSeleccionables={productosIdNoSeleccionables}
            onItemsIdSelectedChange={onProductosSelectChange}
            configuracionColumnas={configuracionColumnas}
            totalItems={paginacion.total}
            perPage={perPage}
            page={page}
            onPaginationChange={(p, pp) => {
                setPerpage(pp)
                setPage(p)
            }}
            onOrderByChange={setOrderBy}
            onBusquedaValuesChange={onBusquedaValuesChange}
            typeSelcted={'checkbox'}
        />
    </>
}

import {Button, Input, InputRef, Space, Table} from "antd";
import {ICliente, ListSortCliente, QueryBusquedaCliente, SortCliente, TipoBusqueda} from "../../modelos/Cliente";
import {useCallback, useMemo, useRef, useState} from "react";
import {
    ColumnasTipoModel,
    ColumnTipoModel,
    compararArray,
    existeItemEnArray,
    ItemSorteado,
    Modelable
} from "../../modelos/Generico";
import {ColumnFilterItem, FilterValue, SorterResult, TablePaginationConfig} from "antd/lib/table/interface";
import {FilterConfirmProps, SortOrder} from "antd/es/table/interface";
import {SearchOutlined} from "@ant-design/icons";
import Highlighter from "react-highlight-words";

export interface ConfiguracionColumna<M> {
    key: keyof M,
    sortable?: boolean,
    sortOrder?: SortOrder,
    searchable?: boolean,
    searchValue?: string,
    valoresAdmitidosFiltro?: ColumnFilterItem[],
    valoresFiltro?: string|string[]|undefined
}

export interface ValorFiltrado {
    code: string,
    value: string[]
}

export interface ValorBuscado {
    code: string,
    value?: string
}

export interface ValorCambiado {
    code: string,
    value?: string|string[]
}

interface Parametros<M> {
    items: M[],
    page?: number,
    totalItems?: number,
    perPage?: number,
    onPaginationChange?: {(page:number,perPage:number): void},
    onOrderByChange?: {(l: ItemSorteado<string>[]): void}      //enviamos los nuevos sortables list
    configuracionColumnas: ConfiguracionColumna<M>[],
    onFiltroValuesChange?: {(v:ValorFiltrado[]):void},
    onBusquedaValuesChange?: {(v:ValorBuscado[]):void}
}

export function generadorColumna<T,QueryBusqueda extends TipoBusqueda>(
    key: keyof T & keyof QueryBusqueda,
    sortBy?: ItemSorteado<string>[],
    sortable?:boolean,
    searchable?: boolean,
    valoresAdmitidosFiltro?: ColumnFilterItem[],
    busqueda?: Partial<QueryBusqueda>
): ConfiguracionColumna<T>{
    return {
        key,
        sortable,
        searchable,
        sortOrder: sortBy?.find(r=>r.code===(key as string))?.orden,
        valoresAdmitidosFiltro,
        valoresFiltro: ((busqueda && (busqueda.hasOwnProperty(key)))? busqueda[key]: (searchable?undefined:[])),
    }
}

export default function TablaClientes<M extends Modelable> (arg: Parametros<M>){
    const {
        items,
        totalItems,
        page,
        perPage,
        onPaginationChange,
        onOrderByChange,
        configuracionColumnas,
        onFiltroValuesChange,
        onBusquedaValuesChange
    } = arg
    const searchInput = useRef<InputRef>(null);
    const createColumnItemFromKey = useCallback(<M extends Modelable>(k: keyof M, titulo?: string, sortOrder?: SortOrder, sortable?: boolean, searchable?:boolean, valoresAdmitidosFiltro?: ColumnFilterItem[], valoresFiltro?: string|string[]): ColumnTipoModel<M> =>{
        const key = typeof k === 'number' ? k : k as string
        const title = titulo || ((k as string).charAt(0).toUpperCase() + (k as string).slice(1))
        const searchText = valoresFiltro?((Array.isArray(valoresFiltro) && valoresFiltro.length)?valoresFiltro[0]: (typeof valoresFiltro === 'string'?valoresFiltro:'')):''
        return {
            dataIndex: key,
            key,
            title,
            sortOrder: sortOrder,
            filters: valoresAdmitidosFiltro,
            filteredValue: valoresFiltro?(Array.isArray(valoresFiltro)?valoresFiltro:[valoresFiltro]):null,
            sorter: sortable?{
                multiple: 1
            }: undefined,
            filterDropdown: searchable ? ({ setSelectedKeys, selectedKeys, confirm}) => (
                <div style={{ padding: 8 }}>
                    <Input
                        ref={searchInput}
                        placeholder={`Search ${title}`}
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={(e) => {
                            e.stopPropagation()
                            confirm()
                        }}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Search
                        </Button>
                        <Button
                            onClick={() => {
                                setSelectedKeys([''])
                                confirm()
                                // handleSearch(selectedKeys as string[], confirm, keyString)
                                // clearFilters && handleReset(clearFilters)
                            }}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                confirm({ closeDropdown: false });
                                // setSearchText((selectedKeys as string[])[0]);
                                // setSearchedColumn(keyString);
                            }}
                        >
                            Filter
                        </Button>
                    </Space>
                </div>
            ) : undefined,
            filterIcon: searchable ? (filtered: boolean) => (
                <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
            ) : undefined,
            render: searchable ? (text => {
                return (
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[searchText]}
                        autoEscape
                        textToHighlight={text ? text.toString() : ''}
                    />
                )
            }) : undefined,
        }
    },[])

    const columnas = useMemo(():ColumnasTipoModel<M> => configuracionColumnas.map(r=>createColumnItemFromKey(r.key, undefined, r.sortOrder, r.sortable, r.searchable, r.valoresAdmitidosFiltro, r.valoresFiltro)),[configuracionColumnas, createColumnItemFromKey])
    const sortCalculado = useMemo(():ItemSorteado<string>[] =>configuracionColumnas.filter(c=>c.sortable).map(c=>({
        code: c.key as string,
        orden: c.sortOrder,
    })),[configuracionColumnas])
    const valoresFiltroCalculado = useMemo((): ValorFiltrado[] => configuracionColumnas.filter(r=>!r.searchable && Array.isArray(r.valoresAdmitidosFiltro)).map(c=>({
        code: c.key as string,
        value: c.valoresFiltro ? c.valoresFiltro as string[] : [],
    })),[configuracionColumnas])
    const valoresBusquedaCalculado = useMemo((): ValorBuscado[] => configuracionColumnas.filter(r=>r.searchable).map(c=>({
        code: c.key as string,
        value: c.valoresFiltro ? c.valoresFiltro as string : undefined
    })),[configuracionColumnas])
    const paginacion = useMemo(()=>((totalItems && perPage && onPaginationChange)?{
        pageSizeOptions:[4,10,20,50],
        showQuickJumper:true,
        showSizeChanger:true,
        pageSize:totalItems > items.length ? (items.length > perPage ? items.length : perPage) : perPage,
        current:page,
        onChange:onPaginationChange,
        total:totalItems,
    }:undefined),[items.length, onPaginationChange, page, perPage, totalItems])
    const onChange = useCallback((pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult<M> | SorterResult<M>[])=>{
        if (onOrderByChange) {
            const sorterArray = !Array.isArray(sorter) ? [sorter] : sorter
            const nuevoSort: ItemSorteado<string>[] = sortCalculado.map((r=>({
                code: r.code,
                orden: sorterArray.find(s=>s.columnKey === r.code)?.order
            })))
            const diferenciaSort = nuevoSort.filter(d=>!existeItemEnArray(d,sortCalculado,[{key:'code'},{key:'orden'}]))
            if (diferenciaSort.length) {
                onOrderByChange(nuevoSort)
            }
        }
        if (onFiltroValuesChange) {
            const nuevosValoresFiltrados: ValorFiltrado[] = Object.keys(filters).filter(r=>{
                const configuracion = configuracionColumnas.find(c => c.key === r)
                return configuracion && !configuracion?.searchable && Array.isArray(configuracion.valoresAdmitidosFiltro)
            }).map(r=>({
                code: r,
                value: (filters[r] as string[]) ? (filters[r] as string[]) : []
            }))
            const diferenciaFiltrada = nuevosValoresFiltrados.filter(d=>!existeItemEnArray(d,valoresFiltroCalculado, [{key:'code'},{key:'value', comparador:(i1,i2)=>compararArray(i1,i2)}]))
            if (diferenciaFiltrada.length) {
                onFiltroValuesChange(diferenciaFiltrada)
            }
        }
        if (onBusquedaValuesChange) {
            const nuevosValoresBuscados: ValorBuscado[] = Object.keys(filters).filter(r=>{
                const configuracion = configuracionColumnas.find(c => c.key === r)
                return configuracion && configuracion?.searchable
            }).map(r=>{
                const valueRaw = filters[r] as string[]
                return {
                    code: r,
                    value: valueRaw?.length ? valueRaw[0] : undefined
                }
            })
            const diferenciaBuscado = nuevosValoresBuscados.filter(d=>!existeItemEnArray(d,valoresBusquedaCalculado,[{key:'value'},{key:'code'}]))
            if (diferenciaBuscado.length) {
                onBusquedaValuesChange(diferenciaBuscado)
            }
        }
    },[configuracionColumnas, onBusquedaValuesChange, onFiltroValuesChange, onOrderByChange, sortCalculado, valoresBusquedaCalculado, valoresFiltroCalculado])
    return <Table
        rowKey={'id'}
        columns={columnas}
        dataSource={items}
        pagination={paginacion}
        onChange={onChange}
    />
}

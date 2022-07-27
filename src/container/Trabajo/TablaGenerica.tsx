import {Button, Input, InputRef, Space, Table} from "antd";
import {TipoBusqueda} from "../../modelos/Cliente";
import {useCallback, useMemo, useRef} from "react";
import {
    ColumnTipoModel,
    compararArray,
    existeItemEnArray, ItemSorteado,
    Modelable
} from "../../modelos/Generico";
import {
    ColumnFilterItem, ColumnsType,
    FilterValue, RowSelectionType,
    SorterResult,
    TablePaginationConfig,
    TableRowSelection
} from "antd/lib/table/interface";
import {SortOrder} from "antd/es/table/interface";
import {SearchOutlined} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import * as React from "react";
import {RenderedCell, RowClassName} from "rc-table/lib/interface";

export interface FilterFunction<M> { (item: M, filter:undefined|string|string[]): boolean }

export interface SorterFunction<M> { (i1: M, i2: M): number }

export interface ConfiguracionColumnaSimple<M> {
    key: keyof M | string,
    sortable?: boolean,
    searchable?: boolean,
    valoresAdmitidosFiltro?: ColumnFilterItem[],
    filtroDesdeValores?: boolean,               //si es true, los valores para valoresAdmitidosFiltro se traen de los items
    titulo?: string,
    render?: {(value: any, item:M):React.ReactNode | RenderedCell<M>},
    filter?: FilterFunction<M>,
    sorter?: SorterFunction<M>,
}

export interface ConfiguracionColumna<M> {
    key: string | keyof M,
    sortable?: boolean,
    sortOrder?: SortOrder,
    searchable?: boolean,
    searchValue?: string,
    valoresAdmitidosFiltro?: ColumnFilterItem[],
    valoresFiltro?: string|string[]|undefined,
    titulo?: string,
    render?: {(value: any, item:M):React.ReactNode | RenderedCell<M>},
    filter?: FilterFunction<M>,
    onFilterChange?: {(value: string[]):void}
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

export interface ItemsSelected<M> {
    item: M,
    selected: boolean
}

interface Parametros<M> {
    title?: JSX.Element | string,
    items: M[],
    page?: number,
    totalItems?: number,
    perPage?: number,
    onPaginationChange?: {(page:number,perPage:number): void},
    onOrderByChange?: {(l: ItemSorteado<string>[]): void}      //enviamos los nuevos sortables list
    configuracionColumnas: (ConfiguracionColumna<M>)[],
    onFiltroValuesChange?: {(v:ValorFiltrado[]):void},
    onBusquedaValuesChange?: {(v:ValorBuscado[]):void}
    itemsIdSelected?: number[],
    itemsIdNoSeleccionables?: number[],     //los que no se puede seleccionar (o desseleccionar)
    onItemsIdSelectedChange?: {(items: ItemsSelected<M>[]):void},
    typeSelcted?: RowSelectionType,
    acciones?: (p: M) => JSX.Element,
    loading?: boolean,
    rowClassName?:string | RowClassName<M>
}

export function generadorColumna<T,QueryBusqueda extends TipoBusqueda>(
    key: keyof T & keyof QueryBusqueda | string,
    sortBy?: ItemSorteado<string>[],
    sortable?:boolean,
    searchable?: boolean,
    valoresAdmitidosFiltro?: ColumnFilterItem[],
    busqueda?: Partial<QueryBusqueda>,
    render?: {(value: any, item:T):React.ReactNode | RenderedCell<T>},
    titulo?: string,
    onFilterChange?: {(value:string[]):void}
): ConfiguracionColumna<T>{
    return {
        key,
        sortable,
        searchable,
        sortOrder: sortBy?.find(r=>r.code===(key as string))?.orden,
        valoresAdmitidosFiltro,
        valoresFiltro: ((busqueda && (busqueda.hasOwnProperty(key)))? busqueda[key]: (searchable?undefined:[])),
        render,
        titulo,
        onFilterChange
    }
}

export function generadorColumnaSimple<T extends Modelable,QueryBusqueda extends TipoBusqueda>(
    cs: ConfiguracionColumnaSimple<T>,
    busqueda?: Partial<QueryBusqueda>,
    sortBy?: ItemSorteado<string>[],
    itemsOriginlaes?: T[],
): ConfiguracionColumna<T>{
    const {
        key,
        sortable,
        searchable,
        valoresAdmitidosFiltro: valoresAdmitidosFiltroOriginal,
        render,
        titulo,
        filtroDesdeValores,
    } = cs
    let valoresAdmitidosFiltro: ColumnFilterItem[]|undefined = valoresAdmitidosFiltroOriginal
    if (filtroDesdeValores) {
        valoresAdmitidosFiltro = itemsOriginlaes?.map(r=> render?render(r[key],r):r[key])?.filter((v,i,s)=>s.indexOf(v)===i)?.map(r=> {
            return {
                value: r?(''+r):'%VALORVACIO%',
                text: r?(''+r):'Sin Especificar',
            }
        }) || []
    }
    return {
        titulo,
        key,
        sortable,
        searchable,
        sortOrder: sortBy?.find(r=>r.code===(key as string))?.orden,
        valoresAdmitidosFiltro,
        valoresFiltro: ((busqueda && (busqueda.hasOwnProperty(key)))? busqueda[key]: (searchable?undefined:[])),
        render
    }
}

export default function TablaGenerica<M extends Modelable> (arg: Parametros<M>){
    const {
        items,
        totalItems,
        page,
        perPage,
        onPaginationChange,
        onOrderByChange,
        configuracionColumnas,
        onFiltroValuesChange,
        onBusquedaValuesChange,
        itemsIdSelected,
        itemsIdNoSeleccionables,
        onItemsIdSelectedChange,
        typeSelcted,
        title,
        acciones,
        loading,
        rowClassName
    } = arg
    const searchInput = useRef<InputRef>(null);
    const createColumnItemFromKey = useCallback(<M extends Modelable>(r: ConfiguracionColumna<M>): ColumnTipoModel<M> =>{
        const {
            key: k,
            titulo,
            sortOrder,
            sortable,
            searchable,
            valoresAdmitidosFiltro,
            valoresFiltro,
            render
        } = r
        const key = typeof k === 'number' ? k : k as string
        const title = titulo || ((k as string).charAt(0).toUpperCase() + (k as string).slice(1))
        const searchText = valoresFiltro?((Array.isArray(valoresFiltro) && valoresFiltro.length)?valoresFiltro[0]: (typeof valoresFiltro === 'string'?valoresFiltro:'')):''
        const renderSearchable = (text: any) => {
            return <Highlighter    // Se trata del render que se va usar para resaltar las palabras buscadas
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
            />
        }
        let renderFinal: {(value:any, item:M):React.ReactNode | RenderedCell<M>}|undefined = undefined
        if (render) {
            if (searchable) {
                renderFinal = (text: any, item: M) => {
                    return renderSearchable(render(text,item))
                }
            } else {
                renderFinal = render
            }
        } else if (searchable) {
            renderFinal = renderSearchable
        }
        const filteredValue = valoresFiltro?(Array.isArray(valoresFiltro)?valoresFiltro:[valoresFiltro]):null
        return {
            dataIndex: key,
            key,
            title,
            sortOrder,
            filters: valoresAdmitidosFiltro,
            filteredValue,
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
                                setSelectedKeys([])
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
            render: renderFinal
        }
    },[])
    const columnas = useMemo((): ColumnsType<M> => {
        const cols: ColumnsType<M> = configuracionColumnas.map(r=>createColumnItemFromKey(r))
        if (acciones) {
            cols.push({
                title: 'Acciones',
                key: 'action',
                render: acciones,
            })
        }
        return cols
    },[acciones, configuracionColumnas, createColumnItemFromKey])
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
        const nuevosValoresFiltrados: (ValorFiltrado & {configuracion?: ConfiguracionColumna<M>})[] = Object.keys(filters).filter(r=>{
            const configuracion = configuracionColumnas.find(c => c.key === r)
            return configuracion && !configuracion?.searchable && Array.isArray(configuracion.valoresAdmitidosFiltro)
        }).map(r=>({
            code: r,
            value: (filters[r] as string[]) ? (filters[r] as string[]) : [],
            configuracion: configuracionColumnas.find(c => c.key === r)
        }))
        const diferenciaFiltrada = nuevosValoresFiltrados.filter(d=>!existeItemEnArray(d,valoresFiltroCalculado, [{key:'code'},{key:'value', comparador:(i1,i2)=>compararArray(i1,i2)}]))
        if (diferenciaFiltrada.length) {
            diferenciaFiltrada.forEach(df => {
                df.configuracion?.onFilterChange?.(df.value)        //llama de forma independiente al handler de la columna (si existiese)
            })
            onFiltroValuesChange && onFiltroValuesChange(diferenciaFiltrada)
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
    const selectedOption = useMemo<TableRowSelection<M>|undefined>(()=>{
        if (itemsIdSelected && onItemsIdSelectedChange) {
            return {
                type:typeSelcted,
                selectedRowKeys:itemsIdSelected,
                getCheckboxProps: (p) => ({
                    disabled: p.id ? itemsIdNoSeleccionables?.includes(p.id) : undefined
                }),
                onChange: (selectedRowKeys: React.Key[]) => {
                    onItemsIdSelectedChange(items
                        .filter(p1=> (p1.id) && ( itemsIdSelected.includes(p1.id) !== selectedRowKeys.includes(p1.id))) //trae solo los que cambiaron de estado
                        .map(p1=>({
                            item: p1,
                            selected: !!(p1.id && selectedRowKeys.includes(p1.id))     //el producto esta seleccionado o no dependiendo si se encuentra en selected
                        })))
                }
            }
        } else {
            return undefined
        }
    },[items, itemsIdNoSeleccionables, itemsIdSelected, onItemsIdSelectedChange, typeSelcted])
    return <Table
        scroll={{ x: 600 }}
        rowClassName={rowClassName}
        loading={loading}
        title={()=>title}
        rowKey={'id'}
        columns={columnas}
        dataSource={items}
        pagination={paginacion}
        onChange={onChange}
        rowSelection={selectedOption}
    />
}

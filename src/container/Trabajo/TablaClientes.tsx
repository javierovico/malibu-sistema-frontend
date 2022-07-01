import {Button, Input, InputRef, Space, Table} from "antd";
import {ListSortCliente, SortCliente} from "../../modelos/Cliente";
import {useCallback, useMemo, useRef, useState} from "react";
import {ColumnasTipoModel, ColumnTipoModel, ItemSorteado, Modelable} from "../../modelos/Generico";
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
    valoresFiltro?: string[]
}

export interface ValorFiltrado {
    code: string,
    value: string[]
}

interface Parametros<M> {
    items: M[],
    page?: number,
    totalItems?: number,
    perPage?: number,
    onPaginationChange?: {(page:number,perPage:number): void},
    onOrderByChange?: {(l: ItemSorteado<string>[]): void}      //enviamos los nuevos sortables list
    configuracionColumnas: ConfiguracionColumna<M>[],
    onFiltroValuesChange?: {(v:ValorFiltrado[]):void}
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
        onFiltroValuesChange
    } = arg

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);

    const handleSearch = useCallback((
        selectedKeys: string[],
        confirm: (param?: FilterConfirmProps) => void,
        dataIndex: string,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex as string);
    },[]);


    const createColumnItemFromKey = useCallback(<M extends Modelable>(k: keyof M, titulo?: string, sortOrder?: SortOrder, sortable?: boolean, searchable?:boolean, valoresAdmitidosFiltro?: ColumnFilterItem[], valoresFiltro?: string|string[]): ColumnTipoModel<M> =>{
        const key = typeof k === 'number' ? k : k as string
        const keyString = k as string
        const title = titulo || ((k as string).charAt(0).toUpperCase() + (k as string).slice(1))
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
                            handleSearch(selectedKeys as string[], confirm, keyString)
                        }}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => handleSearch(selectedKeys as string[], confirm, keyString)}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Search
                        </Button>
                        <Button
                            onClick={() => {
                                setSelectedKeys([''])
                                handleSearch(selectedKeys as string[], confirm, keyString)
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
                                setSearchText((selectedKeys as string[])[0]);
                                setSearchedColumn(keyString);
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
            render: searchable ? text => (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : undefined,
        }
    },[handleSearch, searchText])

    const columnas = useMemo(():ColumnasTipoModel<M> => configuracionColumnas.map(r=>createColumnItemFromKey(r.key, undefined, r.sortOrder, r.sortable, r.searchable, r.valoresAdmitidosFiltro, r.valoresFiltro)),[configuracionColumnas, createColumnItemFromKey])
    const sortCalculado = useMemo(():ItemSorteado<string>[] =>configuracionColumnas.filter(c=>c.sortOrder).map(c=>({
        code: c.key as string,
        orden: c.sortOrder,
    })),[configuracionColumnas])
    const valoresFiltroCalculado = useMemo((): ValorFiltrado[] => configuracionColumnas.filter(r=>r.valoresFiltro).map(c=>({
        code: c.key as string,
        value: c.valoresFiltro || []
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
        const sorterArray = !Array.isArray(sorter) ? [sorter] : sorter
        const nuevoSort: ItemSorteado<string>[] = sorterArray.filter(r=>r.order).map((r=>({
            code: r.columnKey as string,
            orden: r.order
        })))
        if (onOrderByChange && (sortCalculado.length !== nuevoSort.length || sortCalculado.some(t1 => !nuevoSort.find(t2=>t2.orden===t1.orden && t2.code ===t1.code)))) {
            onOrderByChange(nuevoSort)
        }

        const nuevosValoresFiltrados: ValorFiltrado[] = Object.keys(filters).filter(r=>filters[r]).map(r=>({
            code: r,
            value: filters[r] as string[]
        }))
        const cambiosValoresFiltro1: ValorFiltrado[] = nuevosValoresFiltrados.filter(n=>{
            const encontrado = valoresFiltroCalculado.find(v=>v.code === n.code)
            return !encontrado || (encontrado.value.length !== n.value.length || encontrado.value.some(a1 => !n.value.find(a2=>a2===a1)))
        })
        const cambiosValoresFiltro2: ValorFiltrado[] = valoresFiltroCalculado.filter(n=>!nuevosValoresFiltrados.find(a1=>a1.code === n.code)).map((a2)=>({code: a2.code, value: []}))
        const cambiosValoresFiltro: ValorFiltrado[] = [...cambiosValoresFiltro1, ...cambiosValoresFiltro2]
        onFiltroValuesChange && cambiosValoresFiltro.length && onFiltroValuesChange(cambiosValoresFiltro)
    },[onFiltroValuesChange, onOrderByChange, sortCalculado, valoresFiltroCalculado])
    return <Table
        rowKey={'id'}
        columns={columnas}
        dataSource={items}
        pagination={paginacion}
        onChange={onChange}
    />
}

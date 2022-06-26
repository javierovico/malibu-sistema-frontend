import {Button, Input, InputRef, Space, Table} from "antd";
import {
    IProducto,
    isTipoProductoAdmitido, ITipoProducto,
    PRODUCTO_TIPOS_ADMITIDOS,
    TipoProductoAdmitido
} from "../../modelos/Producto";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    ColumnsType,
    FilterValue,
    SorterResult,
    TableCurrentDataSource,
    TablePaginationConfig
} from "antd/lib/table/interface";
import {formateadorNumero} from "../../utils/utils";
import {ColumnType} from "antd/es/table";
import {FilterConfirmProps, SortOrder} from "antd/es/table/interface";
import { SearchOutlined } from '@ant-design/icons';

interface ParametrosRecibidos {
    productos: IProducto[],
    acciones?: (p: IProducto) => JSX.Element,
    title?: JSX.Element | string,
    onFilterTipoProductoChange?: (tipos: TipoProductoAdmitido[]) => void,
    tiposProductos?: TipoProductoAdmitido[],
    onBusquedaIdChange?:(id: string) => void,
    busquedaId?: string,
    onBusquedaCodeChange?:(id: string) => void,
    busquedaCode?: string,
    onBusquedaNombreChange?:(id: string) => void,
    busquedaNombre?: string,
    onOrderByChange?: {(s: SortItems): void},
    orderBy?: SortItems
}

type DataIndex = keyof IProducto
// type SortKeySorteadoT = 'id' | 'codigo' | 'nombre' | 'tipoProducto' | 'precio' | 'costo'

interface SortItems {
    id?: SortOrder,
    codigo?: SortOrder,
    nombre?: SortOrder,
    tipoProducto?: SortOrder,
    precio?: SortOrder,
    costo?: SortOrder
}

type ItemSortAdmitido = keyof SortItems

function useConversorArg(
    argProductos: IProducto[],
    argOnFilterTipoProductoChange?: ((tipos: TipoProductoAdmitido[])=>void),
    argTiposProductos?: TipoProductoAdmitido[],
    argOnBusquedaIdChange?: ((s:string)=>void),
    argBusquedaId?: string,
    argOnBusquedaCodeChange?: ((s:string)=>void),
    argBusquedaCode?: string,
    argOnBusquedaNombreChange?: ((s:string)=>void),
    argBusquedaNombre?: string,
    argOnOrderByChange?: {(s: SortItems): void},
    argOrderBy?: SortItems
) {
    const [tiposProductoDefault, setTiposProductoDefault] = useState<TipoProductoAdmitido[]>([])
    const [busquedaIdDefault, setBusquedaIdDefault] = useState<string>("")
    const [busquedaCodeDefault, setBusquedaCodeDefault] = useState<string>("")
    const [busquedaNombreDefault, setBusquedaNombreDefault] = useState<string>("")
    const [orderByDefault, setOrderByDefault] = useState<SortItems>({nombre:'ascend', costo: 'descend', id:'ascend', tipoProducto: 'descend'})
    const tiposProductos = useMemo(()=>argTiposProductos || tiposProductoDefault,[argTiposProductos, tiposProductoDefault])
    const busquedaId = useMemo(()=>argBusquedaId || busquedaIdDefault,[argBusquedaId, busquedaIdDefault])
    const busquedaCode = useMemo(()=>argBusquedaCode || busquedaCodeDefault,[argBusquedaCode, busquedaCodeDefault])
    const busquedaNombre = useMemo(()=>argBusquedaNombre || busquedaNombreDefault,[argBusquedaNombre, busquedaNombreDefault])
    const sortItems = useMemo(()=>argOrderBy || orderByDefault,[argOrderBy, orderByDefault])
    const onFilterTipoProductoChange = useCallback((tps: TipoProductoAdmitido[])=>{
        if (tiposProductos.length !== tps.length || tiposProductos.some(t1 => !tps.find(t2=>t2===t1))) {
            (argOnFilterTipoProductoChange || setTiposProductoDefault)(tps)
        }
    },[argOnFilterTipoProductoChange, setTiposProductoDefault, tiposProductos])
    const onBusquedaIdChange = useMemo(()=> argOnBusquedaIdChange || setBusquedaIdDefault,[argOnBusquedaIdChange])
    const onBusquedaCodeChange = useMemo(()=> argOnBusquedaCodeChange || setBusquedaCodeDefault,[argOnBusquedaCodeChange])
    const onBusquedaNombreChange = useMemo(()=> argOnBusquedaNombreChange || setBusquedaNombreDefault,[argOnBusquedaNombreChange])
    const onOrderByChange = useMemo(()=> argOnOrderByChange || setOrderByDefault,[argOnOrderByChange])
    const productos = useMemo(()=>{
        let productosFiltrados = [...argProductos]
        //tipo producto
        if (!argOnFilterTipoProductoChange && tiposProductoDefault.length) {
            productosFiltrados = productosFiltrados.filter(p => p.tipo_producto?.code && tiposProductoDefault.includes(p.tipo_producto.code) )
        }
        //id
        if (!argOnBusquedaIdChange && busquedaId) {
            productosFiltrados = productosFiltrados.filter(p => p.id === parseInt(busquedaId) )
        }
        //codigo
        if (!argOnBusquedaCodeChange && busquedaCode) {
            productosFiltrados = productosFiltrados.filter(p => p.codigo === busquedaCode )
        }
        //nombre
        if (!argOnBusquedaNombreChange && busquedaNombre) {
            productosFiltrados = productosFiltrados.filter(p => p.nombre.toLowerCase().includes(busquedaNombre.toLowerCase()) )
        }
        return productosFiltrados
    },[argOnBusquedaCodeChange, argOnBusquedaIdChange, argOnBusquedaNombreChange, argOnFilterTipoProductoChange, argProductos, busquedaCode, busquedaId, busquedaNombre, tiposProductoDefault])
    // useEffect(()=>console.log('productoChange'),[productos])
    // useEffect(()=>console.log('argOnFilterTipoProductoChange change'),[argOnFilterTipoProductoChange])
    // useEffect(()=>console.log('tiposProductoDefault change'),[tiposProductoDefault])
    return {
        productos,
        onFilterTipoProductoChange,
        onBusquedaIdChange,
        onBusquedaCodeChange,
        onBusquedaNombreChange,
        onOrderByChange,
        tiposProductos,
        busquedaId,
        busquedaCode,
        busquedaNombre,
        sortItems
    }
}

const RELACIONES_SORT: {[k:string]:ItemSortAdmitido}= {
    'tipo_producto.code': 'tipoProducto'
}


export default function TablaProductos(arg: ParametrosRecibidos) {
    const {
        title,
        acciones,
    } = arg
    const {
        onFilterTipoProductoChange,
        tiposProductos,
        productos,
        onBusquedaIdChange,
        onBusquedaCodeChange,
        onBusquedaNombreChange,
        onOrderByChange,
        busquedaId,
        busquedaCode,
        busquedaNombre,
        sortItems
    } = useConversorArg(
        arg.productos,
        arg.onFilterTipoProductoChange,
        arg.tiposProductos,
        arg.onBusquedaIdChange,
        arg.busquedaId,
        arg.onBusquedaCodeChange,
        arg.busquedaCode,
        arg.onBusquedaNombreChange,
        arg.busquedaNombre,
        arg.onOrderByChange,
        arg.orderBy
    )

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);

    const handleSearch = useCallback((
        selectedKeys: string[],
        confirm: (param?: FilterConfirmProps) => void,
        dataIndex: DataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    },[]);

    const handleReset = useCallback((clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    },[])

    const getColumnSearchProps = useCallback((dataIndex: DataIndex): ColumnType<IProducto>=>({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
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
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
    }),[handleReset, handleSearch])

    const columnas = useMemo((): ColumnsType<IProducto>=> {
        const columnas: ColumnsType<IProducto> = [
            {
                title: 'ID',
                key: 'id',
                dataIndex: 'id',
                ...getColumnSearchProps('id'),
                filteredValue: busquedaId ? [busquedaId] : null,
                sorter: {
                    multiple: 1
                },
                sortOrder: sortItems.id,
            },
            {
                title: 'Codigo',
                key: 'codigo',
                dataIndex: 'codigo',
                ...getColumnSearchProps('codigo'),
                filteredValue: busquedaCode ? [busquedaCode] : null,
                sorter: {
                    multiple: 1
                },
                sortOrder: sortItems.codigo,
            },
            {
                title: 'Nombre',
                key: 'nombre',
                dataIndex: 'nombre',
                ...getColumnSearchProps('nombre'),
                filteredValue: busquedaNombre ? [busquedaNombre] : null,
                sorter: {
                    multiple: 1
                },
                sortOrder: sortItems.nombre,
            },
            {
                title: 'Tipo',
                key: 'tipo_producto.code',
                dataIndex: ['tipo_producto','descripcion'],
                filters: PRODUCTO_TIPOS_ADMITIDOS.map(tp=> ({
                    text: tp.descripcion,
                    value: tp.code
                })),
                filteredValue: tiposProductos ? tiposProductos : null,
                sorter: {
                    multiple: 1
                },
                sortOrder: sortItems.tipoProducto,
            },
            {
                title: 'Precio',
                key: 'precio',
                dataIndex: 'precio',
                render: value => formateadorNumero(value) + ' Gs.',
                sorter: {
                    multiple: 1
                },
                sortOrder: sortItems.precio,
            },
            {
                title: 'Costo',
                key: 'costo',
                dataIndex: 'costo',
                render: value => formateadorNumero(value) + ' Gs.',
                sorter: {
                    multiple: 1
                },
                sortOrder: sortItems.costo,
            },
        ]
        if (acciones) {
            columnas.push({
                title: 'Acciones',
                key: 'action',
                render: acciones,
            })
        }
        return columnas
    },[acciones, busquedaCode, busquedaId, busquedaNombre, getColumnSearchProps, sortItems.codigo, sortItems.costo, sortItems.id, sortItems.nombre, sortItems.precio, sortItems.tipoProducto, tiposProductos])
    const onChange = useCallback((pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult<IProducto> | SorterResult<IProducto>[], extra: TableCurrentDataSource<IProducto>)=>{
        onFilterTipoProductoChange(filters['tipo_producto.code']?.filter(f=>isTipoProductoAdmitido(f)).map(f=> isTipoProductoAdmitido(f)?f:'simple') || [])
        onBusquedaIdChange(filters.id ? filters.id[0] as string: '')
        onBusquedaCodeChange(filters.codigo ? filters.codigo[0] as string: '')
        onBusquedaNombreChange(filters.nombre ? filters.nombre[0] as string: '')
        const sortItemsNuevo: SortItems = {}
        const sorterArray = !Array.isArray(sorter) ? [sorter] : sorter
        sorterArray.forEach(s=>{
            const key: ItemSortAdmitido = RELACIONES_SORT[s.columnKey as string] || s.columnKey
            sortItemsNuevo[key] = s.order
        })
        onOrderByChange(sortItemsNuevo)
    },[onBusquedaCodeChange, onBusquedaIdChange, onBusquedaNombreChange, onFilterTipoProductoChange, onOrderByChange])
    useEffect(()=>console.log(sortItems),[sortItems])
    return <Table onChange={onChange} title={()=>title} rowKey={'id'} columns={columnas} dataSource={productos} />
}

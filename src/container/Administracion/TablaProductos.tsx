import { Button, Input, InputRef, Space, Table} from "antd";
import Highlighter from 'react-highlight-words';
import {
    IProducto,
    isTipoProductoAdmitido, PRODUCTO_TIPOS_ADMITIDOS, SortsProductos,
    TipoProductoAdmitido
} from "../../modelos/Producto";
import {useCallback, useMemo, useRef, useState} from "react";
import {
    ColumnsType,
    FilterValue,
    SorterResult,
    TablePaginationConfig, TableRowSelection
} from "antd/lib/table/interface";
import {formateadorNumero} from "../../utils/utils";
import {ColumnType} from "antd/es/table";
import {FilterConfirmProps} from "antd/es/table/interface";
import { SearchOutlined } from '@ant-design/icons';
import {ProductoSelected} from "./SelectDeProductos";
import {ItemSorteado} from "../../modelos/Generico";

type SortItems = ItemSorteado<SortsProductos>[]

interface ParametrosRecibidos {
    productos: IProducto[],
    acciones?: (p: IProducto) => JSX.Element,
    title?: JSX.Element | string,
    onFilterTipoProductoChange?: (tipos: TipoProductoAdmitido[]) => void,
    tiposProductosAdmitidos?: TipoProductoAdmitido[],
    tiposProductos?: TipoProductoAdmitido[],
    onBusquedaIdChange?:(id: number|undefined) => void,
    busquedaId?: number,
    onBusquedaCodeChange?:(id: string) => void,
    busquedaCode?: string,
    onBusquedaNombreChange?:(id: string) => void,
    busquedaNombre?: string,
    onOrderByChange?: {(s: SortItems): void},
    orderBy?: SortItems,
    page?: number,
    totalItems?: number,
    perPage?: number,
    onPaginationChange?: {(page:number,perPage:number): void},
    productosIdSelected?: number[],
    onProductosIdSelectedChange?: {(items: ProductoSelected[]):void}
}

type DataIndex = keyof IProducto

function useConversorArg(
    argProductos: IProducto[],
    argOnFilterTipoProductoChange?: ((tipos: TipoProductoAdmitido[])=>void),
    argTiposProductos?: TipoProductoAdmitido[],
    argOnBusquedaIdChange?: ((s:number|undefined)=>void),
    argBusquedaId?: number,
    argOnBusquedaCodeChange?: ((s:string)=>void),
    argBusquedaCode?: string,
    argOnBusquedaNombreChange?: ((s:string)=>void),
    argBusquedaNombre?: string,
    argOnOrderByChange?: {(s: SortItems): void},
    argOrderBy?: SortItems,
    argOnPaginationChange?: {(page:number,perPage:number): void},
    argPerPage?: number,
    argPage?: number,
    argTotalItems?: number
) {
    const [tiposProductoDefault, setTiposProductoDefault] = useState<TipoProductoAdmitido[]>([])
    const [busquedaIdDefault, setBusquedaIdDefault] = useState<number|undefined>(undefined)
    const [busquedaCodeDefault, setBusquedaCodeDefault] = useState<string>("")
    const [busquedaNombreDefault, setBusquedaNombreDefault] = useState<string>("")
    const [orderByDefault, setOrderByDefault] = useState<SortItems>([])
    const [pageDefault,setPageDefault] = useState<number>(1)
    const [perPageDefault,setPerPageDefault] = useState<number>(10)
    const tiposProductos = useMemo(()=>argTiposProductos || tiposProductoDefault,[argTiposProductos, tiposProductoDefault])
    const busquedaId = useMemo(()=>argBusquedaId || busquedaIdDefault,[argBusquedaId, busquedaIdDefault])
    const busquedaCode = useMemo(()=>argBusquedaCode || busquedaCodeDefault,[argBusquedaCode, busquedaCodeDefault])
    const busquedaNombre = useMemo(()=>argBusquedaNombre || busquedaNombreDefault,[argBusquedaNombre, busquedaNombreDefault])
    const orderItems = useMemo(()=>argOrderBy || orderByDefault,[argOrderBy, orderByDefault])
    const perPage = useMemo(()=>argPerPage || perPageDefault,[argPerPage, perPageDefault])
    const page = useMemo(()=>argPage || pageDefault,[argPage, pageDefault])
    const onFilterTipoProductoChange = useCallback((tps: TipoProductoAdmitido[])=>{
        if (tiposProductos.length !== tps.length || tiposProductos.some(t1 => !tps.find(t2=>t2===t1))) {
            (argOnFilterTipoProductoChange || setTiposProductoDefault)(tps)
        }
    },[argOnFilterTipoProductoChange, setTiposProductoDefault, tiposProductos])
    const onBusquedaIdChange = useCallback((s:number|undefined)=>{
        if (busquedaId !== s) {
            (argOnBusquedaIdChange || setBusquedaIdDefault)(s)
        }
    },[argOnBusquedaIdChange, busquedaId])
    const onBusquedaCodeChange = useCallback((s:string)=>{
        if (busquedaCode !== s) {
            (argOnBusquedaCodeChange || setBusquedaCodeDefault)(s)
        }
    },[argOnBusquedaCodeChange, busquedaCode])
    const onBusquedaNombreChange = useCallback((s:string)=>{
        if (busquedaNombre !== s) {
            (argOnBusquedaNombreChange || setBusquedaNombreDefault)(s)
        }
    },[argOnBusquedaNombreChange, busquedaNombre])
    const onOrderByChange = useCallback((tps: SortItems)=>{
        if (orderItems.length !== tps.length || orderItems.some(t1 => !tps.find(t2=>t2.orden===t1.orden && t2.code ===t1.code))) {
            (argOnOrderByChange || setOrderByDefault)(tps)
        }
    },[argOnOrderByChange, orderItems])
    const onPaginationChange = useCallback((p:number, pp:number)=> {
        if (p !== page || pp !== perPage) {
            if (argOnPaginationChange) {
                argOnPaginationChange(p,pp)
            }else {
                setPageDefault(p)
                setPerPageDefault(pp)
            }
        }
    },[argOnPaginationChange, page, perPage])
    const productos = useMemo(()=>{
        let productosFiltrados = [...argProductos]
        //tipo producto
        if (!argOnFilterTipoProductoChange && tiposProductoDefault.length) {
            productosFiltrados = productosFiltrados.filter(p => p.tipo_producto?.code && tiposProductoDefault.includes(p.tipo_producto.code) )
        }
        //id
        if (!argOnBusquedaIdChange && busquedaId) {
            productosFiltrados = productosFiltrados.filter(p => p.id === busquedaId )
        }
        //codigo
        if (!argOnBusquedaCodeChange && busquedaCode) {
            productosFiltrados = productosFiltrados.filter(p => p.codigo === busquedaCode )
        }
        //nombre
        if (!argOnBusquedaNombreChange && busquedaNombre) {
            productosFiltrados = productosFiltrados.filter(p => p.nombre.toLowerCase().includes(busquedaNombre.toLowerCase()) )
        }
        //Ordenacion
        if (!argOnOrderByChange && orderItems.length) {
            productosFiltrados = productosFiltrados.sort((p1,p2)=>{
                const sortId = orderItems.find(i=>i.code === 'id')?.orden
                const sortCodigo = orderItems.find(i=>i.code === 'codigo')?.orden
                const sortNombre = orderItems.find(i=>i.code === 'nombre')?.orden
                const sortTipoProducto = orderItems.find(i=>i.code === 'tipo_producto_id')?.orden
                const sortPrecio = orderItems.find(i=>i.code === 'precio')?.orden
                const sortCosto = orderItems.find(i=>i.code === 'costo')?.orden
                //Primero la prioridad mas alta
                if (sortTipoProducto && p1.tipo_producto?.code !== p2.tipo_producto?.code) {
                    return (sortTipoProducto === 'ascend' ? 1 : -1) * ((p1.tipo_producto?.code && p2.tipo_producto?.code) ? (p1.tipo_producto?.code.localeCompare(p2.tipo_producto?.code)) : (p1.tipo_producto?.code?1:-1))
                }
                if (sortPrecio && p1.precio !== p2.precio) {
                    return (sortPrecio === 'ascend' ? 1 : -1) * (p1.precio - p2.precio)
                }
                if (sortCosto && p1.costo !== p2.costo) {
                    return (sortCosto === 'ascend' ? 1 : -1) * (p1.costo - p2.costo)
                }
                if (sortNombre && p1.nombre !== p2.nombre) {
                    return (sortNombre === 'ascend' ? 1 : -1) * (p1.nombre.localeCompare(p2.nombre))
                }
                if (sortCodigo && p1.codigo !== p2.codigo) {
                    return (sortCodigo === 'ascend' ? 1 : -1) * (p1.codigo.localeCompare(p2.codigo))
                }
                if (sortId && p1.id !== p2.id) {
                    return (sortId === 'ascend' ? 1 : -1) * ((p1.id && p2.id) ? (p1.id - p2.id) : (p1.id?1:-1))
                }
                return 0
            })
        }
        return productosFiltrados
    },[argOnBusquedaCodeChange, argOnBusquedaIdChange, argOnBusquedaNombreChange, argOnFilterTipoProductoChange, argOnOrderByChange, argProductos, busquedaCode, busquedaId, busquedaNombre, orderItems, tiposProductoDefault])
    const totalItems = useMemo(()=>argTotalItems || productos.length,[argTotalItems, productos.length])
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
        onPaginationChange,
        tiposProductos,
        busquedaId,
        busquedaCode,
        busquedaNombre,
        orderItems,
        perPage,
        page,
        totalItems,
    }
}

const RELACIONES_SORT: {[k:string]:SortsProductos}= {
    'tipo_producto.code': 'tipo_producto_id'
}


export default function TablaProductos(arg: ParametrosRecibidos) {
    const {
        title,
        acciones,
        onProductosIdSelectedChange,
        productosIdSelected,
        tiposProductosAdmitidos
    } = arg
    const {
        onFilterTipoProductoChange,
        tiposProductos,
        productos,
        onBusquedaIdChange,
        onBusquedaCodeChange,
        onBusquedaNombreChange,
        onOrderByChange,
        onPaginationChange,
        busquedaId,
        busquedaCode,
        busquedaNombre,
        orderItems,
        perPage,
        page,
        totalItems,
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
        arg.orderBy,
        arg.onPaginationChange,
        arg.perPage,
        arg.page,
        arg.totalItems,
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

    const getColumnSearchProps = useCallback((dataIndex: DataIndex): ColumnType<IProducto>=>({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm}) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={(e) => {
                        e.stopPropagation()
                        handleSearch(selectedKeys as string[], confirm, dataIndex)
                    }}
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
                        onClick={() => {
                            setSelectedKeys([''])
                            handleSearch(selectedKeys as string[], confirm, dataIndex)
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
        render: text =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    }),[handleSearch, searchText, searchedColumn])

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
                sortOrder: orderItems.find(r=>r.code === 'id')?.orden,
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
                sortOrder: orderItems.find(r=>r.code === 'codigo')?.orden,
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
                sortOrder: orderItems.find(r=>r.code === 'nombre')?.orden,
            },
            {
                title: 'Tipo',
                key: 'tipo_producto.code',
                dataIndex: ['tipo_producto','descripcion'],
                filters: PRODUCTO_TIPOS_ADMITIDOS.filter(tpa => !tiposProductosAdmitidos || tiposProductosAdmitidos.includes(tpa.code)).map(tp=> ({
                    text: tp.descripcion,
                    value: tp.code
                })),
                filteredValue: tiposProductos ? tiposProductos : null,
                sorter: {
                    multiple: 1
                },
                sortOrder: orderItems.find(r=>r.code === 'tipo_producto_id')?.orden,
            },
            {
                title: 'Precio',
                key: 'precio',
                dataIndex: 'precio',
                render: (value, p) => formateadorNumero(p.pivot?.precio??value) + ' Gs.',
                sorter: {
                    multiple: 1
                },
                sortOrder: orderItems.find(r=>r.code === 'precio')?.orden,
            },
            {
                title: 'Costo',
                key: 'costo',
                dataIndex: 'costo',
                render: (value,p) => formateadorNumero(p.pivot?.costo??value) + ' Gs.',
                sorter: {
                    multiple: 1
                },
                sortOrder: orderItems.find(r=>r.code === 'costo')?.orden,
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
    },[acciones, busquedaCode, busquedaId, busquedaNombre, getColumnSearchProps, orderItems, tiposProductos, tiposProductosAdmitidos])
    const onChange = useCallback((pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult<IProducto> | SorterResult<IProducto>[])=>{
        onFilterTipoProductoChange(filters['tipo_producto.code']?.filter(f=>isTipoProductoAdmitido(f)).map(f=> isTipoProductoAdmitido(f)?f:'simple') || [])
        onBusquedaIdChange((filters.id && !isNaN(parseInt(filters.id[0] as string))) ? parseInt(filters.id[0] as string): undefined)
        onBusquedaCodeChange(filters.codigo ? filters.codigo[0] as string: '')
        onBusquedaNombreChange(filters.nombre ? filters.nombre[0] as string: '')
        const sorterArray = !Array.isArray(sorter) ? [sorter] : sorter
        const orderItemsNuevo: SortItems = sorterArray.filter(s=>s.order).map(s=>({
            code: RELACIONES_SORT[s.columnKey as string] || s.columnKey,
            orden: s.order
        }))
        onOrderByChange(orderItemsNuevo)
    },[onBusquedaCodeChange, onBusquedaIdChange, onBusquedaNombreChange, onFilterTipoProductoChange, onOrderByChange])
    const selectedOption = useMemo<TableRowSelection<IProducto>|undefined>(()=>{
        if (productosIdSelected && onProductosIdSelectedChange) {
            return {
                selectedRowKeys:productosIdSelected,
                onChange: (selectedRowKeys: React.Key[]) => {
                    onProductosIdSelectedChange(productos
                        .filter(p1=> (p1.id) && ( productosIdSelected.includes(p1.id) !== selectedRowKeys.includes(p1.id))) //trae solo los que cambiaron de estado
                        .map(p1=>({
                            producto: p1,
                            selected: !!(p1.id && selectedRowKeys.includes(p1.id))     //el producto esta seleccionado o no dependiendo si se encuentra en selected
                        })))
                }
            }
        } else {
            return undefined
        }
    },[onProductosIdSelectedChange, productos, productosIdSelected])
    // useEffect(()=>console.log({long:productos.length}),[productos.length])
    // useEffect(()=>console.log({totalItems}),[totalItems])
    // useEffect(()=>console.log({perPage}),[perPage])
    return <Table
        pagination={{
            pageSizeOptions:[4,10,20,50],
            showQuickJumper:true,
            showSizeChanger:true,
            pageSize:totalItems > productos.length ? (productos.length > perPage ? productos.length : perPage) : perPage,
            current:page,
            onChange:onPaginationChange,
            total:totalItems,
        }}
        onChange={onChange}
        title={()=>title}
        rowKey={'id'}
        columns={columnas}
        dataSource={productos}
        rowSelection={selectedOption}
    />
}

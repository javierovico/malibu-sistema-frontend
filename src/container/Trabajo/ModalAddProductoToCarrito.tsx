import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    InputNumber,
    List,
    Modal,
    Popover,
    Row, Spin,
    Tooltip,
    Typography
} from "antd";
import * as React from "react";
import {useMemo, useState} from "react";
import {ICarrito, precioCarritoProducto} from "../../modelos/Carrito";
import {Field, Formik} from "formik";
import {AntInput, AntSelect} from "../../components/UI/Antd/AntdInputWithFormik";
import {
    CheckOutlined,
    DeleteOutlined,
    EllipsisOutlined,
    FastForwardOutlined,
    PlusOutlined,
    SearchOutlined
} from "@ant-design/icons";
import {
    EnumTipoProducto, IProducto,
    PRODUCTO_TIPOS_ADMITIDOS, PRODUCTO_TIPOS_CONSUMIBLES,
    QueryGetProductos,
    TipoBusquedaProductos,
    useProductos
} from "../../modelos/Producto";
import {formateadorNumero} from "../../utils/utils";
import iconoComida from '../../img/2819383.png'
import {ResponseAPIPaginado} from "../../modelos/ResponseAPI";

const {Text} = Typography

interface Argumentos {
    carrito?: ICarrito,
    onCancel: { (): void },
    handleAddProducto: {(p:IProducto, c: number) : Promise<void>},
}

interface TipoDefinido {
    label: string,
    value: string | undefined
}

export default function ModalAddProductoToCarrito(arg: Argumentos) {
    const {
        carrito,
        onCancel,
        handleAddProducto,
    } = arg
    const [tipoBusqueda, setTipoBusqueda] = useState<TipoBusquedaProductos>("nombre")
    const [nombre, setNombre] = useState<string>("")
    const [codigo, setCodigo] = useState<string>("")
    const [tipoProducto, setTipoProducto] = useState<EnumTipoProducto | 'undefined'>('undefined')
    const [page, setPage] = useState<number>(1)
    const perPage = useMemo(() => 8, [])
    const itemsBusqueda = useMemo<QueryGetProductos>(() => ({
        id: '',
        nombre,
        codigo,
        tiposProducto: tipoProducto !== 'undefined' ? [tipoProducto] : PRODUCTO_TIPOS_CONSUMIBLES.map(p => p.code),
    }), [codigo, nombre, tipoProducto])

    const {
        paginacion,
        isProductosLoading,
        errorProductos,
        productoUpdate,
        productoModificando,
        setProductoModificando,
        handleBorrarProducto
    } = useProductos(page, perPage, undefined, itemsBusqueda)
    const selectedOptions = useMemo(() => {
        const a: TipoDefinido[] = PRODUCTO_TIPOS_CONSUMIBLES.map(tp => ({
            label: tp.descripcion,
            value: tp.code
        }))
        const b: TipoDefinido[] = [{label: 'Todos', value: 'undefined'}]
        return b.concat(a)
    }, [])
    return <>
        <Modal  //Modal para mostrar los productos actuales
            title="Agregar producto al carrito"
            destroyOnClose={true}
            width={'100%'}
            footer={null}
            visible={!!carrito}
            onCancel={onCancel}
        >
            <Divider>Filtrado</Divider>
            <Formik
                initialValues={{tipoBusqueda, nombre, tipoProducto, codigo}}
                onSubmit={(val) => {
                    setTipoBusqueda(val.tipoBusqueda)
                    setNombre(val.nombre)
                    setTipoProducto(val.tipoProducto)
                    setCodigo(val.codigo)
                }}
            >
                {({handleSubmit, submitCount}) => <Form>
                    <Row justify="start" gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                            <Field
                                component={AntInput}
                                name='nombre'
                                type='text'
                                label='Nombre'
                                submitCount={submitCount}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                            <Field
                                component={AntInput}
                                name='codigo'
                                type='text'
                                label='Codigo'
                                submitCount={submitCount}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                            <Field
                                component={AntSelect}
                                name='tipoProducto'
                                label='Tipo De Producto'
                                selectOptionsKeyValue={selectedOptions}
                                submitCount={submitCount}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Button htmlType="submit" type="primary" icon={<SearchOutlined/>} onClick={() => {
                                handleSubmit()
                            }}>
                                Buscar
                            </Button>
                        </Col>
                    </Row>
                </Form>}
            </Formik>
            <Divider>Resultados</Divider>
            <ListaProductos
                productos={paginacion.data}
                page={page}
                setPage={setPage}
                totalItems={paginacion.total}
                loading={isProductosLoading}
                handleAddProducto={handleAddProducto}
            />
        </Modal>
    </>
}

function ListaProductos(arg: { productos: IProducto[], page: number, setPage: { (n: number): void }, totalItems: number, loading: boolean, handleAddProducto: {(p:IProducto, c: number) : Promise<void>}}) {
    const {
        productos,
        page,
        totalItems,
        setPage,
        loading,
        handleAddProducto,
    } = arg
    const [productoOpen, setProductoOpen] = useState<number|undefined>(undefined)   //para definir cual producto esta presto a ser agregado y abrir el popup
    return <List
        className='list-flexible'
        loading={loading}
        grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 6,
            xxl: 8,
        }}
        dataSource={productos}
        pagination={{
            current: page,
            onChange: setPage,
            total: totalItems,
            position: 'both',
            showSizeChanger: false,
            className: 'paginacion-espaciada'
        }}
        renderItem={p => (
            <List.Item className='height-100'>
                <Card
                    loading={loading}
                    className='flexible-card height-100'
                    actions={[
                        <Popover visible={p.id === productoOpen} onVisibleChange={(v) => v?setProductoOpen(p.id!!):setProductoOpen(undefined)} key='agregarProducto' title='Cantidad' trigger='click' content={
                            <ContentPopOver
                                onSubmit={(c) => {
                                    return new Promise<void>((resolve => {
                                        handleAddProducto(p, c).finally(()=>{
                                            setProductoOpen(undefined)      //cierra el popup
                                            resolve()   //avisa al formulario que se resetee
                                        })
                                    }))
                                }}
                            />
                        }>
                            <PlusOutlined onClick={() => {
                            }}/>
                        </Popover>
                    ]}
                    cover={
                        <img
                            alt={p.nombre}
                            src={p.imagen?.url ?? iconoComida}
                        />
                    }
                >
                    <Card.Meta
                        title={p.nombre}
                        description={<>
                            <p>
                                <Text
                                    type='secondary'>Precio: {formateadorNumero(precioCarritoProducto(p)) + ' Gs.'}</Text>
                            </p>
                            <p>
                                <Text type='secondary'>{p.tipo_producto?.descripcion}</Text>
                            </p>
                            {p.descripcion}
                        </>}
                    />
                </Card>
            </List.Item>
        )}
    />
}

function ContentPopOver(arg: {onSubmit: {(n:number) : Promise<void>}}) {
    const {
        onSubmit
    } = arg
    return <Formik
        initialValues={{cantidad: 1}}
        onSubmit={(val, h) => {
            onSubmit(val.cantidad).finally(()=>{
                h.resetForm()
            })
        }}
    >
        {({handleSubmit, values, setValues, isSubmitting}) => <Spin tip="Guardando..." size='large' spinning={isSubmitting}><Form disabled={isSubmitting}>
            <Row justify="space-between" gutter={12}>
                <Col span={8}>
                    <InputNumber size='large' min={1} value={values.cantidad} onChange={(d) => setValues({cantidad: d})} />
                </Col>
                <Col span={8}>
                    <Button htmlType="submit" type="primary" icon={<CheckOutlined />} onClick={() => {
                        handleSubmit()
                    }}>
                    </Button>
                </Col>
            </Row>
        </Form></Spin>}
    </Formik>
}

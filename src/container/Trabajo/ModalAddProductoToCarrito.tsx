import {Button, Card, Col, Divider, Form, Input, Modal, Row, Tooltip, Typography} from "antd";
import * as React from "react";
import {useMemo, useState} from "react";
import {ICarrito, precioCarritoProducto} from "../../modelos/Carrito";
import {Field, Formik} from "formik";
import {AntInput, AntSelect} from "../../components/UI/Antd/AntdInputWithFormik";
import {DeleteOutlined, EllipsisOutlined, FastForwardOutlined, SearchOutlined} from "@ant-design/icons";
import {
    EnumTipoProducto, IProducto,
    PRODUCTO_TIPOS_ADMITIDOS,
    QueryGetProductos,
    TipoBusquedaProductos,
    useProductos
} from "../../modelos/Producto";
import {formateadorNumero} from "../../utils/utils";
const {Text} = Typography

interface Argumentos {
    carrito?: ICarrito,
    onCancel: { (): void },
}


export default function ModalAddProductoToCarrito(arg: Argumentos) {
    const {
        carrito,
        onCancel
    } = arg
    const [tipoBusqueda, setTipoBusqueda] = useState<TipoBusquedaProductos>("nombre")
    const [nombre, setNombre] = useState<string>("")
    const [codigo, setCodigo] = useState<string>("")
    const [tipoProducto, setTipoProducto] = useState<EnumTipoProducto>(EnumTipoProducto.TIPO_SIMPLE)
    const [page,setPage] = useState<number>(1)
    const perPage = useMemo(()=>6,[])
    const itemsBusqueda = useMemo<QueryGetProductos>(()=>({
        id: '',
        nombre,
        codigo,
        tiposProducto: [tipoProducto],
    }),[codigo, nombre, tipoProducto])

    const {
        paginacion,
        isProductosLoading,
        errorProductos,
        productoUpdate,
        productoModificando,
        setProductoModificando,
        handleBorrarProducto
    } = useProductos(page, perPage, undefined, itemsBusqueda)
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
                onSubmit={(val)=>{
                    setTipoBusqueda(val.tipoBusqueda)
                    setNombre(val.nombre)
                    setTipoProducto(val.tipoProducto)
                    setCodigo(val.codigo)
                }}
            >
                {({handleSubmit,submitCount})=><Form>
                    <Row justify="start"  gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Field
                                component={AntInput}
                                name='codigo'
                                type='text'
                                label='Codigo'
                                submitCount={submitCount}
                                hasFeedback
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Field
                                component={AntInput}
                                name='nombre'
                                type='text'
                                label='Nombre'
                                submitCount={submitCount}
                                hasFeedback
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Field
                                component={AntSelect}
                                name='tipoProducto'
                                label='Tipo De Producto'
                                selectOptionsKeyValue={PRODUCTO_TIPOS_ADMITIDOS.map(tp => ({
                                    label: tp.descripcion,
                                    value: tp.code
                                }))}
                                submitCount={submitCount}
                            />
                        </Col>
                    </Row>
                </Form>}
            </Formik>
            <Divider>Resultados</Divider>
            <ListaProductos productos={paginacion.data}/>
        </Modal>
    </>
}

function ListaProductos (arg: {productos: IProducto[]}) {
    return <Row gutter={[10, 10]}>
        {arg.productos.map((p:IProducto) => {
            const acciones: React.ReactNode[] =  [
                <Tooltip title='Quitar Producto' key='quitarProducto'><DeleteOutlined onClick={()=>{}}/></Tooltip>,
                <Tooltip title='Avanzar estado' key='next'><FastForwardOutlined onClick={()=>{}}/></Tooltip>,
                <EllipsisOutlined key="ellipsis"/>,
            ]
            return <Col key={p.id} className='col-card' xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                    className='flexible-card'
                    actions={acciones}
                    cover={
                        <img
                            alt={p.nombre}
                            src={p.imagen?.url ?? 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'}
                        />
                    }
                >
                    <Card.Meta
                        title={p.nombre}
                        description={<>
                            <p><Text type='secondary'>Cantidad: {p.pivot?.cantidad}</Text></p>
                            <p><Text type='secondary'>Precio total: {formateadorNumero(precioCarritoProducto(p)) + ' Gs.'}</Text></p>
                            {p.descripcion}
                        </>}
                    />
                </Card>
            </Col>
        })}
    </Row>

}

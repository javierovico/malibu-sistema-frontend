import {LikeOutlined, MessageOutlined, EditOutlined, DeleteOutlined, SearchOutlined} from '@ant-design/icons';
import {Avatar, Button, Divider, List, Modal, Space, Image, Popconfirm, Input, Form} from 'antd';
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {IProducto, ItemBusqueda, TipoBusqueda, URL_GET_PRODUCTOS, useProductos} from "../../modelos/Producto";
import {Formik,Field} from 'formik'
import {
    createItemNumber,
    createItemString, ItemQuery,
    ParamsQuerys,
    useParametros
} from "../../hook/hookQuery";
import ModificarProducto from "./ModificarProducto";
import {AntInput, AntSelect} from "../../components/UI/Antd/AntdInputWithFormik";


export const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);


interface ParametrosAdminProducto {
    page: number,
    perPage: number,
    busqueda: string,
    tipoBusqueda: TipoBusqueda
}


const itemPerPage = createItemNumber(10)
const itemPage = createItemNumber()
const itemBusqueda = createItemString()
const itemTipoBusqueda: ItemQuery<TipoBusqueda> = {
    defaultValue: "nombre",
    valueToQuery: i => i,
    queryToValue: i => {
        if (i==="nombre" || i==="codigo" || i==="id") {
            return i
        } else {
            return "nombre"
        }
    }
}

export default function AdminProducto() {
    const itemList = useMemo((): ParamsQuerys<ParametrosAdminProducto> =>({
        page: itemPage,
        perPage: itemPerPage,
        busqueda: itemBusqueda,
        tipoBusqueda: itemTipoBusqueda,
    }),[])
    const {
        paramsURL,
        setParamsToURL
    } = useParametros<ParametrosAdminProducto>(itemList)
    const {
        busqueda,
        perPage,
        page,
        tipoBusqueda,
    } = paramsURL
    const itemsBusqueda = useMemo<ItemBusqueda[]>(()=>busqueda?[{columna:tipoBusqueda, valor:busqueda}]:[],[busqueda, tipoBusqueda])
    const {
        paginacion,
        isProductosLoading,
        errorProductos,
        productoUpdate,
        productoModificando,
        setProductoModificando,
        handleBorrarProducto
    } = useProductos(page, perPage, undefined, undefined, itemsBusqueda)
    useEffect(()=>{
        if (!isProductosLoading && (page > paginacion.last_page)) {
            setParamsToURL({...paramsURL,page:paginacion.last_page})
        }
    },[isProductosLoading, page, paginacion.last_page, paramsURL, setParamsToURL])
    const [isModalVisible, setIsModalVisible] = useState(false)
    const handleAgregarNuevoProducto = useCallback(()=>{
        setProductoModificando(undefined)
        setIsModalVisible(true)
    },[setProductoModificando])
    const handleModificarProducto = useCallback((p?: IProducto)=>{
        setIsModalVisible(!!p)
        setProductoModificando(p)
        // setTimeout(()=>{setIsModalVisible(!!p)},1000)
    },[setProductoModificando])
    // useEffect(()=>console.log('productoModificando cambio'),[productoModificando])
    const VistaModal = <Modal destroyOnClose={true} width={'85%'} footer={null} closable={false} visible={isModalVisible} onCancel={()=>handleModificarProducto()}>
        <ModificarProducto producto={productoModificando} productoChange={productoUpdate}/>
    </Modal>
    const listaProductos = (
        <List
            loading={isProductosLoading}
            itemLayout="vertical"
            size="large"
            pagination={{
                pageSizeOptions:[4,10,20,50],
                showQuickJumper:true,
                showSizeChanger:true,
                // pageSize:perPage,
                current:page,
                onChange:(page,perPage)=>{
                    setParamsToURL({...paramsURL,page,perPage})
                },
                total:paginacion.total}}
            dataSource={paginacion.data}
            footer={
                <div>
                    <b>ant design</b> footer part
                </div>
            }
            renderItem={item => (
                <List.Item
                    key={item.id}
                    actions={[
                        <Button type="link" onClick={()=>handleModificarProducto(item)}  key="modificar">
                            <IconText icon={EditOutlined} text="Modificar" />
                        </Button>,
                        <Popconfirm
                            key="borrar"
                            okText="Si"
                            cancelText="No"
                            title="Seguro que desea borrar?"
                            onConfirm={()=>handleBorrarProducto(item)}
                        >
                            <Button type="link" >
                                <IconText icon={DeleteOutlined} text="Borrar"/>
                            </Button>
                        </Popconfirm>,
                        <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
                        <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
                    ]}
                    extra={
                        <Image
                            width={200}
                            src={item?.imagen?.url || 'nope'}
                            fallback="data:image/png;base64,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"
                        />
                    }
                >
                    <List.Item.Meta
                        avatar={<Avatar src={item.url} />}
                        title={<a href={`${URL_GET_PRODUCTOS}/${item.id}`}>{item.nombre}</a>}
                        description={item.descripcion}
                    />
                    Precio: {item.precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} Gs.
                    <br/>
                    Costo: {item.costo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} Gs.
                </List.Item>
            )}
        />
    )
    return <>
        <Divider>Opciones</Divider>
        <Button type="primary" onClick={handleAgregarNuevoProducto}>
            Agregar Nuevo Producto
        </Button>
        <Divider>Filtrado</Divider>
        <Formik
            initialValues={{tipoBusqueda, busqueda}}
            onSubmit={(val)=>{
                setParamsToURL(val)
            }}
        >
            {({handleSubmit,submitCount})=><Form>
                <Input.Group compact>
                    <Field
                        component={AntSelect}
                        name='tipoBusqueda'
                        selectOptionsKeyValue={[
                            {label: 'Por ID', value:'id'},
                            {label: 'Por Codigo', value:'codigo'},
                            {label: 'Por Nombre', value:'nombre'}
                        ]}
                        submitCount={submitCount}
                    />
                    <Field
                        component={AntInput}
                        name='busqueda'
                        type='text'
                        submitCount={submitCount}
                    />
                    <Button onClick={()=>handleSubmit()} htmlType='submit' type="primary" icon={<SearchOutlined/>}/>
                </Input.Group>
            </Form>}
        </Formik>
        <Divider plain>Productos</Divider>
        {errorProductos || listaProductos}
        {VistaModal}
    </>
}

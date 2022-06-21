import { LikeOutlined, MessageOutlined, EditOutlined } from '@ant-design/icons';
import {Avatar, Button, Col, Divider, List, Modal, Row, Space} from 'antd';
import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {IProducto, URL_GET_PRODUCTOS} from "../../modelos/Producto";
import axios from "axios";
import {PaginacionVacia, ResponseAPIPaginado} from "../../modelos/ResponseAPI";
import Search from "antd/es/input/Search";
import {
    createItemNumber,
    createItemNumberOrNull,
    createItemString,
    ParamsQuerys,
    useParametros
} from "../../hook/hookQuery";
import ModificarProducto from "./ModificarProducto";
import {AuthContext} from "../../context/AuthProvider";
import {errorRandomToIError} from "../../modelos/ErrorModel";
import VistaError from "../../components/UI/VistaError";


const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);

const useProductos = (busqueda: string, page: number, perPage: number, codigo: string, id: number|null) => {
    const [paginacion, setPaginacion] = useState<ResponseAPIPaginado<IProducto>>(PaginacionVacia);
    const [isProductosLoading, setIsProductoLoading] = useState<boolean>(true)
    const [errorProductos, setErrorProductos] = useState<JSX.Element|undefined>();
    const {setError} = useContext(AuthContext)
    useEffect(()=>{
        setIsProductoLoading(true)
        setPaginacion(PaginacionVacia)
        setErrorProductos(undefined)
        axios.get<ResponseAPIPaginado<IProducto>>(URL_GET_PRODUCTOS,{
            params:{
                nombre: busqueda,
                page,
                perPage,
                codigo,
                id,
            }
        })
            .then(({data}) => {
                setPaginacion(data)
            })
            .catch(e=> {
                setError(errorRandomToIError(e))
                setErrorProductos(<VistaError error={errorRandomToIError(e)}/>)
                setPaginacion(PaginacionVacia)
            })
            .finally(()=>setIsProductoLoading(false))
    },[busqueda, codigo, id, page, perPage, setError])
    return {
        paginacion,
        isProductosLoading,
        errorProductos
    }
}

interface ParametrosAdminProducto {
    page: number,
    perPage: number,
    busqueda: string,
    codigo: string,
    id: number|null
}


const itemPerPage = createItemNumber(10)
const itemPage = createItemNumber()
const itemBusqueda = createItemString()

export default function AdminProducto() {
    const itemList = useMemo<ParamsQuerys<ParametrosAdminProducto>>(()=>({
        busqueda: itemBusqueda,
        page: itemPage,
        perPage: itemPerPage,
        codigo: createItemString(),
        id: createItemNumberOrNull()
    }),[])
    const {
        paramsURL,
        setParamsToURL
    } = useParametros<ParametrosAdminProducto>(itemList)
    const {
        busqueda,
        perPage,
        page,
        codigo,
        id,
    } = paramsURL
    const {
        paginacion,
        isProductosLoading,
        errorProductos
    } = useProductos(busqueda, page, perPage, codigo, id)
    useEffect(()=>{
        if (!isProductosLoading && (page > paginacion.last_page)) {
            setParamsToURL({...paramsURL,page:paginacion.last_page})
        }
    },[isProductosLoading, page, paginacion.last_page, paramsURL, setParamsToURL])
    const [isModalVisible, setIsModalVisible] = useState(false)  //todo: activado para pruebas
    const [idModificando, setIdModificando] = useState<number|undefined>(1) //todo modificado para pruebas
    const handleAgregarNuevoProducto = useCallback(()=>{
        setIdModificando(undefined)
        setIsModalVisible(true)
    },[])
    const handleModificarProducto = useCallback((id: number)=>{
        setIdModificando(id)
        setIsModalVisible(true)
    },[])
    const handleOk = useCallback((...e:any)=>{
        console.log(e)
    },[])
    const VistaModal = <Modal footer={null} closable={false} visible={isModalVisible} onOk={handleOk} onCancel={()=>setIsModalVisible(false)}>
        <ModificarProducto productoId={idModificando}/>
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
                pageSize:perPage,
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
                        <Button type="link" onClick={()=>handleModificarProducto(item.id)}>
                            <IconText icon={EditOutlined} text="Modificar" key="modificar" />
                        </Button>,
                        <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
                        <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
                    ]}
                    extra={
                        <img
                            width={272}
                            alt="logo"
                            src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
                        />
                    }
                >
                    <List.Item.Meta
                        avatar={<Avatar src={item.url} />}
                        title={<a href={`${URL_GET_PRODUCTOS}/${item.id}`}>{item.nombre}</a>}
                        description={item.descripcion}
                    />
                    {item.precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} Gs.
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
        <Row justify="space-around">
            <Col span={10}>
                <Search placeholder="Nombre de producto a buscar..." onSearch={(e)=>setParamsToURL({...paramsURL, busqueda:e})} enterButton defaultValue={busqueda} />
            </Col>
            <Col span={6}>
                <Search placeholder="Codigo del producto" onSearch={(e)=>setParamsToURL({...paramsURL, codigo:e})} enterButton defaultValue={codigo} />
            </Col>
            <Col span={4}>
                <Search placeholder="ID del producto" onSearch={(e)=>setParamsToURL({...paramsURL, id:parseInt(e) || null})} enterButton defaultValue={id?''+id:''} />
            </Col>
        </Row>
        <Divider plain>Productos</Divider>
        {errorProductos || listaProductos}
        {VistaModal}
    </>
}

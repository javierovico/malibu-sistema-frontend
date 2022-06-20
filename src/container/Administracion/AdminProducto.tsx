import { LikeOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import {Avatar, Col, Divider, List, Result, Row, Select, Space} from 'antd';
import React, {useEffect, useMemo, useState} from "react";
import {IProducto, URL_GET_PRODUCTOS} from "../../modelos/Producto";
import axios from "axios";
import {PaginacionVacia, ResponseAPIPaginado} from "../../modelos/ResponseAPI";
import openNotification, {getTitleFromException} from "../../components/UI/Antd/Notification";
import Search from "antd/es/input/Search";
import {createItemArray, createItemNumber, createItemString, useParametros} from "../../hook/hookQuery";


const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);

const useProductos = (busqueda: string, page: number, perPage: number) => {
    const [paginacion, setPaginacion] = useState<ResponseAPIPaginado<IProducto>>(PaginacionVacia);
    const [isProductosLoading, setIsProductoLoading] = useState<boolean>(true)
    const [errorProductos, setErrorProductos] = useState<string|undefined>();
    useEffect(()=>{
        setIsProductoLoading(true)
        setPaginacion(PaginacionVacia)
        setErrorProductos(undefined)
        axios.get<ResponseAPIPaginado<IProducto>>(URL_GET_PRODUCTOS,{
            params:{
                nombre: busqueda,
                page,
                perPage
            }
        })
            .then(({data}) => {
                setPaginacion(data)
            })
            .catch(e=> {
                openNotification(e)
                setErrorProductos(getTitleFromException(e))
                setPaginacion(PaginacionVacia)
            })
            .finally(()=>setIsProductoLoading(false))
    },[busqueda, page, perPage])
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
    opciones: number[]
}


const itemPerPage = createItemNumber(10)
const itemPage = createItemNumber()
const itemBusqueda = createItemString()
const itemOpciones = createItemArray([], createItemNumber(0))

export default function AdminProducto() {
    const itemList = useMemo(()=>({
        busqueda: itemBusqueda,
        page: itemPage,
        perPage: itemPerPage,
        opciones: itemOpciones,
    }),[])
    const {
        paramsURL,
        setParamsToURL
    } = useParametros<ParametrosAdminProducto>(itemList)
    const {
        busqueda,
        perPage,
        page,
        opciones,
    } = paramsURL
    const {
        paginacion,
        isProductosLoading,
        errorProductos
    } = useProductos(busqueda, page, perPage)
    useEffect(()=>{
        console.log({opciones})
    },[opciones])
    useEffect(()=>{
        console.log({page})
    },[page])
    useEffect(()=>{
        if (!isProductosLoading && (page > paginacion.last_page)) {
            setParamsToURL({...paramsURL,page:paginacion.last_page})
        }
    },[isProductosLoading, page, paginacion.last_page, paramsURL, setParamsToURL])
    const onSearch = (e: string) => {
        setParamsToURL({...paramsURL, busqueda:e});
    }
    const children: React.ReactNode[] = [];
    for (let i = 10; i < 36; i++) {
        children.push(<Select.Option key={i} value={i}>{'Item ' + i}</Select.Option>);
    }
    const vistaNormal = <>
        <Divider>Filtrado</Divider>
        <Row justify="space-around">
            <Col span={10}>
                <Search placeholder="Nombre de producto a buscar..." onSearch={onSearch} enterButton defaultValue={busqueda} />
            </Col>
            <Col span={10}>
                <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Please select"
                    value={opciones}
                    onChange={(e)=>setParamsToURL({...paramsURL,opciones:e})}
                >
                    {children}
                </Select>
            </Col>
        </Row>
        <Divider plain>Productos</Divider>
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
                        <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
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
    </>
    const vistaError = <Result
        status="error"
        title={errorProductos || "Error realizando la operacion, revise el log"}
    />
    return errorProductos ? vistaError : vistaNormal
}

import { LikeOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import {Avatar, Col, Divider, List, Result, Row, Space} from 'antd';
import React, {Reducer, useContext, useEffect, useMemo, useReducer, useState} from "react";
import {IProducto, URL_GET_PRODUCTOS} from "../../modelos/Producto";
import axios from "axios";
import {PaginacionVacia, ResponseAPIPaginado} from "../../modelos/ResponseAPI";
import openNotification, {getTitleFromException} from "../../components/UI/Antd/Notification";
import {AuthContext} from "../../context/AuthProvider";
import {comprobarRol} from "../../modelos/Usuario";
import {ROL_ADMIN_PRODUCTOS} from "../../settings/constant";
import Search from "antd/es/input/Search";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";


const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);

const useProductos = () => {
    const [paginacion, setPaginacion] = useState<ResponseAPIPaginado<IProducto>>(PaginacionVacia);
    const [isProductosLoading, setIsProductoLoading] = useState<boolean>(true)
    const [errorProductos, setErrorProductos] = useState<string|undefined>();
    const {user} = useContext(AuthContext)

    useEffect(()=>{
        console.log("El usuario cambios",user)
    },[user])

    useEffect(()=>{
        setIsProductoLoading(true)
        setPaginacion(PaginacionVacia)
        setErrorProductos(undefined)
        if (user && comprobarRol(user, ROL_ADMIN_PRODUCTOS)) {
            axios.get<ResponseAPIPaginado<IProducto>>(URL_GET_PRODUCTOS,{
                params:{
                    'perPage': 2,
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
        } else {
            setIsProductoLoading(false)
            setErrorProductos(!user ? "Carga de usuario Pendiente" : "Rol " + ROL_ADMIN_PRODUCTOS + " ausente en usuario actual")
            setPaginacion(PaginacionVacia)
        }
    },[user])

    return {
        paginacion,
        isProductosLoading,
        errorProductos
    }
}

const reducerQuery: Reducer<ParametrosAdminProducto, IAccion> = (state, action): ParametrosAdminProducto => {
    switch (action.type) {
        case 'all':
            return action.payload
        case 'page':
        case 'perPage':
            return {...state,[action.type]:action.payload}
        default:
            throw new Error('anarako')
    }
}

interface ParametrosAdminProducto {
    page: number,
    perPage: number,
    busqueda: string
}

interface IAccion {
    type: string,
    payload: any
}

const useQueryParamsAdminProducto = (searchParams: URLSearchParams) => {
    const searchToParametros = (s: URLSearchParams) => ({
        page: parseInt(s.get('page') || '1') ,
        perPage: parseInt(s.get('perPage') || '10'),
        busqueda: s.get('busqueda') || '',
    })
    const [state, dispatch] = useReducer<Reducer<ParametrosAdminProducto,IAccion>>(reducerQuery, searchToParametros(searchParams));
    useEffect(() => {
        // dispatch({type: 'page', payload: parseInt(searchParams.get('page') || '1')})
        dispatch({type: 'all', payload: searchToParametros(searchParams)})
    }, [searchParams])
    return state
}

export default function AdminProducto() {
    const {
        paginacion,
        isProductosLoading,
        errorProductos
    } = useProductos()
    // const queryActual = useMemo(()=>Array.from(searchParams.entries()),[searchParams])
    // const busqueda = useMemo(()=>searchParams.get('busqueda') || '',[searchParams])
    // const page = useMemo(()=>parseInt(searchParams.get('page') || '1'),[searchParams])
    const [searchParams, setSearchParams] = useSearchParams();
    const params = useQueryParamsAdminProducto(searchParams)
    const {
        page,
        perPage,
        busqueda
    } = params
    useEffect(()=>{
        console.log({busqueda})
    },[busqueda])
    useEffect(()=>{
        console.log({page})
    },[page])
    useEffect(()=>{
        console.log({perPage})
    },[perPage])
    // useEffect(()=>{
    //     console.log({queryActual})
    // },[queryActual])
    const onSearch = (e: string) => {
        handleChangeGroup({busqueda:e});
    }
    const handleChangeGroup = (e: any) => {
        // console.log(typeof e)
        const paramse = {
            perPage: (e.perPage && e.perPage !== 1) ? e.perPage : perPage,
            page: (e.page && e.page !== 1) ? e.page : page,
            busqueda: (e.busqueda && e.busqueda !== '') ? e.busqueda : busqueda,
        }
        setSearchParams({...paramse})
        // searchParams.append('hola', 'si')
        // setSearchParams(searchParams)
    }
    const vistaNormal = <>
        <Divider>Filtrado</Divider>
        <Row justify="space-around">
            <Col span={20}>
                <Search placeholder="Nombre de producto a buscar..." onSearch={onSearch} enterButton defaultValue={busqueda} />
            </Col>
        </Row>
        <Divider plain>Productos</Divider>
        <List
            loading={isProductosLoading}
            itemLayout="vertical"
            size="large"
            pagination={{
                showQuickJumper:true,
                showSizeChanger:true,
                pageSize:perPage,
                current:page,
                onChange:(page,perPage)=>{
                    handleChangeGroup({page,perPage})
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

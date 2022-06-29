import React, {useContext, useEffect, useMemo, useState} from "react";
import {IMesa, URL_GET_MESAS} from "../../modelos/Carrito";
import {Button, Modal, Space, Table} from "antd";
import axios from "axios";
import ResponseAPI from "../../modelos/ResponseAPI";
import VistaError from "../../components/UI/VistaError";
import {errorRandomToIError} from "../../modelos/ErrorModel";
import {AuthContext} from "../../context/AuthProvider";
import {ColumnsType} from "antd/lib/table/interface";
import {IconText} from "../Administracion/AdminProducto";
import {CheckOutlined} from "@ant-design/icons";
import SelectDeCliente from "./SelectDeCliente";

function useMesas() {
    const {setErrorException} = useContext(AuthContext)
    const [mesas, setMesas] = useState<IMesa[]>([{id:30,nombre:'nombre'}])
    const [errorMesas, setErrorMesas] = useState<JSX.Element|undefined>();
    const [isMesasLoading, setIsMesasLoading] = useState<boolean>(true)
    useEffect(()=>{
        setIsMesasLoading(true)
        setErrorMesas(undefined)
        axios.get<ResponseAPI<{ mesas: IMesa[] }>>(URL_GET_MESAS + '?XDEBUG_SESSION_START=PHPSTORM',{params: {
                withCarrito: 1,
                withActivos: 1,
            }})
            .then(({data}) => {
                setMesas(data.data.mesas)
            })
            .catch(e=> {
                setErrorException(e)
                setErrorMesas(<VistaError error={errorRandomToIError(e)}/>)
            })
            .finally(()=>setIsMesasLoading(false))
    },[setErrorException])
    return {
        mesas,
        errorMesas,
        isMesasLoading
    }
}

export default function Trabajo() {
    const {
        mesas,
        errorMesas,
        isMesasLoading
    } = useMesas()
    const [mesaAsignacion, setMesaAsignacion] = useState<IMesa>()
    const isModalSelectClienteVisible = useMemo<boolean>(()=>!!mesaAsignacion,[mesaAsignacion])
    const columnas = useMemo(():ColumnsType<IMesa>=>[
        {
            title:'ID',
            key:'id',
            dataIndex: 'id',
        },{
            title:'Codigo',
            key:'codigo',
            dataIndex: 'code'
        },{
            title:'Descripcion',
            key:'descripcion',
            dataIndex: 'descripcion'
        },{
            title:'Activa',
            key:'activo',
            dataIndex: 'activo',
            render: (r) => r ? 'SI' : 'NO'
        },{
            title:'Acciones',
            key:'acciones',
            render: (_,m)=> <Space size="middle">
                <Button
                    type="link"
                    onClick={()=>{
                        setMesaAsignacion(m)
                    }}
                >
                    <IconText icon={CheckOutlined} text="Tomar"/>
                </Button>
            </Space>
        }
    ],[])
    return <>
        {errorMesas || <Table
            loading={isMesasLoading}
            title={() => 'Estado de Mesas'}
            rowKey={'id'}
            dataSource={mesas}
            columns={columnas}
        />}

        <Modal destroyOnClose={true} width={'85%'} footer={null} visible={isModalSelectClienteVisible} onCancel={()=>setMesaAsignacion(undefined)}>
            <SelectDeCliente
            />
        </Modal>
    </>
}

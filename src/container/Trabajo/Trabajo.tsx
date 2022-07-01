import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {IMesa, QueryBusquedaMesa, useMesas} from "../../modelos/Carrito";
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
import {ICliente} from "../../modelos/Cliente";


export default function Trabajo() {
    const queryItems = useMemo<Partial<QueryBusquedaMesa>>(()=>({
        activo: "1",
        withCarrito: "1"
    }),[])
    const {
        paginacion,
        errorMesas,
        isMesasLoading
    } = useMesas(1,1000,undefined, queryItems)
    const mesas = paginacion.data
    const [mesaAsignacion, setMesaAsignacion] = useState<IMesa>()
    const isModalSelectClienteVisible = useMemo<boolean>(()=>!!mesaAsignacion,[mesaAsignacion])
    const columnas = useMemo(():ColumnsType<IMesa>=>[
        {
            title:'ID',
            key:'id',
            dataIndex: 'id',
        },{
            title:'Codigo',
            key:'code',
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
    const handleSelectCliente = useCallback((c: ICliente)=>{
        console.log(c)
    },[])
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
                handleSelectCliente={handleSelectCliente}
                titulo={"Seleccione el cliente"}
            />
        </Modal>
    </>
}

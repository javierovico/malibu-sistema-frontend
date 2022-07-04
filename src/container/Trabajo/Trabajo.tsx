import React, {useCallback, useMemo, useState} from "react";
import {IMesa, QueryBusquedaMesa, useMesas} from "../../modelos/Carrito";
import {Button, Dropdown, Menu, Modal, Space, Table, Tooltip} from "antd";
import {ColumnsType} from "antd/lib/table/interface";
import {IconText} from "../Administracion/AdminProducto";
import {CheckOutlined, DownOutlined} from "@ant-design/icons";
import SelectDeCliente from "./SelectDeCliente";
import {ICliente} from "../../modelos/Cliente";
import {ItemType} from "antd/lib/menu/hooks/useItems";


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
    const menuAsignacion = useMemo(():ItemType[]=>[
        {
            title: 'Hola',
            key: '1'
        }
    ],[])
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
                <Dropdown overlay={<Menu items={menuAsignacion} />} trigger={['click']}>
                    <a onClick={e => e.preventDefault()}>
                        <Space>
                            Asignar
                            <DownOutlined />
                        </Space>
                    </a>
                </Dropdown>
                <Button
                    type="link"
                    onClick={()=>{
                        setMesaAsignacion(m)
                    }}
                >
                    <IconText icon={CheckOutlined} text="Asignar"/>
                </Button>
            </Space>
        }
    ],[menuAsignacion])
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ICliente>()
    const handleCancelModalCliente = useCallback(()=>{
        setClienteSeleccionado(undefined)
        setMesaAsignacion(undefined)
    },[])
    const handleAceptarModalCliente = useCallback(()=>{

    },[])
    const footerModalSelectCliente = useMemo(()=>[
        <Button key='back' onClick={handleCancelModalCliente}>Cancelar</Button>,
        <Tooltip key='confirm' title={!clienteSeleccionado?'Debe seleccionar un cliente primero':''}><Button type='primary' onClick={handleAceptarModalCliente} disabled={!clienteSeleccionado}>Aceptar</Button></Tooltip>,
    ],[clienteSeleccionado, handleAceptarModalCliente, handleCancelModalCliente])
    return <>
        {errorMesas || <Table
            loading={isMesasLoading}
            title={() => 'Estado de Mesas'}
            rowKey={'id'}
            dataSource={mesas}
            columns={columnas}
        />}
        <Modal
            destroyOnClose={true}
            width={'85%'}
            footer={footerModalSelectCliente}
            visible={isModalSelectClienteVisible}
            onCancel={handleCancelModalCliente}
        >
            <SelectDeCliente
                handleSelectCliente={setClienteSeleccionado}
                clienteSelected={clienteSeleccionado}
            />
        </Modal>
    </>
}

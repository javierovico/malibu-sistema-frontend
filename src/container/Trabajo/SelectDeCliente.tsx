import TablaGenerica, {
    ConfiguracionColumna,
    generadorColumna, ItemsSelected,
    ValorCambiado,
} from "./TablaGenerica";
import {ItemSorteado} from "../../modelos/Generico";
import {clienteVacio, ICliente, QueryBusquedaCliente, SortCliente, useCliente} from "../../modelos/Cliente";
import React, {useCallback, useMemo, useState} from "react";
import {Button, Col, Modal, Popconfirm, Row, Space, Tooltip} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import ModificarCliente from "../Administracion/ModificarCliente";
import {IconText} from "../Administracion/AdminProducto";

interface Parametros {
    handleSelectCliente: {(cliente: ICliente):void},
    clienteSelected?: ICliente,
    titulo?:string
}


/**
 * Debe ser capaz de seleccionar un cliente existente o crear uno nuevo y seleccionarlo
 * @constructor
 */
export default function SelectDeCliente ({handleSelectCliente,clienteSelected,titulo}: Parametros) {
    const [page,setPage] = useState<number>(1)
    const [perPage,setPerPage] = useState<number>(10)
    const [sortBy, setSortBy] = useState<ItemSorteado<SortCliente>[]>([]);
    const [busqueda,setBusqueda] = useState<Partial<QueryBusquedaCliente>>({})
    const {
        paginacion,
        clienteUpdate,
        clienteModificando,
        setClienteModificando,
        handleBorrarCliente,
        isClientesLoading
    } = useCliente(
        page,
        perPage,
        sortBy,
        busqueda
    )
    const onPaginationChange = useCallback((p: number, pp: number)=>{
        if (page !== p) {
            setPage(p)
        }
        if (perPage !== pp) {
            setPerPage(pp)
        }
    },[page, perPage])
    const onFiltroValuesChange = useCallback((v:ValorCambiado[])=>{
        const nuevaBusqueda = v
            .reduce<Partial<QueryBusquedaCliente>>((prev,curr)=>{
                const valorTraido = curr.value
                return {
                    ...prev,
                    [curr.code]: valorTraido
                }
            },busqueda)
        setBusqueda(nuevaBusqueda)
    },[busqueda])
    const onOrderByChange = useCallback((v: ItemSorteado<string>[])=>{
        setSortBy(v as ItemSorteado<SortCliente>[])
    },[])
    const configuracionColumnas = useMemo((): ConfiguracionColumna<ICliente>[]=> [
        generadorColumna<ICliente,QueryBusquedaCliente>('id',sortBy,true,true,undefined, busqueda),
        generadorColumna<ICliente,QueryBusquedaCliente>('nombre',sortBy,true,true,undefined, busqueda),
        generadorColumna<ICliente,QueryBusquedaCliente>('telefono',sortBy,true,true,undefined, busqueda),
        generadorColumna<ICliente,QueryBusquedaCliente>('ruc',sortBy,true,true,undefined, busqueda),
        generadorColumna<ICliente,QueryBusquedaCliente>('ciudad',sortBy,true,false,[
            {
                value: 'Hyattfort',
                text: 'Asuncion'
            },{
                value: 'Autumnborough',
                text: 'San Lorenzo'
            },{
                value: 'Pacochafort',
                text: 'Luque'
            }
        ], busqueda),
        generadorColumna<ICliente,QueryBusquedaCliente>('barrio',sortBy,true,true,undefined, busqueda)
    ],[busqueda, sortBy])
    const onItemsIdSelectedChange = useCallback((items: ItemsSelected<ICliente>[])=>{
        const selected = items.find(i=>i.selected)?.item
        selected && handleSelectCliente(selected)
    },[handleSelectCliente])
    // const [isModalAgregarClienteVisible, setIsModalAgregarClienteVisible] =useState(false)
    const handleAgregarCliente = useCallback(()=>{
        setClienteModificando(clienteVacio)
    },[setClienteModificando])
    const tituloCreado = <>
        <Row justify="space-between">
            <Col lg={12}>
                <h3>{titulo || 'Seleccione Cliente'}</h3>
            </Col>
            <Col offset={4} lg={8}>
                <Button onClick={()=>handleAgregarCliente()} style={{float:'right'}} type="primary" icon={<PlusOutlined />}>
                    Crear Nuevo Cliente
                </Button>
            </Col>
        </Row>
    </>
    const clienteChange = useCallback((c:ICliente)=>{
        return new Promise<void>((res,rej)=>{
            clienteUpdate(c)
                .then(()=>{
                    setClienteModificando(undefined)
                    res()
                })
                .catch(rej)
        })
    },[clienteUpdate, setClienteModificando])
    const acciones = useCallback((c: ICliente)=><Space size="middle">
        <Tooltip title="Borrar">
            <Popconfirm
                key="borrar"
                okText="Si"
                cancelText="No"
                title="Seguro que desea borrar?"
                onConfirm={()=>handleBorrarCliente(c)}
            >
                <Button type="link" >
                    <IconText icon={DeleteOutlined} text=""/>
                </Button>
            </Popconfirm>
        </Tooltip>
        <Tooltip title="Modiicar">
            <Button
                type="link"
                onClick={()=>{
                    setClienteModificando(c)
                }}
            >
                <IconText icon={EditOutlined} text=""/>
            </Button>
        </Tooltip>
    </Space>,[handleBorrarCliente, setClienteModificando])
    return <>
        <TablaGenerica
            loading={isClientesLoading}
            title={tituloCreado}
            itemsIdSelected={clienteSelected?.id?[clienteSelected.id]:[]}
            onItemsIdSelectedChange={onItemsIdSelectedChange}
            configuracionColumnas={configuracionColumnas}
            items={paginacion.data}
            totalItems={paginacion.total}
            perPage={perPage}
            page={page}
            onPaginationChange={onPaginationChange}
            // onOrderByChange={(r)=>setSortBy(r as ItemSorteado<SortCliente>[])}
            onOrderByChange={onOrderByChange}
            onFiltroValuesChange={onFiltroValuesChange}
            onBusquedaValuesChange={onFiltroValuesChange}
            typeSelcted={'radio'}
            acciones={acciones}
        />
        <Modal
            destroyOnClose={true}
            width={'85%'}
            footer={null}
            visible={!!clienteModificando}
            onCancel={()=>setClienteModificando(undefined)}
        >
            <ModificarCliente
                clienteChange={clienteChange}
                cliente={clienteModificando}
            />
        </Modal>
    </>
}

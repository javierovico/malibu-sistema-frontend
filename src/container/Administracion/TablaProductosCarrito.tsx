import TablaGenerica, {ConfiguracionColumnaSimple} from "../Trabajo/TablaGenerica";
import React, {useCallback, useMemo} from "react";
import {
    CARRITO_PRODUCTO_SUCESION_ESTADOS,
    IProducto, productoAvanzable, productoQuitable
} from "../../modelos/Producto";
import {ordenamientoSimple, useTablaOfflineAuxiliar} from "../../modelos/Generico";
import {Button, Col, InputNumber, Modal, Row, Space, Tooltip} from "antd";
import {CheckSquareOutlined, DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {IconText} from "./AdminProducto";
import {formateadorNumero} from "../../utils/utils";
import {costoCarritoProducto, precioCarritoProducto} from "../../modelos/Carrito";

interface ArgsProps {
    productos: IProducto[],
    anadirProductosHandle?: { (): void },
    quitarProductoHandle?: { (p: IProducto): void },
    avanzarProductoHandle?: { (p: IProducto): void },
    cambiarCantidadHandle?: { (p:IProducto, nuevaCantidad: number) : void}
}

export default function TablaProductosCarrito(arg: ArgsProps) {
    const {
        productos,
        anadirProductosHandle,
        quitarProductoHandle,
        avanzarProductoHandle,
        cambiarCantidadHandle,
    } = arg
    const configuracionColumnasSimple: ConfiguracionColumnaSimple<IProducto>[] = useMemo<ConfiguracionColumnaSimple<IProducto>[]>(() => [
        {
            key: 'id',
            sortable: true,
            searchable: true,
        },
        {
            key: 'codigo',
            sortable: true,
            searchable: true
        },
        {
            key: 'nombre',
            sortable: true,
            searchable: true
        },
        {
            key: 'estado',
            render: (_, item) => item.pivot?.estado,
            sortable: true,
            filtroDesdeValores: true
        },
        {
            key: 'tipo',
            render: (_, item) => item.tipo_producto?.descripcion,
            sortable: true,
            filtroDesdeValores: true,
        },
        {
            key: 'cantidad',
            render: (_, item) => (cambiarCantidadHandle && productoQuitable(item)) ? <InputNumber min={1} value={item.pivot?.cantidad ?? 1} onChange={(d) => cambiarCantidadHandle(item, Math.round(d))} /> : item.pivot?.cantidad ?? 1,
            sortable: true,
            sorter: (i1, i2) => ordenamientoSimple(i1.pivot?.cantidad ?? 1, i2.pivot?.cantidad ?? 1)
        },
        {
            key: 'precio',
            render: (_, item) => formateadorNumero(precioCarritoProducto(item)) + ' Gs.',
            sortable: true
        },
        {
            key: 'costo',
            render: (_, item) => formateadorNumero(costoCarritoProducto(item)) + ' Gs.',
            sortable: true
        },
        {
            key: 'acciones',
            render: (_, p) => <Space size="middle">
                {quitarProductoHandle && productoQuitable(p) &&
                    <Tooltip title="Quitar producto">
                        <Button
                            type="link"
                            onClick={() => {
                                Modal.confirm({
                                    title: '¿Quitar producto?',
                                    content: 'Los productos pueden sacarse siempre y cuando su estado sea "iniciado". Una que un producto este en "preparacion" ya no se puede cancelar',
                                    okText: 'Quitar',
                                    onOk: () => {
                                        quitarProductoHandle(p)
                                    }
                                })
                            }}
                        >
                            <IconText icon={DeleteOutlined} text=""/>
                        </Button>
                    </Tooltip>}
                {avanzarProductoHandle && productoAvanzable(p) &&
                    <Tooltip title="Avanzar estado">
                        <Button
                            type="link"
                            onClick={() => {
                                const estadoAvance: number = CARRITO_PRODUCTO_SUCESION_ESTADOS.findIndex(se => se === p.pivot?.estado) + 1
                                Modal.confirm({
                                    title: '¿Avanzar estado del producto?',
                                    content: `Se establecera el estado del producto a "${CARRITO_PRODUCTO_SUCESION_ESTADOS[estadoAvance]}"`,
                                    okText: 'Avanzar',
                                    onOk: () => avanzarProductoHandle(p)
                                })
                            }}
                        >
                            <IconText icon={CheckSquareOutlined} text=""/>
                        </Button>
                    </Tooltip>}
            </Space>
        }
    ], [avanzarProductoHandle, cambiarCantidadHandle, quitarProductoHandle])
    const {
        items: productosFiltrados,
        setSortBy,
        onFiltroValuesChange,
        configuracionColumnas
    } = useTablaOfflineAuxiliar(productos, configuracionColumnasSimple)
    const title = useMemo(() => <>
        <Row justify="space-between">
            <Col lg={12}>
                <h3>Productos en el carrito</h3>
            </Col>
            <Col offset={4} lg={8}>
                {anadirProductosHandle &&
                    <Button onClick={anadirProductosHandle} style={{float: 'right'}} type="primary"
                            icon={<PlusOutlined/>}>
                        Añadir Producto
                    </Button>}
            </Col>
        </Row>
    </>, [anadirProductosHandle])
    const getRowKey = useCallback((p:IProducto)=>p.pivot?.id ?? p.id!!,[])
    return <>
        <TablaGenerica
            rowKey={getRowKey}
            title={title}
            configuracionColumnas={configuracionColumnas}
            items={productosFiltrados}
            onOrderByChange={setSortBy}
            onBusquedaValuesChange={onFiltroValuesChange}
            onFiltroValuesChange={onFiltroValuesChange}
        />
    </>
}

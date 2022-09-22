import {ICarrito, precioCarritoProducto} from "../../modelos/Carrito";
import {Card, Col, Modal, Row, Tooltip, Typography} from "antd";
import {DeleteOutlined, EllipsisOutlined, FastForwardOutlined} from "@ant-design/icons";
import {useMemo} from "react";
import {CarritoProductoEstado, IProducto} from "../../modelos/Producto";
import {BaseType} from "antd/lib/typography/Base";
import {formateadorNumero} from "../../utils/utils";
import * as React from "react";

import iconoComida from '../../img/2819383.png'

const {Text} = Typography

interface Argumentos {
    carrito?: ICarrito,
    onCancel: { (): void },
    quitarProductoHandle: { (p: IProducto) : void},
    avanzarProductoHandle: { (p: IProducto) : void},
}

export default function ModalVisorProductosCaja({carrito, onCancel, quitarProductoHandle, avanzarProductoHandle}: Argumentos) {
    const contenido = useMemo(() => {
        if (!carrito) {
            return <p>Cargando...</p>
        } else {
            return <Row gutter={[10, 10]}>
                {carrito.productos?.map(p => {
                    let type: BaseType
                    switch (p.pivot?.estado) {
                        case CarritoProductoEstado.CARRITO_PRODUCTO_ESTADO_FINALIZADO:
                            type = 'success'
                            break
                        case CarritoProductoEstado.CARRITO_PRODUCTO_ESTADO_PENDIENTE:
                            type = 'danger'
                            break
                        case CarritoProductoEstado.CARRITO_PRODUCTO_ESTADO_PREPARACION:
                            type = 'warning'
                            break
                        default:
                            type = 'secondary'
                    }
                    const acciones: React.ReactNode[] =  [
                        <Tooltip title='Quitar Producto' key='quitarProducto'><DeleteOutlined onClick={()=>quitarProductoHandle(p)}/></Tooltip>,
                        <Tooltip title='Avanzar estado' key='next'><FastForwardOutlined onClick={()=>avanzarProductoHandle(p)}/></Tooltip>,
                        <EllipsisOutlined key="ellipsis"/>,
                    ]
                    return <Col className='col-card' key={p.pivot?.id??p.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Card
                            className='flexible-card'
                            actions={acciones}
                            cover={
                                <img
                                    alt={p.nombre}
                                    src={p.imagen?.url ?? iconoComida}
                                />
                            }
                        >
                            <Card.Meta
                                title={p.nombre}
                                description={<>
                                    <p><Text type={type}>Estado: {p.pivot?.estado}</Text></p>
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
    }, [avanzarProductoHandle, carrito, quitarProductoHandle])
    return <>
        <Modal  //Modal para mostrar los productos actuales
            title="Productos del carrito"
            destroyOnClose={true}
            width={'100%'}
            footer={null}
            visible={!!carrito}
            onCancel={onCancel}
        >
            {contenido}
        </Modal>

    </>
}

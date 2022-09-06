import {calcularPrecioCarrito, getEstadoStrFromPedido, ICarrito} from "../../modelos/Carrito";
import {Card, Col, Modal, Row, Statistic, Tooltip} from "antd";
import {EditOutlined, EllipsisOutlined, SettingOutlined, UnorderedListOutlined} from "@ant-design/icons";
import {formateadorNumero} from "../../utils/utils";
import {useMemo} from "react";

interface Argumentos {
    carrito?: ICarrito,
    onCancel: { (): void }
}

export default function ModalVisorProductosCaja({carrito, onCancel}: Argumentos) {
    const contenido = useMemo(() => {
        if (!carrito) {
            return <p>Cargando...</p>
        } else {
            return <Row gutter={[10, 10]}>
                {carrito.productos?.map(p => (<Col className='col-card' key={p.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Card
                        className='flexible-card'
                        actions={[
                            // <Tooltip title={'Ver Productos'} key={'agregar'}><UnorderedListOutlined onClick={()=>setModalProductosShowing(p.id)}/></Tooltip>,
                            <SettingOutlined key="setting"/>,
                            <EditOutlined key="edit"/>,
                            <EllipsisOutlined key="ellipsis"/>,
                        ]}
                        cover={
                            <img
                                alt={p.nombre}
                                src={p.imagen?.url ?? 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'}
                            />
                        }
                    >
                        <Card.Meta
                            title={p.nombre}
                            description={p.descripcion}
                        />
                    </Card>
                </Col>))}
            </Row>
        }
    }, [carrito])
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

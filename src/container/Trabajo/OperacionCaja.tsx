import {Card, Col, Row, Statistic} from "antd";
import {calcularPrecioCarrito, getEstadoStrFromPedido, useCarrito} from "../../modelos/Carrito";
import {useMemo} from "react";
import {formateadorNumero} from "../../utils/utils";
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import './OperacionCaja.css'

export default function OperacionCaja() {
    const {
        mesas,
        errorMesas,
        isMesasLoading,
        reservarMesa,
        isPedidosLoading,
        pedidoUpdate,
        pedidos: pedidosOriginales,
        deliveris
    } = useCarrito()
    const pedidos = useMemo(()=>pedidosOriginales,[pedidosOriginales])      //Filtro de pedidos
    return <>
        <Row gutter={[10,10]}>
            {pedidos.map(p=>(<Col className='col-card' key={p.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                    className='flexible-card'
                    actions={[
                        <SettingOutlined key="setting" />,
                        <EditOutlined key="edit" />,
                        <EllipsisOutlined key="ellipsis" />,
                    ]}
                >
                    {/*<Card.Meta title={p.status} description={<>*/}
                    {/*    <Statistic title="Cliente" value={p.cliente?.nombre??'Anonimo'} />*/}
                    {/*    <Statistic title="Mesa" value={p.mesa?.code??'Sin mesa'} />*/}
                    {/*    <Statistic title="Monto" value={formateadorNumero(calcularPrecioCarrito(p)) + ' Gs.'} />*/}
                    {/*</>}/>*/}
                    <Statistic title="Cliente" value={p.cliente?.nombre??'Anonimo'} />
                    <Statistic title="Mesa" value={p.mesa?.code??'Sin mesa'} />
                    <Statistic title="Monto" value={formateadorNumero(calcularPrecioCarrito(p)) + ' Gs.'} />
                    <Statistic title="Estado" value={getEstadoStrFromPedido(p)} />
                </Card>
            </Col>))}
        </Row>
    </>
}

import {Button, Col, Divider, Form, Input, Modal, Row} from "antd";
import * as React from "react";
import {useState} from "react";
import {ICarrito} from "../../modelos/Carrito";
import {Field, Formik} from "formik";
import {AntInput, AntSelect} from "../../components/UI/Antd/AntdInputWithFormik";
import {SearchOutlined} from "@ant-design/icons";
import {EnumTipoProducto, PRODUCTO_TIPOS_ADMITIDOS, TipoBusquedaProductos} from "../../modelos/Producto";

interface Argumentos {
    carrito?: ICarrito,
    onCancel: { (): void },
}


export default function ModalAddProductoToCarrito(arg: Argumentos) {
    const {
        carrito,
        onCancel
    } = arg
    const [tipoBusqueda, setTipoBusqueda] = useState<TipoBusquedaProductos>("nombre")
    const [nombre, setNombre] = useState<string>("")
    const [codigo, setCodigo] = useState<string>("")
    const [tipoProducto, setTipoProducto] = useState<EnumTipoProducto>(EnumTipoProducto.TIPO_SIMPLE)
    return <>
        <Modal  //Modal para mostrar los productos actuales
            title="Agregar producto al carrito"
            destroyOnClose={true}
            width={'100%'}
            footer={null}
            visible={!!carrito}
            onCancel={onCancel}
        >
            <Divider>Filtrado</Divider>
            <Formik
                initialValues={{tipoBusqueda, nombre, tipoProducto, codigo}}
                onSubmit={(val)=>{
                    setTipoBusqueda(val.tipoBusqueda)
                    setNombre(val.nombre)
                    setTipoProducto(val.tipoProducto)
                    setCodigo(val.codigo)
                }}
            >
                {({handleSubmit,submitCount})=><Form>
                    <Row justify="space-around">
                        <Col span={8}>
                            <Field
                                component={AntInput}
                                name='codigo'
                                type='text'
                                label='Codigo'
                                submitCount={submitCount}
                                hasFeedback
                            />
                        </Col>
                        <Col span={8}>
                            <Field
                                component={AntInput}
                                name='nombre'
                                type='text'
                                label='Nombre'
                                submitCount={submitCount}
                                hasFeedback
                            />
                        </Col>
                        <Col span={8}>
                            <Field
                                component={AntSelect}
                                name='tipoProducto'
                                label='Tipo De Producto'
                                selectOptionsKeyValue={PRODUCTO_TIPOS_ADMITIDOS.map(tp => ({
                                    label: tp.descripcion,
                                    value: tp.code
                                }))}
                                submitCount={submitCount}
                            />
                        </Col>
                    </Row>
                    <Input.Group compact>
                        <Field
                            component={AntSelect}
                            name='tipoBusqueda'
                            selectOptionsKeyValue={[
                                {label: 'Por ID', value:'id'},
                                {label: 'Por Codigo', value:'codigo'},
                                {label: 'Por Nombre', value:'nombre'}
                            ]}
                            submitCount={submitCount}
                        />
                        <Field
                            component={AntInput}
                            name='nombre'
                            type='text'
                            submitCount={submitCount}
                        />
                        <Button onClick={()=>handleSubmit()} htmlType='submit' type="primary" icon={<SearchOutlined/>}/>
                    </Input.Group>
                </Form>}
            </Formik>
        </Modal>
    </>
}

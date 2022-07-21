import {ICarrito, IMesa} from "../../modelos/Carrito";
import React, {useCallback, useContext, useMemo} from "react";
import {Alert, Button, Card, Col, Divider, Modal, Row, Spin, Statistic} from "antd";
import SelectDeProductos, {ProductoSelected} from "../Administracion/SelectDeProductos";
import {formateadorNumero, mostrarMensaje} from "../../utils/utils";
import {AuthContext} from "../../context/AuthProvider";
import {Form, FormikBag, FormikProps, withFormik} from "formik";
import {convertIError, errorToFormik, objectIsIError} from "../../modelos/ErrorModel";
import {FormTitle} from "../Administracion/ModificarProducto.style";
import SelectDeCliente from "./SelectDeCliente";
import SelectDeMesa from "./SelectDeMesa";
import {AntdSelectV2, AntdSelectV2Option, SwitchV2} from "../../components/UI/Antd/AntdInputWithFormikTypescript";
import {
    CARRITO_PRODUCTO_SUCESION_ESTADOS,
    IProducto,
    PivotCarritoProducto, productoQuitable
} from "../../modelos/Producto";
import TablaProductosCarrito from "../Administracion/TablaProductosCarrito";

interface VariablesExtraFormulario {
    modalSelectProducto: boolean,
    modalSelectCliente: boolean,
    modalSelectMesa: boolean,
}

type FormValue = ICarrito & VariablesExtraFormulario

interface Argumentos {
    carrito: ICarrito,
    carritoChange: { (c: ICarrito): void | boolean | Error | Promise<void> },
    abrirSelectProducto?: boolean,
    mesas?: IMesa[]
}

export default function VisorDeCarrito(arg: Argumentos) {
    const {
        carrito,
        carritoChange,
        abrirSelectProducto,
        mesas,
    } = arg
    const {
        setErrorException
    } = useContext(AuthContext)
    const InnerForm = useCallback(({
                                       setValues,
                                       isSubmitting,
                                       values,
                                       errors,
                                       dirty,
                                       submitCount,
                                       touched,
                                       setFieldTouched
                                   }: FormikProps<FormValue>) => {
        const handleCerrar = () => setValues({
            ...values,
            modalSelectProducto: false,
            modalSelectCliente: false,
            modalSelectMesa: false
        })
        const precio: number = values.productos?.reduce<number>((prev, curr) => prev + (curr?.pivot?.precio ?? curr.precio), 0) ?? 0
        const costo: number = values.productos?.reduce<number>((prev, curr) => prev + (curr?.pivot?.costo ?? curr.costo), 0) ?? 0
        const anadirProductosHandle = () => setValues(v => ({...v, modalSelectProducto: true}))
        const quitarProductoHandle = (p: IProducto) => setValues(v => ({
            ...v,
            productos: v.productos?.filter(pF => pF.id !== p.id)
        }))
        const avanzarProductoHandle = (p: IProducto) => setValues(v => ({
            ...v, productos: v.productos?.map(pM => {
                if (pM.id === p.id) {
                    const indexAvance: number = CARRITO_PRODUCTO_SUCESION_ESTADOS.findIndex(se => se === pM.pivot?.estado) + 1
                    const nuevoPivot: PivotCarritoProducto = {
                        ...(pM.pivot ? pM.pivot : {
                            producto_id: pM.id ?? 0,
                            carrito_id: v.id,
                            costo: pM.costo,
                            precio: pM.precio,
                            created_at: '',
                            updated_at: '',
                        }), estado: CARRITO_PRODUCTO_SUCESION_ESTADOS[indexAvance]
                    }
                    return {...pM, pivot: nuevoPivot}
                } else {
                    return pM
                }
            })
        }))
        return <Spin spinning={isSubmitting}>
            <Form className='form-container'>
                <>
                    <Row justify='space-evenly'>
                        <Col lg={10}>
                            <Card title="Datos del cliente" extra={<a href="/#" onClick={(e) => {
                                e.preventDefault();
                                setValues({...values, modalSelectCliente: true})
                            }}>Cambiar</a>}>
                                <p>Nombre: {values.cliente?.nombre ?? 'ANONIMO'}</p>
                                <p>Telefono: {values.cliente?.telefono}</p>
                                <p>Ruc: {values.cliente?.ruc}</p>
                                <p>Ciudad: {values.cliente?.ciudad}</p>
                                <p>Barrio: {values.cliente?.barrio}</p>
                            </Card>
                        </Col>
                        <Col lg={10}>
                            <SwitchV2
                                value={values.is_delivery}
                                label='Es delivery'
                                onChange={(d: boolean) => setValues({...values, is_delivery: d})}
                                touched={touched.is_delivery}
                                submitCount={submitCount}
                                error={errors.is_delivery}
                                onBlur={() => setFieldTouched('is_delivery')}
                            />
                            <AntdSelectV2
                                disabled={values.is_delivery}
                                selectOptions={[{
                                    key: 0,
                                    value: '[Sin Mesa]'
                                }].concat(mesas?.map<AntdSelectV2Option<number>>(m => ({
                                    key: m.id,
                                    value: m.code
                                })) ?? [])}
                                value={values.mesa_id ?? 0}
                                placeholder='Seleccione mesa'
                                label='Mesa'
                                onChange={(mesa_id: number) => setValues({
                                    ...values,
                                    mesa_id: mesa_id || null,
                                    mesa: mesas?.find(m => m.id === mesa_id)
                                })}
                                touched={touched.mesa_id}
                                submitCount={submitCount}
                                error={errors.mesa_id}
                                onBlur={() => setFieldTouched('mesa_id')}
                            />
                            <SwitchV2
                                value={values.pagado}
                                label='Pagado'
                                onChange={(d: boolean) => {
                                    if (d) {
                                        Modal.confirm({
                                            title: '¿Marcar como pagado?',
                                            content: 'Una vez que esté marcado como pagado y se guarde el carrito ya no se podrá modificar a nivel de productos',
                                            okText: 'Pagado',
                                            onOk: () => {
                                                setValues({...values, pagado: d})
                                            }
                                        })
                                    } else {
                                        setValues({...values, pagado: d})
                                    }
                                }}
                                touched={touched.pagado}
                                submitCount={submitCount}
                                error={errors.pagado}
                                onBlur={() => setFieldTouched('pagado')}
                            />
                        </Col>
                    </Row>
                    <TablaProductosCarrito
                        anadirProductosHandle={anadirProductosHandle}
                        quitarProductoHandle={quitarProductoHandle}
                        avanzarProductoHandle={avanzarProductoHandle}
                        productos={values.productos || []}
                    />
                    {errors.productos && <Alert message={errors.productos} type="error" showIcon/>}
                    {/*<TablaProductos*/}
                    {/*    estadoPreparacion={true}*/}
                    {/*    title={<>*/}
                    {/*        <Row justify="space-between">*/}
                    {/*            <Col lg={12}>*/}
                    {/*                <h3>Productos en el carrito</h3>*/}
                    {/*            </Col>*/}
                    {/*            <Col offset={4} lg={8}>*/}
                    {/*                <Button onClick={() => setValues({...values, modalSelectProducto: true})}*/}
                    {/*                        style={{float: 'right'}} type="primary" icon={<PlusOutlined/>}>*/}
                    {/*                    Añadir Producto*/}
                    {/*                </Button>*/}
                    {/*            </Col>*/}
                    {/*        </Row>*/}
                    {/*    </>}*/}
                    {/*    productos={values.productos || []}*/}
                    {/*    acciones={(p) => <Space size="middle">*/}
                    {/*        {(!(p.pivot?.estado) || !CARRITO_PRODUCTO_ESTADOS_CANCELABLES.includes(p.pivot?.estado)) &&*/}
                    {/*            <Button*/}
                    {/*                type="link"*/}
                    {/*                onClick={() => {*/}
                    {/*                    if (values.productos?.length) {*/}
                    {/*                        const indexSacar = values.productos.findIndex(prod => prod.id === p.id)*/}
                    {/*                        const nuevoCarrito = {...values, productos: [...values.productos]}*/}
                    {/*                        nuevoCarrito.productos?.splice(indexSacar, 1)*/}
                    {/*                        setValues(nuevoCarrito)*/}
                    {/*                    }*/}
                    {/*                }}*/}
                    {/*            >*/}
                    {/*                <IconText icon={DeleteOutlined} text="Quitar"/>*/}
                    {/*            </Button>}*/}
                    {/*    </Space>}*/}
                    {/*/>*/}
                    {/*{errors.productos && <Alert message={errors.productos} type="error" showIcon/>}*/}
                </>
                <Divider>Total</Divider>
                <Row justify='space-evenly'>
                    <Col lg={10}>
                        <Statistic title="Precio" value={formateadorNumero(precio) + ' Gs.'}/>
                    </Col>
                    <Col lg={10}>
                        <Statistic title="Costo" value={formateadorNumero(costo) + ' Gs.'}/>
                    </Col>
                </Row>
                <Row justify="end">
                    <Col span={4}>
                        <div className='submit-container'>
                            <Button htmlType='submit' type='primary' loading={isSubmitting} disabled={!dirty}>
                                Guardar
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>
            <Modal destroyOnClose={true} width={'85%'}
                   footer={[<Button key='1' type="primary" onClick={handleCerrar}>Aceptar</Button>]}
                   visible={values.modalSelectProducto} onCancel={handleCerrar}>
                <SelectDeProductos
                    titulo='Seleccione nuevos productos a añadir'
                    productosExistentes={values.productos?.filter(p => p.id).map(p => p.id as number) || []}
                    productosIdNoSeleccionables={values.productos?.filter(p => !productoQuitable(p)).map(p => p.id as number) || []}
                    onProductosSelectChange={(prods) => {
                        const productosCombo = values.productos ? [...values.productos] : []
                        prods.forEach((prod: ProductoSelected) => {
                            const indexSacar = productosCombo.findIndex(pc => pc.id === prod.producto.id)  // por si sea un producto repetido (-1: nuevo, 0<=:sacar)
                            if (indexSacar >= 0) {  //ya existia
                                if (prod.selected) {
                                    mostrarMensaje("El producto " + prod.producto.nombre + " ya estaba en la lista", 'error')
                                } else {
                                    productosCombo.splice(indexSacar, 1)
                                }
                            } else {
                                if (!prod.selected) {
                                    mostrarMensaje("El producto " + prod.producto.nombre + " No se encontro en la lista para sacar", 'error')
                                } else {
                                    productosCombo.splice(0, 0, prod.producto)
                                }
                            }
                        })
                        setValues({...values, productos: productosCombo})
                    }}
                />
            </Modal>
            <Modal
                destroyOnClose={true}
                width={'85%'}
                footer={[
                    <Button key='aceptar' type='primary' onClick={handleCerrar}
                            disabled={!values.cliente}>Aceptar</Button>,
                ]}
                visible={values.modalSelectCliente}
                onCancel={handleCerrar}
            >
                <SelectDeCliente
                    handleSelectCliente={(c) => {
                        setValues({...values, cliente: c, cliente_id: c.id ?? 0})
                    }}
                    clienteSelected={values.cliente}
                    titulo={'Seleccione cliente para asignar a pedido'}
                />
            </Modal>
            <Modal
                destroyOnClose={true}
                width={'85%'}
                footer={[
                    <Button key='aceptar' type='primary' onClick={handleCerrar}
                            disabled={!values.cliente}>Aceptar</Button>,
                ]}
                visible={values.modalSelectMesa}
                onCancel={handleCerrar}
            >
                <SelectDeMesa
                    handleSelectMesa={(m) => {
                        setValues({...values, mesa: m, mesa_id: m.id ?? 0})
                    }}
                    mesaSelected={values.mesa}
                    titulo={'Seleccione mesa para asignar a pedido'}
                />
            </Modal>
        </Spin>
    }, [mesas])
    const MyForm = useMemo(() => withFormik<{}, FormValue>({
        // Ignoramos las propiedades y asignamos el producto que tenemos nomas
        mapPropsToValues: () => ({
            ...carrito,
            modalSelectProducto: !!abrirSelectProducto,
            modalSelectCliente: false,
            modalSelectMesa: false,
        }),
        handleSubmit: (values, {setSubmitting, setErrors}: FormikBag<{}, FormValue>) => {
            const result = carritoChange(values)
            if (typeof result == 'boolean') {
                if (result) {
                    mostrarMensaje(`Se guardaron los cambios`)
                } else {
                    mostrarMensaje(`Error Guadando`, 'error')
                }
                setSubmitting(false)
            } else if (result instanceof Promise) {
                result.then(() => mostrarMensaje(`Se guardaron los cambios`))
                    .catch((e) => {
                        mostrarMensaje(`Error Guadando`, 'error')
                        if (objectIsIError(e)) {
                            e = convertIError(e, {
                                'mesaId': 'mesa_id',
                                cambiosEstados: 'productos'
                            })
                        }
                        console.error(e)
                        const errorFormik = errorToFormik(e)
                        if (errorFormik) {
                            setErrors(errorFormik)
                        } else {
                            setErrorException(e)
                        }
                    }).finally(() => {
                    setSubmitting(false)
                })
            } else if (result instanceof Error) {
                setErrorException(result)
                setSubmitting(false)
            } else {
                mostrarMensaje(`Se guardaron los cambios`)
                setSubmitting(false)
            }
        },
    })(InnerForm), [InnerForm, abrirSelectProducto, carrito, carritoChange, setErrorException])
    const titulo = useMemo(() => 'Carrito' + (carrito.cliente?.nombre ? (' de ' + carrito.cliente.nombre) : (carrito.mesa?.code ? (' de la mesa ' + carrito.mesa.code) : '')), [carrito.cliente?.nombre, carrito.mesa?.code])
    return <>
        <FormTitle>{titulo}</FormTitle>
        <MyForm/>
    </>
}

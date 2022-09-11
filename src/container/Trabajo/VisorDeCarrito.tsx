import {
    addDeliveryToProductos, calcularCostoCarrito, calcularPrecioCarrito,
    getDeliveryFromCarrito,
    ICarrito,
    IMesa, isCarritoFinalizable,
    productoCarritoCompare,
    productoCarritoPivotFromProducto
} from "../../modelos/Carrito";
import React, {useCallback, useContext, useMemo} from "react";
import {Alert, Button, Col, Divider, Modal, Row, Spin, Statistic} from "antd";
import SelectDeProductos from "../Administracion/SelectDeProductos";
import {formateadorNumero, mostrarMensaje} from "../../utils/utils";
import {AuthContext} from "../../context/AuthProvider";
import {Form, FormikBag, FormikProps, withFormik} from "formik";
import {convertIError, errorToFormik, objectIsIError} from "../../modelos/ErrorModel";
import {FormTitle} from "../Administracion/ModificarProducto.style";
import SelectDeCliente from "./SelectDeCliente";
import SelectDeMesa from "./SelectDeMesa";
import {
    AntdSelectV2,
    AntdSelectV2Option,
    DatosClienteCard,
    SwitchV2
} from "../../components/UI/Antd/AntdInputWithFormikTypescript";
import {
    avanzarProducto,
    IProducto,
    productoQuitable, TIPOS_PRODUCTOS_SELECCIONABLES
} from "../../modelos/Producto";
import TablaProductosCarrito from "../Administracion/TablaProductosCarrito";

interface VariablesExtraFormulario {
    modalSelectProducto: boolean,
    modalSelectCliente: boolean,
    modalSelectMesa: boolean,
    deliverySeleccionado: boolean,      //solo para indicar que se toco
}

type FormValue = ICarrito & VariablesExtraFormulario

interface Argumentos {
    carrito: ICarrito,
    carritoChange: { (c: ICarrito): void | boolean | Error | Promise<void> },
    abrirSelectProducto?: boolean,
    mesas?: IMesa[],
    deliveris?: IProducto[],
}

export default function VisorDeCarrito(arg: Argumentos) {
    const {
        carrito,
        carritoChange,
        abrirSelectProducto,
        mesas,
        deliveris,
    } = arg
    const {
        setErrorException
    } = useContext(AuthContext)
    const InnerForm = useCallback(({
                                       setValues,
                                       isSubmitting,
                                       values,
                                       initialValues,
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
        const precio: number = calcularPrecioCarrito(values)
        const costo: number = calcularCostoCarrito(values)
        const anadirProductosHandle = initialValues.pagado ? undefined : (() => setValues(v => ({
            ...v,
            modalSelectProducto: true
        })))
        const quitarProductoHandle = initialValues.pagado ? undefined :((p: IProducto) => setValues(v => ({
            ...v,
            productos: v.productos?.filter(pF => !productoCarritoCompare(pF,p))
        })))
        const avanzarProductoHandle = (p: IProducto) => setValues(v => ({
            ...v, productos: v.productos?.map(productoOriginal => productoCarritoCompare(productoOriginal,p) ? avanzarProducto(p, v) : productoOriginal)
        }))
        const handleChangeCliente = initialValues.pagado ? undefined : (()=>setValues({...values, modalSelectCliente: true}))
        const cambiarCantidadHandle = (!initialValues.pagado) ? ((productoModificar: IProducto, nuevaCantidad: number) => setValues(v => ({
            ...v,
            productos: v.productos?.map(p => productoCarritoCompare(p,productoModificar)? {...p, pivot: {...p.pivot!!, cantidad: nuevaCantidad}} : p)
        }))) : undefined
        return <Spin spinning={isSubmitting}>
            <Form className='form-container'>
                <>
                    <Row justify='space-evenly'>
                        <Col lg={10}>
                            <DatosClienteCard
                                cliente={values.cliente}
                                handleChangeCliente={handleChangeCliente}
                            />
                        </Col>
                        <Col lg={10}>
                            <SwitchV2
                                disabled={initialValues.pagado}
                                checked={values.is_delivery}
                                label='Delivery'
                                onChange={(d: boolean) =>  setValues(values => ({...values, is_delivery: d}))}
                                touched={touched.is_delivery}
                                submitCount={submitCount}
                                error={errors.is_delivery}
                                onBlur={() => setFieldTouched('is_delivery')}
                            />
                            {values.is_delivery && <AntdSelectV2
                                disabled={initialValues.pagado}
                                selectOptions={[{
                                    key: 0,
                                    value: '[Sin costo]'
                                }].concat(deliveris?.map<AntdSelectV2Option<number>>(m => ({
                                    key: m.id!!,
                                    value: `${m.nombre} (${formateadorNumero(m.precio) + ' Gs.'})`
                                })) ?? [])}
                                value={getDeliveryFromCarrito(values)?.id ?? 0}
                                placeholder='Seleccione Delivery'
                                label='Precio Delivery'
                                onChange={(producto_id: number) => setValues({
                                    ...values,
                                    productos: addDeliveryToProductos(values, deliveris?.find(m => m.id === producto_id)),     // con el splice no detecta cambio
                                })}
                                touched={touched.deliverySeleccionado}
                                submitCount={submitCount}
                                error={errors.deliverySeleccionado}
                                onBlur={() => setFieldTouched('deliverySeleccionado')}
                            />}
                            <AntdSelectV2
                                disabled={values.is_delivery || initialValues.finalizado}
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
                                disabled={initialValues.pagado || !(values.productos?.length ?? 0)}
                                checked={values.pagado}
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
                            <SwitchV2
                                disabled={!isCarritoFinalizable(values) || initialValues.finalizado}
                                checked={values.finalizado}
                                label='Finalizado'
                                onChange={(d: boolean) => {
                                    if (d) {
                                        Modal.confirm({
                                            title: '¿Marcar como finalizado?',
                                            content: 'Una vez que esté marcado como finalizado y se guarde, el carrito desaparecerá',
                                            okText: 'Finalizar',
                                            onOk: () => {
                                                setValues({...values, finalizado: d})
                                            }
                                        })
                                    } else {
                                        setValues({...values, finalizado: d})
                                    }
                                }}
                                touched={touched.finalizado}
                                submitCount={submitCount}
                                error={errors.finalizado}
                                onBlur={() => setFieldTouched('finalizado')}
                            />
                        </Col>
                    </Row>
                    <TablaProductosCarrito
                        anadirProductosHandle={anadirProductosHandle}
                        quitarProductoHandle={quitarProductoHandle}
                        avanzarProductoHandle={avanzarProductoHandle}
                        productos={values.productos || []}
                        cambiarCantidadHandle={cambiarCantidadHandle}
                    />
                    {errors.productos && <Alert message={errors.productos} type="error" showIcon/>}
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
                    tiposProductosAdmitidos={TIPOS_PRODUCTOS_SELECCIONABLES}
                    titulo='Seleccione nuevos productos a añadir'
                    productosExistentes={values.productos?.filter(p => p.id && productoQuitable(p)).map(p => p.id as number) || []}
                    // productosIdNoSeleccionables={values.productos?.filter(p => !productoQuitable(p)).map(p => p.id as number) || []}
                    onProductosSelectChange={(prods) => {
                        const productosCombo = values.productos ? [...values.productos] : []
                        prods.forEach((prod) => {
                            const indexSacar = productosCombo.findIndex(pc => productoCarritoCompare(pc, prod.item) || (!prod.selected && prod.item.id === pc.id && productoQuitable(pc)))  // por si sea un producto repetido (-1: nuevo, 0<=:sacar)
                            if (indexSacar >= 0) {  //ya existia
                                if (prod.selected) {
                                    mostrarMensaje("El producto " + prod.item.nombre + " ya estaba en la lista", 'error')
                                } else {
                                    productosCombo.splice(indexSacar, 1)
                                }
                            } else {
                                if (!prod.selected) {
                                    mostrarMensaje("El producto " + prod.item.nombre + " No se encontro en la lista para sacar", 'error')
                                } else {
                                    productosCombo.splice(0, 0, {
                                        ...prod.item,
                                        pivot: productoCarritoPivotFromProducto(prod.item,carrito)
                                    })
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
    }, [carrito, deliveris, mesas])
    const MyForm = useMemo(() => withFormik<{}, FormValue>({
        // Ignoramos las propiedades y asignamos el producto que tenemos nomas
        mapPropsToValues: () => ({
            ...carrito,
            modalSelectProducto: !!abrirSelectProducto,
            modalSelectCliente: false,
            modalSelectMesa: false,
            deliverySeleccionado: true,
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
                                mesaId: 'mesa_id',
                                cambiosEstados: 'productos',
                                productosIdQuita: 'productos',
                                productosIdAgrega: 'productos',
                                producto_delivery_id: 'delivery',
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

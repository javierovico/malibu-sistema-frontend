import {ICarrito} from "../../modelos/Carrito";
import React, {useCallback, useContext, useMemo} from "react";
import {Alert, Button, Col, Modal, Row, Space, Spin} from "antd";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import SelectDeProductos, {ProductoSelected} from "../Administracion/SelectDeProductos";
import {mostrarMensaje} from "../../utils/utils";
import {AuthContext} from "../../context/AuthProvider";
import {Form, FormikBag, FormikProps, withFormik} from "formik";
import TablaGenerica from "../Administracion/TablaGenerica";
import {IconText} from "../Administracion/AdminProducto";
import {errorToFormik} from "../../modelos/ErrorModel";
import {FormTitle} from "../Administracion/ModificarProducto.style";

interface VariablesExtraFormulario {
    modalSelectProducto: boolean
}

type FormValue = ICarrito & VariablesExtraFormulario

interface Argumentos {
    carrito:ICarrito,
    carritoChange: {(c:ICarrito):void|boolean|Error|Promise<void>},
    abrirSelectProducto?: boolean
}

export default function VisorDeCarrito(arg: Argumentos) {
    const {
        carrito,
        carritoChange,
        abrirSelectProducto,
    } = arg
    const {
        setErrorException
    } = useContext(AuthContext)
    const InnerForm = useCallback(({ setValues, isSubmitting, values, errors, dirty}: FormikProps<FormValue>) => {
        const handleCerrar = () => setValues({...values,modalSelectProducto:false})
        return <Spin spinning={isSubmitting}>
            <Form className='form-container'>
                <>
                    <TablaGenerica
                        title={<>
                            <Row justify="space-between">
                                <Col lg={12}>
                                    <h3>Productos en el carrito</h3>
                                </Col>
                                <Col offset={4} lg={8}>
                                    <Button onClick={()=>setValues({...values,modalSelectProducto:true})} style={{float:'right'}} type="primary" icon={<PlusOutlined />}>
                                        Añadir Producto
                                    </Button>
                                </Col>
                            </Row>
                        </>}
                        productos={values.productos || []}
                        acciones={(p)=><Space size="middle">
                            <Button
                                type="link"
                                onClick={()=>{
                                    if (values.productos?.length) {
                                        const indexSacar = values.productos.findIndex(prod => prod.id === p.id)
                                        const nuevoCarrito = {...values, productos:[...values.productos]}
                                        nuevoCarrito.productos?.splice(indexSacar,1)
                                        setValues(nuevoCarrito)
                                    }
                                }}
                            >
                                <IconText icon={DeleteOutlined} text="Quitar"/>
                            </Button>
                        </Space>}
                    />
                    {errors.productos && <Alert message={errors.productos} type="error" showIcon />}
                </>
                <Row justify="end">
                    <Col span={4}>
                        <div className='submit-container'>
                            <Button htmlType='submit' type='primary'  loading={isSubmitting} disabled={!dirty}>
                                Guardar
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>
            <Modal destroyOnClose={true} width={'85%'} footer={[<Button key='1' type="primary" onClick={handleCerrar}>Aceptar</Button>]} visible={values.modalSelectProducto} onCancel={handleCerrar}>
                <SelectDeProductos
                    titulo='Seleccione nuevos productos a añadir'
                    productosExistentes={values.productos?.filter(p=>p.id).map(p=>p.id as number) || []}
                    onProductosSelectChange={(prods)=>{
                        const productosCombo = values.productos ? [...values.productos] : []
                        prods.forEach((prod: ProductoSelected) => {
                            const indexSacar = productosCombo.findIndex(pc => pc.id === prod.producto.id)  // por si sea un producto repetido (-1: nuevo, 0<=:sacar)
                            if (indexSacar >= 0) {  //ya existia
                                if (prod.selected) {
                                    mostrarMensaje("El producto " + prod.producto.nombre + " ya estaba en la lista",'error')
                                } else {
                                    productosCombo.splice(indexSacar,1)
                                }
                            } else {
                                if (!prod.selected) {
                                    mostrarMensaje("El producto " + prod.producto.nombre + " No se encontro en la lista para sacar",'error')
                                } else {
                                    productosCombo.splice(0, 0, prod.producto)
                                }
                            }
                        })
                        setValues({...values, productos:productosCombo})
                    }}
                />
            </Modal>
        </Spin>
    },[])
    const MyForm = useMemo(()=>withFormik<{}, FormValue>({
        // Ignoramos las propiedades y asignamos el producto que tenemos nomas
        mapPropsToValues: () =>  ({
            ...carrito,
            modalSelectProducto: !!abrirSelectProducto
        }),
        handleSubmit: (values, {setSubmitting, setErrors}: FormikBag<{ }, FormValue>) => {
            const result = carritoChange(values)
            if (typeof result == 'boolean') {
                if (result) {
                    mostrarMensaje(`Se guardaron los cambios`)
                } else {
                    mostrarMensaje(`Error Guadando`, 'error')
                }
                setSubmitting(false)
            } else if (result instanceof Promise) {
                result.then(()=>mostrarMensaje(`Se guardaron los cambios`))
                    .catch((e)=> {
                        mostrarMensaje(`Error Guadando`, 'error')
                        const errorFormik = errorToFormik(e)
                        if (errorFormik) {
                            setErrors(errorFormik)
                        } else {
                            setErrorException(e)
                        }
                    }).finally(()=> {
                    setSubmitting(false)
                })
            } else if(result instanceof Error) {
                setErrorException(result)
                setSubmitting(false)
            } else {
                mostrarMensaje(`Se guardaron los cambios`)
                setSubmitting(false)
            }
        },
    })(InnerForm),[InnerForm, abrirSelectProducto, carrito, carritoChange, setErrorException])
    const titulo = useMemo(()=>'Carrito' + (carrito.cliente?.nombre?(' de ' + carrito.cliente.nombre):(carrito.mesa?.code?(' de la mesa ' + carrito.mesa.code):'')) ,[carrito.cliente?.nombre, carrito.mesa?.code])
    return <>
        <FormTitle>{titulo}</FormTitle>
        <MyForm/>
    </>
}

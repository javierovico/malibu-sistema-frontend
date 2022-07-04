import React, {useCallback, useContext, useMemo} from "react";
import {
    IProducto,
    PRODUCTO_TIPO_COMBO,
    productoVacio,
    PRODUCTO_TIPOS_ADMITIDOS
} from "../../modelos/Producto";
import {Alert, Button, Col, Modal, Row, Space, Spin} from "antd";
import {Field, Form, FormikBag, FormikProps, withFormik} from "formik";
import {FormTitle} from './ModificarProducto.style';
import {AntInput, AntSelect, AntTextArea} from "../../components/UI/Antd/AntdInputWithFormik";
import {AntFileSelect} from "../../components/UI/Antd/AntdInputWithFormikTypescript";
import {AuthContext} from "../../context/AuthProvider";
import {mostrarMensaje} from "../../utils/utils";
import {errorToFormik} from "../../modelos/ErrorModel";
import * as Yup from 'yup';
import TablaProductos from "./TablaProductos";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {IconText} from "./AdminProducto";
import SelectDeProductos, {ProductoSelected} from "./SelectDeProductos";

interface ArgumentosModificarProducto {
    producto?: IProducto,       //si esta definido es el producto a editar (se usa para notificar al padre)
    productoChange: {(p: IProducto) : void|boolean|Error|Promise<void>}
}

// function useProducto(productoId: number|undefined) {
//     const {
//         setErrorException
//     } = useContext(AuthContext)
//     const [producto, setProducto] = useState<IProducto>(productoVacio)
//     const [isProductoLoading, setIsProductoLoading] = useState<boolean>(true)
//     const [errorProducto, setErrorProducto] = useState<IError|undefined>(undefined);
//     const vistaError = useMemo(()=>errorProducto?<VistaError error={errorProducto}/>:undefined,[errorProducto])
//     useEffect(()=>{
//         setIsProductoLoading(true)
//         setProducto(productoVacio)
//         setErrorProducto(undefined)
//         axios.get<ResponseAPI<{producto:IProducto}>>(`${URL_GET_PRODUCTOS}/${productoId}`,{
//             params:{
//
//             }
//         })
//             .then(({data}) => {
//                 setProducto(data.data.producto)
//             })
//             .catch(e=> {
//                 setErrorProducto(errorRandomToIError(e))
//             })
//             .finally(()=>setIsProductoLoading(false))
//
//     },[productoId])
//     const guardarProducto = useCallback((productoSubiendo: IProducto)=>{
//         return new Promise<void>((resolve,reject)=> {
//             axios.put<ResponseAPI<{producto:IProducto}>>(`${URL_GET_PRODUCTOS}/${productoId}?XDEBUG_SESSION_START=PHPSTORM`, {...productoSubiendo, url: (productoSubiendo.imagen?.url?.includes("base64"))?productoSubiendo.imagen?.url:null})
//                 .then(({data}) => {
//                     resolve()
//                     setProducto(data.data.producto)
//                 })
//                 .catch((e)=>{
//                     reject(e)
//                     setErrorException(e)
//                 })
//         })
//     },[productoId, setErrorException])
//     return {
//         producto,
//         isProductoLoading,
//         vistaError,
//         guardarProducto
//     }
// }

interface PropFormulario {
    productoEditando?: IProducto,
}

interface VariablesExtraFormulario {
    modalSelectProducto: boolean
}

type FormValue = IProducto & VariablesExtraFormulario

export default function ModificarProducto ({producto, productoChange}: ArgumentosModificarProducto) {
    const {
        setErrorException
    } = useContext(AuthContext)
    const InnerForm = useCallback(({ setValues, isSubmitting, submitCount, values, errors}: FormikProps<FormValue>) => <Spin spinning={isSubmitting}>
        <Form className='form-container'>
            <Row gutter={30}>
                <Col lg={12}>
                    <Field
                        component={AntInput}
                        name='nombre'
                        type='text'
                        label='Nombre'
                        submitCount={submitCount}
                        hasFeedback
                    />
                </Col>
                <Col lg={12}>
                    <Field
                        component={AntInput}
                        name='codigo'
                        type='text'
                        label='Codigo'
                        submitCount={submitCount}
                        hasFeedback
                    />
                </Col>
            </Row>
            <Row gutter={30}>
                <Col lg={8}>
                    <Field
                        component={AntSelect}
                        name='tipo_producto.code'
                        label='Tipo De Producto'
                        selectOptionsKeyValue={PRODUCTO_TIPOS_ADMITIDOS.map(tp => ({
                            label: tp.descripcion,
                            value: tp.code
                        }))}
                        submitCount={submitCount}
                    />
                </Col>
                <Col lg={5}>
                    <Field
                        component={AntInput}
                        name='precio'
                        type='number'
                        label='Precio'
                        submitCount={submitCount}
                        hasFeedback
                    />
                </Col>
                <Col lg={5}>
                    <Field
                        component={AntInput}
                        name='costo'
                        type='number'
                        label='Costo'
                        submitCount={submitCount}
                        hasFeedback
                    />
                </Col>
            </Row>
            <Row gutter={30}>
                <Col lg={16}>
                    <Field
                        component={AntTextArea}
                        name='descripcion'
                        type='text'
                        label='Descripcion'
                        submitCount={submitCount}
                        hasFeedback
                        rows={4}
                    />
                </Col>
                <Col lg={8}>
                    <Field
                        name='imagen.url'
                        component={AntFileSelect}
                        label='Imagen'
                        submitCount={submitCount}
                        hasFeedback
                    />
                </Col>
            </Row>
            {values.tipo_producto?.code === PRODUCTO_TIPO_COMBO && (<>
                <TablaProductos
                    title={<>
                        <Row justify="space-between">
                            <Col lg={12}>
                                <h3>Productos en el combo</h3>
                            </Col>
                            <Col offset={4} lg={8}>
                                <Button onClick={()=>setValues({...values,modalSelectProducto:true})} style={{float:'right'}} type="primary" icon={<PlusOutlined />}>
                                    Añadir Producto
                                </Button>
                            </Col>
                        </Row>
                    </>}
                    productos={values.producto_combos || []}
                    acciones={(p)=><Space size="middle">
                        <Button
                            type="link"
                            onClick={()=>{
                                if (values.producto_combos?.length) {
                                    const indexSacar = values.producto_combos.findIndex(prod => prod.id === p.id)
                                    const nuevoProducto = {...values, producto_combos:[...values.producto_combos]}
                                    nuevoProducto.producto_combos?.splice(indexSacar,1)
                                    setValues(nuevoProducto)
                                }
                            }}
                        >
                            <IconText icon={DeleteOutlined} text="Quitar"/>
                        </Button>
                    </Space>}
                />
                {errors.producto_combos && <Alert message={errors.producto_combos} type="error" showIcon />}
            </>)}
            <Row justify="end">
                <Col span={4}>
                    <div className='submit-container'>
                        <Button htmlType='submit' type='primary'  loading={isSubmitting}>
                            Guardar
                        </Button>
                    </div>
                </Col>
            </Row>
        </Form>
        <Modal destroyOnClose={true} width={'85%'} footer={null} visible={values.modalSelectProducto} onCancel={()=>setValues({...values,modalSelectProducto:false})}>
            <SelectDeProductos
                tiposProductosAdmitidos={["simple"]}
                titulo='Seleccione nuevos productos a añadir'
                productosExistentes={values.producto_combos?.filter(p=>p.id).map(p=>p.id as number) || []}
                onProductosSelectChange={(prods)=>{
                    const productosCombo = values.producto_combos ? [...values.producto_combos] : []
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
                    setValues({...values, producto_combos:productosCombo})
                }}
            />
        </Modal>
    </Spin>,[])
    const MyForm = useMemo(()=>withFormik<PropFormulario, FormValue>({
        // Ignoramos las propiedades y asignamos el producto que tenemos nomas
        mapPropsToValues: () =>  ({
            ...(producto || productoVacio),
            modalSelectProducto: false
        }),
        validationSchema: Yup.object().shape({
            nombre: Yup.string()
                .min(2, 'Muy corto')
                .max(200, 'Muy largo')
                .required('Requerido'),
            codigo: Yup.string()
                .max(100, 'Muy largo')
                .required('Requerido'),
            precio: Yup.number()
                .min(1,'Muy chico')
                .integer('Solo numeros enteros')
                .required('Requerido'),
            costo: Yup.number()
                .min(1,'Muy chico')
                .integer('Solo numeros enteros')
                .required('Requerido'),
            // 'tipo_producto.code': Yup.string()
            //     .required("Falta especificar")
        }),
        // Add a custom validation function (this can be async too!)
        validate: (values: IProducto) => {
            let errors: Record<string, any> = {};
            if (!values.tipo_producto?.code) {
                errors['tipo_producto.code'] = 'Falta especificar'
            }
            return errors;
        },
        handleSubmit: (values, {setSubmitting, setErrors}: FormikBag<PropFormulario, FormValue>) => {
            const result = productoChange(values)
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
    })(InnerForm),[InnerForm, producto, productoChange, setErrorException])
    // useEffect(()=>console.log('InnerForm Cambio'),[InnerForm])
    // useEffect(()=>console.log('producto Cambio'),[producto])
    // useEffect(()=>console.log('productoChange Cambio'),[productoChange])
    return <>
        <FormTitle>Informacion Basica</FormTitle>
        <MyForm productoEditando={producto}/>
        {/*{listaProducto}*/}
    </>
}

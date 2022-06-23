import React, {useCallback, useContext, useEffect, useMemo} from "react";
import {IProducto, productoVacio} from "../../modelos/Producto";
import {Button, Col, Row, Spin} from "antd";
import {Form, Field, FormikProps, withFormik, FormikErrors, FormikBag} from "formik";
import { FormTitle } from './ModificarProducto.style';
import {AntInput, AntTextArea} from "../../components/UI/Antd/AntdInputWithFormik";
import {AntFileSelect} from "../../components/UI/Antd/AntdInputWithFormikTypescript";
import {AuthContext} from "../../context/AuthProvider";
import {mostrarMensaje} from "../../utils/utils";
import {errorToFormik} from "../../modelos/ErrorModel";

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

export default function ModificarProducto ({producto, productoChange}: ArgumentosModificarProducto) {
    useEffect(()=>console.log(producto),[producto])
    const {
        setErrorException
    } = useContext(AuthContext)
    const InnerForm = useCallback((props: FormikProps<IProducto>) => {
        const { isSubmitting, submitCount } = props;
        return (
            <Spin spinning={isSubmitting}>
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
                                component={AntInput}
                                name='precio'
                                type='number'
                                label='Precio'
                                submitCount={submitCount}
                                hasFeedback
                            />
                        </Col>
                        <Col lg={8}>
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
                    <div className='submit-container'>
                        <Button htmlType='submit' type='primary'  loading={isSubmitting}>
                            Guardar
                        </Button>
                    </div>
                </Form>
            </Spin>
        );
    },[])
    const MyForm = withFormik<PropFormulario, IProducto>({
        // Transform outer props into form values
        mapPropsToValues: ({productoEditando} : PropFormulario) => {
            console.log("reprocesando valores")
            return productoEditando || productoVacio
        },

        // Add a custom validation function (this can be async too!)
        validate: (values: IProducto) => {
            let errors: FormikErrors<IProducto> = {};
            if (!values.nombre) {
                errors.nombre = 'Required';
            } else if (values.nombre === 'no') {
                errors.nombre = 'Invalid email address';
            }
            return errors;
        },

        handleSubmit: (values, {setSubmitting, setErrors}: FormikBag<PropFormulario, IProducto>) => {
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
    })(InnerForm)
    useEffect(()=>console.log('myformik cambio'),[MyForm])
    return <>
        <FormTitle>Informacion Basica</FormTitle>
        <MyForm productoEditando={producto}/>
    </>
}

import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {IProducto, productoVacio, URL_GET_PRODUCTOS} from "../../modelos/Producto";
import VistaError from "../../components/UI/VistaError";
import {errorRandomToIError, IError} from "../../modelos/ErrorModel";
import axios from "axios";
import ResponseAPI from "../../modelos/ResponseAPI";
import {Button, Col, message, Row, Spin} from "antd";
import {Form, Field, FormikProps, withFormik, FormikErrors, FormikBag} from "formik";
import { FormTitle } from './ModificarProducto.style';
import {AntInput, AntTextArea} from "../../components/UI/Antd/AntdInputWithFormik";
import {AntFileSelect} from "../../components/UI/Antd/AntdInputWithFormikTypescript";
import {AuthContext} from "../../context/AuthProvider";
import {mostrarMensaje} from "../../utils/utils";

interface ArgumentosModificarProducto {
    productoId?: number,        //si esta definido, es el producto a editar
}

function useProducto(productoId: number|undefined) {
    const {
        setErrorException
    } = useContext(AuthContext)
    const [producto, setProducto] = useState<IProducto>(productoVacio)
    const [isProductoLoading, setIsProductoLoading] = useState<boolean>(true)
    const [errorProducto, setErrorProducto] = useState<IError|undefined>(undefined);
    const vistaError = useMemo(()=>errorProducto?<VistaError error={errorProducto}/>:undefined,[errorProducto])
    useEffect(()=>{
        setIsProductoLoading(true)
        setProducto(productoVacio)
        setErrorProducto(undefined)
        axios.get<ResponseAPI<{producto:IProducto}>>(`${URL_GET_PRODUCTOS}/${productoId}`,{
            params:{

            }
        })
            .then(({data}) => {
                setProducto(data.data.producto)
            })
            .catch(e=> {
                setErrorProducto(errorRandomToIError(e))
            })
            .finally(()=>setIsProductoLoading(false))

    },[productoId])
    const guardarProducto = useCallback((productoSubiendo: IProducto)=>{
        return new Promise<void>((resolve,reject)=> {
            axios.put<ResponseAPI<{producto:IProducto}>>(`${URL_GET_PRODUCTOS}/${productoId}?XDEBUG_SESSION_START=PHPSTORM`, {...productoSubiendo, url: (productoSubiendo.imagen?.url?.includes("base64"))?productoSubiendo.imagen?.url:null})
                .then(({data}) => {
                    resolve()
                    setProducto(data.data.producto)
                })
                .catch((e)=>{
                    reject(e)
                    setErrorException(e)
                })
        })
    },[productoId, setErrorException])
    return {
        producto,
        isProductoLoading,
        vistaError,
        guardarProducto
    }
}

interface PropFormulario {
    productoEditando?: IProducto,
    nuevoProducto?: boolean
}

export default function ModificarProducto (arg: ArgumentosModificarProducto) {
    const {
        productoId
    } = arg
    const {
        producto,
        isProductoLoading,
        vistaError,
        guardarProducto
    } = useProducto(productoId)
    useEffect(()=>console.log(producto),[producto])
    const InnerForm = useCallback((props: FormikProps<IProducto>) => {
        const { isSubmitting, submitCount } = props;
        return (
            <Spin spinning={isSubmitting||isProductoLoading}>
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
    },[isProductoLoading])
    const MyForm = useMemo(()=>(withFormik<PropFormulario, IProducto>({
        // Transform outer props into form values
        mapPropsToValues: ({productoEditando, nuevoProducto}) => {
            return (nuevoProducto || !productoEditando) ? productoVacio : productoEditando;
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

        handleSubmit: (values, {setSubmitting}: FormikBag<PropFormulario, IProducto>) => {
            guardarProducto(values)
                .then(()=> mostrarMensaje(`Se guardaron los cambios`))
                .catch((e)=>console.log(e))
                .finally(()=> {
                    setSubmitting(false)
                })
        },
    })(InnerForm)),[InnerForm, guardarProducto])
    useEffect(()=>console.log('myformik cambio'),[MyForm])
    const vistaNormal = useMemo(()=>(<>
        <FormTitle>Informacion Basica</FormTitle>
        <MyForm productoEditando={producto} nuevoProducto={!productoId} />
    </>),[MyForm, producto, productoId])
    return vistaError ? vistaError : vistaNormal
}

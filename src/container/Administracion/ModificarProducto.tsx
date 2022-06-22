import React, {useEffect, useMemo, useState} from "react";
import {IProducto, productoVacio, URL_GET_PRODUCTOS} from "../../modelos/Producto";
import VistaError from "../../components/UI/VistaError";
import {errorRandomToIError, IError} from "../../modelos/ErrorModel";
import axios from "axios";
import ResponseAPI from "../../modelos/ResponseAPI";
import {Button, Col, Row, Spin} from "antd";
import {Form, Field, FormikProps, withFormik, FormikErrors} from "formik";
import { FormTitle } from './ModificarProducto.style';
import {AntInput, AntTextArea} from "../../components/UI/Antd/AntdInputWithFormik";
import {AntFileSelect} from "../../components/UI/Antd/AntdInputWithFormikTypescript";

interface ArgumentosModificarProducto {
    productoId?: number,        //si esta definido, es el producto a editar
}

function useProducto(productoId: number|undefined) {
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
    return {
        producto,
        isProductoLoading,
        vistaError
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
        vistaError
    } = useProducto(productoId)
    const InnerForm = (props: FormikProps<IProducto>) => {
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
                                name='url'
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
    };
    const MyForm = withFormik<PropFormulario, IProducto>({
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

        handleSubmit: (values, formikBag) => {

            console.log({values})
            setTimeout(()=>formikBag.setSubmitting(false),500)
        },
    })(InnerForm);
    const vistaNormal = <>
        <FormTitle>Informacion Basica</FormTitle>
        <MyForm productoEditando={producto} nuevoProducto={!productoId} />
    </>
    return vistaError ? vistaError : vistaNormal
}

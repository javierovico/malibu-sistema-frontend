import React, {useCallback, useContext, useMemo} from "react";
import {Button, Col, Row, Spin} from "antd";
import {Field, Form, FormikBag, FormikProps, withFormik} from "formik";
import {FormTitle} from './ModificarProducto.style';
import {AntInput} from "../../components/UI/Antd/AntdInputWithFormik";
import {AntFileSelect} from "../../components/UI/Antd/AntdInputWithFormikTypescript";
import {AuthContext} from "../../context/AuthProvider";
import {mostrarMensaje} from "../../utils/utils";
import {errorToFormik} from "../../modelos/ErrorModel";
import * as Yup from 'yup';
import {clienteVacio, ICliente} from "../../modelos/Cliente";

interface ArgumentosModificarCliente {
    cliente?: ICliente,       //si esta definido es el cliente a editar (se usa para notificar al padre)
    clienteChange: {(p: ICliente) : void|boolean|Error|Promise<void>}
}

interface PropFormulario {
    clienteEditando?: ICliente,
}

interface VariablesExtraFormulario {
    modalSelectCliente: boolean
}

type FormValue = ICliente & VariablesExtraFormulario

export default function ModificarCliente ({cliente, clienteChange}: ArgumentosModificarCliente) {
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
                <Col lg={6}>
                    <Field
                        component={AntInput}
                        name='ruc'
                        type='text'
                        label='Ruc'
                        submitCount={submitCount}
                        hasFeedback
                    />
                </Col>
                <Col lg={6}>
                    <Field
                        component={AntInput}
                        name='telefono'
                        type='text'
                        label='Telefono'
                        submitCount={submitCount}
                        hasFeedback
                    />
                </Col>
            </Row>
            <Row gutter={30}>
                <Col lg={12}>
                    <Field
                        component={AntInput}
                        name='barrio'
                        type='text'
                        label='Barrio'
                        submitCount={submitCount}
                        hasFeedback
                    />
                </Col>
                <Col lg={12}>
                    <Field
                        component={AntInput}
                        name='ciudad'
                        type='text'
                        label='Ciudad'
                        submitCount={submitCount}
                        hasFeedback
                    />
                </Col>
            </Row>
            <Row gutter={30}>
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
    </Spin>,[])
    const MyForm = useMemo(()=>withFormik<PropFormulario, FormValue>({
        // Ignoramos las propiedades y asignamos el cliente que tenemos nomas
        mapPropsToValues: () =>  ({
            ...(cliente || clienteVacio),
            modalSelectCliente: false
        }),
        validationSchema: Yup.object().shape({
            nombre: Yup.string()
                .min(2, 'Muy corto')
                .max(200, 'Muy largo')
                .required('Requerido'),
        }),
        handleSubmit: (values, {setSubmitting, setErrors}: FormikBag<PropFormulario, FormValue>) => {
            const result = clienteChange(values)
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
    })(InnerForm),[InnerForm, cliente, clienteChange, setErrorException])
    // useEffect(()=>console.log('InnerForm Cambio'),[InnerForm])
    // useEffect(()=>console.log('cliente Cambio'),[cliente])
    // useEffect(()=>console.log('clienteChange Cambio'),[clienteChange])
    return <>
        <FormTitle>Informacion Basica</FormTitle>
        <MyForm clienteEditando={cliente}/>
        {/*{listaCliente}*/}
    </>
}

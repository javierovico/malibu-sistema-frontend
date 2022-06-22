import React, {useEffect, useMemo, useState} from "react";
import {IProducto, productoVacio, URL_GET_PRODUCTOS} from "../../modelos/Producto";
import VistaError from "../../components/UI/VistaError";
import {errorRandomToIError, IError} from "../../modelos/ErrorModel";
import axios from "axios";
import ResponseAPI from "../../modelos/ResponseAPI";
import {Button, Divider, Input, Space} from "antd";
import {Formik, Form, Field, FormikValues, FormikProps, withFormik, FormikErrors, FieldProps} from "formik";
import TextArea from "antd/lib/input/TextArea";
import { Image } from 'antd';

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

// Shape of form values
interface FormValues {
    email: string;
    password: string;
}

interface PropFormulario {
    productoEditando?: IProducto,
    nuevoProducto?: boolean
}

interface OtherProps {
    message: string;
}

// The type of props MyForm receives
interface MyFormProps {
    initialEmail?: string;
    message: string; // if this passed all the way through you might do this or make a union type
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
    useEffect(()=>{
        console.log({producto})
    },[producto])
    const InnerForm = (props: FormikProps<IProducto>) => {
        const { touched, errors, isSubmitting, handleSubmit } = props;
        return (
            <Form>
                <Space direction="vertical" size="small" style={{ display: 'flex' }}>
                    <Field name="nombre" as={Input} addonBefore="Nombre" />
                    <Field name="codigo" as={Input} addonBefore="Codigo Unico" />
                    <Input.Group compact>
                        <Field name="precio" as={Input} addonBefore="Precio" addonAfter={"Gs."} style={{ width: '50%' }} type={"number"}/>
                        <Field name="costo" as={Input} addonBefore="Costo" addonAfter={"Gs."} style={{ width: '50%' }} type={"number"}/>
                    </Input.Group>
                    <Divider>Descripcion</Divider>
                    <Field name="descripcion" as={TextArea} rows={4}/>
                    <Divider>Imagen</Divider>
                    <Space direction="vertical" size="small" style={{ display: 'flex' }} align={'center'}>
                        <Image
                            width={200}
                            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                        />
                    </Space>
                    {touched.nombre && errors.nombre && <div>{errors.nombre}</div>}
                    <Divider/>
                    <Button onClick={()=>handleSubmit()} loading={isSubmitting}>Guardar</Button>
                </Space>
            </Form>
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

        handleSubmit: values => {
            console.log({values})
        },
    })(InnerForm);

    const MyForm2 = (props: FormikProps<IProducto>) => {
        const {
            values,
            touched,
            errors,
            handleChange,
            handleBlur,
            handleSubmit,
        } = props;
        return (
            <form onSubmit={(e)=> {
                e.preventDefault()
                console.log('submit')
                handleSubmit()
            }}>
                <input
                    type="text"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.nombre}
                    name="nombre"
                />
                {errors.nombre && touched.nombre && <div id="feedback">{errors.nombre}</div>}
                <button type="submit">Submit</button>
            </form>
        );
    }

    const MyEnhancedForm = withFormik<{ producto: IProducto },IProducto>({
        mapPropsToValues: (e) => (e.producto),

        // Custom sync validation
        validate: (values: IProducto): FormikErrors<IProducto> => {
            const errors = {
                nombre:'',
                nombref: ''
            };

            if (!values.nombre) {
                errors.nombref = 'Required';
            }

            return errors;
        },

        handleSubmit: (values, { setSubmitting }) => {
            console.log('submition')
            setTimeout(() => {
                alert(JSON.stringify(values, null, 2));
                setSubmitting(false);
            }, 1000);
        },

        displayName: 'BasicForm',
    })(MyForm);

    const formikForm = useMemo(()=>(<Formik
        initialValues={producto}
        onSubmit={(e) => { console.log(e)}}
    >
        {(formikProp)=>{
            console.log(formikProp.values.nombre)
            return <></>
        }}
    </Formik>),[producto])
    const vistaNormal = <>
        <Divider>Modificacion de producto</Divider>
        <MyForm productoEditando={producto} nuevoProducto={!productoId} />
    </>
    return vistaError ? vistaError : vistaNormal
}

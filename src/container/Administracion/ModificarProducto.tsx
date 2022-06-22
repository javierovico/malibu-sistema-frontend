import React, {useEffect, useMemo, useState} from "react";
import {IProducto, productoVacio, URL_GET_PRODUCTOS} from "../../modelos/Producto";
import VistaError from "../../components/UI/VistaError";
import {errorRandomToIError, IError} from "../../modelos/ErrorModel";
import axios from "axios";
import ResponseAPI from "../../modelos/ResponseAPI";
import {Divider} from "antd";
import {Formik, Form, Field, FormikValues, FormikProps, withFormik, FormikErrors} from "formik";

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
    const MyForm = (props: FormikProps<IProducto>) => {
        const {
            values,
            touched,
            errors,
            handleChange,
            handleBlur,
            handleSubmit,
        } = props;
        return (
            <form onSubmit={handleSubmit}>
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
            console.log(values)
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
        <MyEnhancedForm
            producto={producto}
        />
    </>
    return vistaError ? vistaError : vistaNormal
}

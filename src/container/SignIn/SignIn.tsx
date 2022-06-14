import React, {useContext} from "react";
import {Button} from 'antd';
import {Formik, Form, Field} from "formik";
import {AntInput} from "../../components/UI/Antd/AntdInputWithFormik";
import openNotification from "../../components/UI/Antd/Notification";
import {AuthContext} from "../../context/AuthProvider";

const required = (value: any) => (value ? undefined : 'Requerido');

const SignIn = () => {
    const { signIn, loggedIn } = useContext(AuthContext);
    //TODO: Si esta logueado, le deberia redirigir a la pagina pedida
    return (
        <>
            <h2>Iniciar Sesion</h2>
            <Formik
                initialValues={{
                    user: '',
                    password: '',
                }}
                onSubmit={(values, {setSubmitting, setErrors, ...a}) => {
                    signIn(values).catch(error=> {
                        openNotification(error)
                        if(error?.response?.data?.errors){
                            setErrors(error.response.data.errors)
                        }else{
                            setErrors({
                                user:'error',
                                password:'error'
                            })
                        }
                    })
                }}>
                {({handleSubmit, submitCount, values}) =>
                    <Form onSubmit={handleSubmit}>
                        <Field
                            component={AntInput}
                            validate={required}
                            name="user"
                            type="text"
                            size="large"
                            placeholder="Usuario"
                            submitCount={submitCount}
                            hasFeedback
                        />
                        <Field
                            component={AntInput}
                            validate={required}
                            name="password"
                            type="password"
                            size="large"
                            placeholder="Clave"
                            submitCount={submitCount}
                            hasFeedback
                            autoComplete={'on'}
                        />
                        <Button
                            className="signin-btn"
                            type="primary"
                            htmlType="submit"
                            size="large"
                            style={{width: '100%'}}
                        >
                            Iniciar Sesion
                        </Button>
                    </Form>
                }
            </Formik>
        </>
    );
}
export default SignIn;

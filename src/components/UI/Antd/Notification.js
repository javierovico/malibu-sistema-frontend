import {notification, List} from "antd";
import React from "react";
import {BsXOctagonFill} from 'react-icons/bs';

const openNotification = (e, duracion = 30) => {
    console.error(e)
    let titulo = getTitleFromException(e)
    let contenido
    if (e?.mensaje) {
        contenido = <p>{e.mensaje}</p>
    } else if (e?.response?.data?.errors) {
        // contenido = <pre>{JSON.stringify(e.response.data.errors,null,4)}</pre>
        contenido = <List
            itemLayout="horizontal"
            dataSource={Object.entries(e.response.data.errors)}
            renderItem={([nombre, errores]) => (
                <List.Item>
                    <List.Item.Meta
                        avatar={<BsXOctagonFill/>}
                        title={<b>{nombre}</b>}
                        description={
                            <List
                                dataSource={errores}
                                renderItem={(error) => error}
                            />
                        }
                    />
                </List.Item>
            )}
        />
    } else if(e?.response?.data?.message) {
        contenido = <p>{e.response.data.message}</p>
    } else if(e?.response?.data?.detail) {
        contenido = <p>{e.response.data.detail}</p>
    } else if (e?.message) {
        contenido = <p>{e.message}</p>
    } else {
        contenido = 'Ocurrio un error'
    }
    notification.open({
        message: <b>{titulo}</b>,
        description: contenido,
        duration: duracion,
        icon: <BsXOctagonFill style={{color: '#e91010'}}/>,
    });
};

const getTitleFromException = (e) => {
    let titulo
    if (e?.titulo) {
        titulo = e.titulo
    } else if (e?.response?.data?.title) {
        titulo = e.response.data.title
    } else if (e?.response?.data?.message) {
        titulo = e.response.data.message
    } else if (e?.response?.data?.exception) {
        titulo = e.response.data.exception
    } else if (e?.name) {
        titulo = e.name
    } else {
        titulo = 'Error'
    }
    return titulo
}

export default openNotification
export {getTitleFromException};

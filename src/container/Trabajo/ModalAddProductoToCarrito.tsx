import {Modal} from "antd";
import * as React from "react";
import {ICarrito} from "../../modelos/Carrito";

interface Argumentos {
    carrito?: ICarrito,
    onCancel: { (): void },
}


export default function ModalAddProductoToCarrito(arg: Argumentos) {
    const {
        carrito,
        onCancel
    } = arg
    return <>
        <Modal  //Modal para mostrar los productos actuales
            title="Agregar producto al carrito"
            destroyOnClose={true}
            width={'100%'}
            footer={null}
            visible={!!carrito}
            onCancel={onCancel}
        >
            HOLA
        </Modal>
    </>
}

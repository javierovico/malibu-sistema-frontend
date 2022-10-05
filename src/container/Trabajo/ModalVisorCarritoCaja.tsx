import {Modal} from "antd";
import {ICarrito} from "../../modelos/Carrito";
import React, {useCallback} from "react";
import {DatosClienteCard} from "../../components/UI/Antd/AntdInputWithFormikTypescript";

interface Argumentos {
    carrito?: ICarrito,             //el carrito a editar (si es undefined se crea uno nuevo)
    abrirModal: boolean,            //define si el modal esta abierto
    handleCerrar: {() : void},      //cuando se cierra el modal
}

export default function ModalVisorCarritoCaja (arg: Argumentos){
    const {
        abrirModal,
        carrito,
        handleCerrar,
    } = arg
    const handleChangeCliente = useCallback(()=>{},[])
    return <>
        <Modal
            visible={abrirModal}
            onCancel={handleCerrar}
            title='Configuracion de Carrito'
        >
            <DatosClienteCard
                cliente={carrito?.cliente}
                handleChangeCliente={handleChangeCliente}
            />
        </Modal>
    </>
}

import {Modal} from "antd";
import {ICarrito} from "../../modelos/Carrito";

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
    return <>
        <Modal
            visible={abrirModal}
            onCancel={handleCerrar}
        >
            Mba'eteko
        </Modal>
    </>
}

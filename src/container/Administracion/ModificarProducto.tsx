import {useEffect, useState} from "react";
import {IProducto} from "../../modelos/Producto";
import VistaError from "../../components/UI/VistaError";

interface ArgumentosModificarProducto {
    productoId?: number,        //si esta definido, es el producto a editar
}

function useProducto(productoId: number|undefined) {
    const [producto, setProducto] = useState<IProducto|undefined>()
    const [isProductoLoading, setIsProductoLoading] = useState<boolean>(true)
    const [errorProducto, setErrorProducto] = useState<string|undefined>("ERROR");
    return {
        producto,
        isProductoLoading,
        errorProducto
    }
}

export default function ModificarProducto (arg: ArgumentosModificarProducto) {
    const {
        productoId
    } = arg
    const {
        producto,
        isProductoLoading,
        errorProducto
    } = useProducto(productoId)
    useEffect(()=>{
        console.log({producto})
    },[producto])
    const vistaNormal = <>
        <p> Modificacion de producto</p>
    </>
    return errorProducto ? <VistaError error={errorProducto}/> : vistaNormal
}

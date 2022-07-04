import SelectDeProductos from "./SelectDeProductos";
import {useContext, useEffect} from "react";
import {AuthContext} from "../../context/AuthProvider";

export default function ListaProductoDemo() {
    const {
        pusher,
        user
    } = useContext(AuthContext)
    useEffect(()=>{
        pusher?.subscribe('public.room')?.bind('message.new', (data:any)=>{
            console.log(data)
        })
        if (user?.id) {
            pusher?.subscribe('private-usuario.'+user.id).bind('message.new',(data:any)=>{
                console.log(data)
            })
        }
    },[pusher, user?.id])
    return <>
        <SelectDeProductos
            titulo='Seleccione un producto'
            productosExistentes={[]}
            onProductosSelectChange={(p)=>{
                console.log(p)
            }}
        />
    </>
}

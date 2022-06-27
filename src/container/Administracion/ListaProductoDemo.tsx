import SelectDeProductos from "./SelectDeProductos";

export default function () {
    return <>
        <SelectDeProductos
            titulo='Seleccione un producto'
            onProductoSelect={(p)=>{
                console.log({p})
            }}
        />
    </>
}

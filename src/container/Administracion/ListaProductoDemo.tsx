import SelectDeProductos from "./SelectDeProductos";

export default function () {
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

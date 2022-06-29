import TablaClientes from "./TablaClientes";
import {ItemBusqueda, ItemSorteado, useGenericModel} from "../../modelos/Generico";
import {ICliente, URL_CLIENTE} from "../../modelos/Cliente";
import {useState} from "react";

type Sorts = "id" | "nombre" | "ciudad"

interface Query {
    nombre: string,
    ruc: string,
    id: string,
    telefono: string,
    barrio: string,
    ciudad: string,
}

export default function SelectDeCliente () {
    const [page,setPage] = useState<number>(1)
    const [perPage,setPerPage] = useState<number>(15)
    const [sortBy, setSortBy] = useState<ItemSorteado<Sorts>[]>([{
        code: 'ciudad',
        orden: 'ascend'
    },{
        code: 'id',
        orden: 'descend'
    }]);
    const [busqueda,setBusqueda] = useState<Partial<Query>>({
        // nombre: 'toy',
    })
    const {
        paginacion
    } = useGenericModel<ICliente,Sorts,Query>(
        URL_CLIENTE,
        page,
        perPage,
        undefined,
        sortBy,
        busqueda
    )

    return <TablaClientes
        clientes={paginacion.data}
    />
}

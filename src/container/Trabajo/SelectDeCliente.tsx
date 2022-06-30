import TablaClientes from "./TablaClientes";
import {ItemSorteado} from "../../modelos/Generico";
import {QueryBusquedaCliente, SortCliente, useCliente} from "../../modelos/Cliente";
import {useState} from "react";

export default function SelectDeCliente () {
    const [page,setPage] = useState<number>(1)
    const [perPage,setPerPage] = useState<number>(15)
    const [sortBy, setSortBy] = useState<ItemSorteado<SortCliente>[]>([{
        code: 'ciudad',
        orden: 'ascend'
    },{
        code: 'id',
        orden: 'descend'
    }]);
    const [busqueda,setBusqueda] = useState<Partial<QueryBusquedaCliente>>({
        // nombre: 'toy',
    })
    const {
        paginacion
    } = useCliente(
        page,
        perPage,
        sortBy,
        busqueda
    )

    return <TablaClientes
        clientes={paginacion.data}
    />
}

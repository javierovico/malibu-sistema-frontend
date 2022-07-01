import TablaClientes, {
    ConfiguracionColumna,
    generadorColumna,
    ValorBuscado,
    ValorCambiado,
    ValorFiltrado
} from "./TablaClientes";
import {ItemSorteado} from "../../modelos/Generico";
import {ICliente, QueryBusquedaCliente, SortCliente, useCliente} from "../../modelos/Cliente";
import {useCallback, useMemo, useState} from "react";
import { keys } from 'ts-transformer-keys';

interface Parametros {
    titulo: string,
    handleSelectCliente: {(cliente: ICliente):void}
}


/**
 * Debe ser capaz de seleccionar un cliente existente o crear uno nuevo y seleccionarlo
 * @constructor
 */
export default function SelectDeCliente ({titulo, handleSelectCliente}: Parametros) {
    const [page,setPage] = useState<number>(1)
    const [perPage,setPerPage] = useState<number>(15)
    const [sortBy, setSortBy] = useState<ItemSorteado<SortCliente>[]>([]);
    const [busqueda,setBusqueda] = useState<Partial<QueryBusquedaCliente>>({
        nombre: 'toy',
    })
    const {
        paginacion
    } = useCliente(
        page,
        perPage,
        sortBy,
        busqueda
    )
    const onPaginationChange = useCallback((p: number, pp: number)=>{
        if (page !== p) {
            setPage(p)
        }
        if (perPage !== pp) {
            setPerPage(pp)
        }
    },[page, perPage])
    const onFiltroValuesChange = useCallback((v:ValorCambiado[])=>{
        const nuevaBusqueda = v
            .reduce<Partial<QueryBusquedaCliente>>((prev,curr)=>{
                const valorTraido = curr.value
                return {
                    ...prev,
                    [curr.code]: valorTraido
                }
            },busqueda)
        setBusqueda(nuevaBusqueda)
    },[busqueda])
    const onOrderByChange = useCallback((v: ItemSorteado<string>[])=>{
        setSortBy(v as ItemSorteado<SortCliente>[])
    },[])
    const configuracionColumnas = useMemo((): ConfiguracionColumna<ICliente>[]=> [
        generadorColumna<ICliente,QueryBusquedaCliente>('id',sortBy,true,true,undefined, busqueda),
        generadorColumna<ICliente,QueryBusquedaCliente>('nombre',sortBy,true,true,undefined, busqueda),
        generadorColumna<ICliente,QueryBusquedaCliente>('telefono',sortBy,true,true,undefined, busqueda),
        generadorColumna<ICliente,QueryBusquedaCliente>('ruc',sortBy,true,true,undefined, busqueda),
        generadorColumna<ICliente,QueryBusquedaCliente>('ciudad',sortBy,true,false,[
            {
                value: 'Hyattfort',
                text: 'Asuncion'
            },{
                value: 'Autumnborough',
                text: 'San Lorenzo'
            },{
                value: 'Pacochafort',
                text: 'Luque'
            }
        ], busqueda),
        generadorColumna<ICliente,QueryBusquedaCliente>('barrio',sortBy,true,true,undefined, busqueda)
    ],[busqueda, sortBy])
    return <TablaClientes
        configuracionColumnas={configuracionColumnas}
        items={paginacion.data}
        totalItems={paginacion.total}
        perPage={perPage}
        page={page}
        onPaginationChange={onPaginationChange}
        // onOrderByChange={(r)=>setSortBy(r as ItemSorteado<SortCliente>[])}
        onOrderByChange={onOrderByChange}
        onFiltroValuesChange={onFiltroValuesChange}
        onBusquedaValuesChange={onFiltroValuesChange}
    />
}

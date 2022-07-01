import TablaClientes, {ConfiguracionColumna, ValorFiltrado} from "./TablaClientes";
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
    const onPaginationChange = useCallback((p: number, pp: number)=>{
        if (page !== p) {
            setPage(p)
        }
        if (perPage !== pp) {
            setPerPage(pp)
        }
    },[page, perPage])
    const onFiltroValuesChange = useCallback((v:ValorFiltrado[])=>{
        console.log(v)
        const nuevaBusqueda = v
            .reduce<Partial<QueryBusquedaCliente>>((prev,curr)=>{
                const valorTraido = curr.value.length ? curr.value : undefined
                return {
                    ...prev,
                    [curr.code]: valorTraido
                }
            },busqueda)
        console.log({nuevaBusqueda,busqueda})
        setBusqueda(nuevaBusqueda)
    },[busqueda])
    const configuracionColumnas = useMemo((): ConfiguracionColumna<ICliente>[]=> [{
        key: 'id',
        sortable:true,
        sortOrder: sortBy.find(r=>r.code==='id')?.orden,
        searchable: true,
    },{
        key: 'nombre',
        sortable:true,
        sortOrder: sortBy.find(r=>r.code==='nombre')?.orden,
        searchable: true,
        valoresFiltro: 'Albert'
    },{
        key: 'ruc',
        sortable:true,
        sortOrder: sortBy.find(r=>r.code==='ruc')?.orden,
        searchable: true,
    },{
        key: 'telefono',
        searchable: true,
    },{
        key: 'ciudad',
        sortable:true,
        sortOrder: sortBy.find(r=>r.code==='ciudad')?.orden,
        valoresAdmitidosFiltro: [{
            value: 'santa_ana',
            text: 'Santa Ana'
        },{
            value: 'santa_isabel',
            text: 'Santa Isabel'
        }],
        valoresFiltro: ['santa_isabel']
    },{
        key: 'barrio',
        sortable:true,
        sortOrder: sortBy.find(r=>r.code==='barrio')?.orden,
        valoresAdmitidosFiltro: [{
            value: 'barrio_santa_ana',
            text: 'Barrio Santa Ana'
        },{
            value: 'barrio_santa_isabel',
            text: 'Barrio Santa Isabel'
        }],
        // valoresFiltro: ['barrio_santa_ana']
    }],[sortBy])
    return <TablaClientes
        configuracionColumnas={configuracionColumnas}
        items={paginacion.data}
        totalItems={paginacion.total}
        perPage={perPage}
        page={page}
        onPaginationChange={onPaginationChange}
        onOrderByChange={(r)=>setSortBy(r as ItemSorteado<SortCliente>[])}
        onFiltroValuesChange={onFiltroValuesChange}
    />
}

import TablaGenerica, {
    ConfiguracionColumnaSimple,
    ItemsSelected,

} from "./TablaGenerica";
import {useTablaOfflineAuxiliar} from "../../modelos/Generico";
import React, {useCallback, useMemo} from "react";
import {Col, Row} from "antd";
import {IMesa, useMesas} from "../../modelos/Carrito";

interface Parametros {
    handleSelectMesa: {(mesa: IMesa):void},
    mesaSelected?: IMesa,
    titulo?:string
}


/**
 * Debe ser capaz de seleccionar un mesa existente o crear uno nuevo y seleccionarlo
 * @constructor
 */
export default function SelectDeMesa ({handleSelectMesa,mesaSelected,titulo}: Parametros) {
    const {
        paginacionMesas,
        isMesasLoading
    } = useMesas()
    const configuracionColumnasSimple: ConfiguracionColumnaSimple<IMesa>[]= useMemo<ConfiguracionColumnaSimple<IMesa>[]>(()=>[
        {
            key:'code',
            titulo:'Mesa',
            sortable: true,
            searchable: true,
        }
    ],[])
    const {
        items,
        setSortBy,
        onFiltroValuesChange,
        configuracionColumnas
    } = useTablaOfflineAuxiliar(paginacionMesas.data, configuracionColumnasSimple)
    const onItemsIdSelectedChange = useCallback((items: ItemsSelected<IMesa>[])=>{
        const selected = items.find(i=>i.selected)?.item
        selected && handleSelectMesa(selected)
    },[handleSelectMesa])
    const tituloCreado = <>
        <Row justify="space-between">
            <Col lg={12}>
                <h3>{titulo || 'Seleccione Mesa'}</h3>
            </Col>
        </Row>
    </>
    return <>
        <TablaGenerica
            loading={isMesasLoading}
            title={tituloCreado}
            itemsIdSelected={mesaSelected?.id?[mesaSelected.id]:[]}
            onItemsIdSelectedChange={onItemsIdSelectedChange}
            configuracionColumnas={configuracionColumnas}
            items={items}
            totalItems={items.length}
            onOrderByChange={setSortBy}
            onBusquedaValuesChange={onFiltroValuesChange}
            onFiltroValuesChange={onFiltroValuesChange}
            typeSelcted={'radio'}
        />
    </>
}

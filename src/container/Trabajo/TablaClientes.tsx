import {Table} from "antd";
import {ICliente} from "../../modelos/Cliente";
import {useMemo} from "react";
import {ColumnsType} from "antd/lib/table/interface";

interface Parametros {
    clientes: ICliente[]
}

export default function TablaClientes (arg: Parametros){
    const {
        clientes
    } = arg
    const columnas = useMemo((): ColumnsType<ICliente> =>[
        {
            title: 'ID',
            key: 'id',
            dataIndex: 'id',
        },{
            title: 'Nombre',
            key: 'nombre',
            dataIndex: 'nombre'
        }
    ],[])
    return <Table
        rowKey={'id'}
        columns={columnas}
        dataSource={clientes}
    />
}

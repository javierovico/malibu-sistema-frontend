import {Button, Space, Table} from "antd";
import {IProducto} from "../../modelos/Producto";
import {useMemo} from "react";
import {ColumnsType} from "antd/lib/table/interface";
import {formateadorNumero} from "../../utils/utils";

interface ParametrosRecibidos {
    productos: IProducto[],
    acciones?: (p: IProducto) => JSX.Element,
    title?: string
}

export default function TablaProductos({title, productos, acciones}: ParametrosRecibidos) {
    const columnas = useMemo((): ColumnsType<IProducto>=> {
        const columnas: ColumnsType<IProducto> = [
            {
                title: 'Nombre',
                key: 'nombre',
                dataIndex: 'nombre',
            },
            {
                title: 'Precio',
                key: 'precio',
                dataIndex: 'precio',
                render: value => formateadorNumero(value) + ' Gs.',
            },
            {
                title: 'Costo',
                key: 'costo',
                dataIndex: 'costo',
                render: value => formateadorNumero(value) + ' Gs.',
            },
        ]
        if (acciones) {
            columnas.push({
                title: 'Acciones',
                key: 'action',
                render: acciones,
            })
        }
        return columnas
    },[acciones])
    return <Table title={()=>title} rowKey={'id'} columns={columnas} dataSource={productos} />
}

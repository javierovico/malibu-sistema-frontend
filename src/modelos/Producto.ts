export interface IProducto {
    id: number,
    codigo: string,
    nombre: string,
    descripcion: string,
    precio: number,
    s3_key: string,
    url: string
}

export const URL_GET_PRODUCTOS = 'producto'

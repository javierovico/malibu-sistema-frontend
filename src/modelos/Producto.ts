export interface IProducto {
    imagen?: IArchivo;
    id: number|null,        //si es null es porque no existe
    codigo: string,
    nombre: string,
    descripcion: string,
    precio: number,
    costo: number,
    s3_key: string,
    url: string
}

export interface IArchivo {
    url: string
}

export const productoVacio: IProducto = {
    precio: 0,
    costo: 0,
    nombre: '',
    codigo: '',
    id: null,
    url: '',
    descripcion: '',
    s3_key: ''
}

export const URL_GET_PRODUCTOS = 'producto'

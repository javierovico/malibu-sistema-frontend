const URL_USUARIO_PROPIO: string = `/auth/user`;
const URL_LOGIN: string = '/auth/login';

interface IRol {
    codigo: RolesDisponibles,
    descripcion: string,
}

interface IUsuario {
    user: string,
    id: number,
    roles?: IRol[],
}

export enum RolesDisponibles {
    // ROL_ADMIN = 'admin',
    ROL_ADMIN_PRODUCTO = 'admin_productos',
    ROL_VISOR_INGRESOS = 'visor_ingresos',
    ROL_OPERADOR = 'operador',
    ROL_COCINERO = 'cocinero',
}

interface TokenUsuarioResponse {
    readonly expires: string,
    readonly token: string,
    readonly type: string,
}

interface UsuarioResponse {
    readonly usuario: IUsuario
}

export interface SubordinadosResponse {
    readonly subordinados: IUsuario[]
}

export {URL_USUARIO_PROPIO, URL_LOGIN};
export type {TokenUsuarioResponse, UsuarioResponse, IUsuario};

export function comprobarRol(user: IUsuario, rolCode: RolesDisponibles) {
    return !!user.roles?.find((rol) => rol.codigo === rolCode)
}

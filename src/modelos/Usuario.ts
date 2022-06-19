const URL_USUARIO_PROPIO: string = `/auth/user`;
const URL_LOGIN: string = '/auth/login';

interface IRol {
    codigo: string,
    descripcion: string,
}

interface IUsuario {
    user: string,
    nombre: string,
    id: number,
    roles: IRol[],
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

export function comprobarRol(user: IUsuario, rolCode: string) {
    return !!user.roles.find((rol) => rol.codigo === rolCode)
}

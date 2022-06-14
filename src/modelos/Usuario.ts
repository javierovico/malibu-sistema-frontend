export default class Usuario implements IUsuario {
    id: number;
    nombre: string;
    user: string;

    constructor(obj: IUsuario) {
        this.id = obj.id;
        this.nombre = obj.nombre;
        this.user = obj.user;
    }

    getLinkSubordinados(): string {
        return URL_USUARIO + '/' + this.id + URL_SUBORDINADO
    }
}

const URL_USUARIO_PROPIO: string = `/auth/user`;
const URL_USUARIO: string = '/usuario'
const URL_SUBORDINADO: string = '/subordinado'
const URL_LOGIN: string = '/auth/login';

interface IUsuario {
    user: string,
    nombre: string,
    id: number,
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


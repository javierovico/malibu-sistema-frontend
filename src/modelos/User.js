import ClaseModelV3 from './ClaseModelV3';

export default class User extends ClaseModelV3 {
    static URL_DESCARGA = `/auth/user`;
    static URL_LOGIN = '/auth/login';
    //parametros
    login;

    constructor(atributos) {
        super({atributos});
    }

    comprobarPermiso() {
        let permisoId = parseInt(process.env.REACT_APP_ID_PLATAFORMA)
        return !!this.servicios?.find(s=>s.cuenta?.plataforma.id === permisoId)
    }
}

import React, {useContext, useMemo} from 'react';
import {Routes, Route, Navigate, RouteObject, useRoutes} from 'react-router-dom';
import {AuthContext} from './context/AuthProvider';
import {
    HOME_PAGE,
    LOGIN_PAGE, PRODUCTO_ADMINISTRAR_PRODUCTO, ROL_ADMIN_PRODUCTOS, SUBORDINADOS_PAGE,
} from './settings/constant';
import loadable from '@loadable/component'
import {comprobarRol} from "./modelos/Usuario";
import AdminProducto from "./container/Administracion/AdminProducto";
import Dummy2 from "./container/Dummy/Dummy2";

/**
 *
 * Public Routes
 *
 */
const Loading = () => <p>...Cargando</p>;

export interface TipoRuta {
    nombre: string,
    link: string,
    import?: string,
    hijos?: TipoRuta[],
    protected: boolean,
    ocultarOpcion?: boolean, // le decimos si queremos que esta ruta este oculta del menu
    redirectOnLoggedIn?: string,    //le decimos a donde redirigir si el usuario esta logueado
    rolRequerido?: string
}

export const routes: TipoRuta[] = [
    {
        nombre: 'Inicio',
        link: HOME_PAGE,
        import: 'container/Home/Home',
        protected: true,
    },
    {
        nombre: "Productos",
        link: "/producto",
        hijos: [
            {
                nombre: 'Administrar Productos',
                link: PRODUCTO_ADMINISTRAR_PRODUCTO,
                import: 'container/Administracion/AdminProducto',
                protected: true,
                rolRequerido: ROL_ADMIN_PRODUCTOS
            },
            {
                nombre: 'Subordinados2',
                link: SUBORDINADOS_PAGE + '2',
                import: 'container/Dummy/Dummy',
                protected: false,
                hijos: [
                    {
                        nombre: 'Administrar Productos',
                        link: PRODUCTO_ADMINISTRAR_PRODUCTO,
                        import: 'container/Dummy/Dummy',
                        protected: true,
                        rolRequerido: ROL_ADMIN_PRODUCTOS
                    },
                ]
            },
        ],
        protected: true,
    },
    {
        nombre: 'Pagina No Encontrada',
        link: '*',
        import: 'container/404/404',
        protected: false,
        ocultarOpcion: true,
    },
    {
        nombre: 'Inicio Sesion',
        link: LOGIN_PAGE,
        import: 'container/SignIn/SignIn',
        protected: false,
        ocultarOpcion: true,
        redirectOnLoggedIn: HOME_PAGE
    }
];

const Rutas = () => {
    const {loggedIn, user} = useContext(AuthContext);
    const rutasUsadas = useMemo<RouteObject[]>(() => {
        const rutasDesplegadas: RouteObject[] = []
        const funcionHijas = (basePath: string, r: TipoRuta) => {
            if (r.import) {
                /** Redirecciona a Login si es una ruta protegida y si no esta logueado, si esta logueado y si esta activa la redireccion, redirecciona tambien*/
                const redirect = (r.protected && !loggedIn) ? LOGIN_PAGE : ((loggedIn && r.redirectOnLoggedIn) ? r.redirectOnLoggedIn : null)
                let OtherComponent
                if (r.rolRequerido && user && !comprobarRol(user,r.rolRequerido)) {  // si se requiere un rol y si el usuario no tiene ese rol
                    OtherComponent = loadable(() => import('./container/404/SinPermiso'))
                } else {
                    OtherComponent = loadable(() => import('./' + r.import))
                }
                rutasDesplegadas.push({
                    path: basePath + r.link,
                    element: redirect ? <Navigate to={redirect}/> : <OtherComponent/>
                })
            }
            r.hijos?.forEach(i => funcionHijas(r.link, i))
        }
        routes.forEach(i => funcionHijas('', i))
        return rutasDesplegadas;
    }, [loggedIn, user])
    return useRoutes(rutasUsadas);
};

export default Rutas;

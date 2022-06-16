import React, {useContext, useMemo} from 'react';
import {Navigate, RouteObject, useRoutes} from 'react-router-dom';
import {AuthContext} from './context/AuthProvider';
import {
    HOME_PAGE,
    LOGIN_PAGE, SUBORDINADOS_PAGE,
} from './settings/constant';
import loadable from '@loadable/component'

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
}

export const routes: TipoRuta[] = [
    {
        nombre: 'Inicio',
        link: HOME_PAGE,
        import: 'container/Home/Home',
        protected: true,
    },
    {
        nombre: "Usuarios",
        link: "/usuario",
        hijos: [
            {
                nombre: 'Subordinados',
                link: SUBORDINADOS_PAGE,
                import: 'container/Usuarios/Subordinados',
                protected: true,
            },
            {
                nombre: 'Subordinados2',
                link: SUBORDINADOS_PAGE + '2',
                import: 'container/Dummy/Dummy',
                protected: false,
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
    },
    {
        nombre: 'Dummy Sesion',
        link: '/dumy',
        import: 'container/Home/Home',
        protected: false,
    },
];

const Rutas = () => {
    const {loggedIn} = useContext(AuthContext);
    const rutasUsadas = useMemo<RouteObject[]>(() => {
        const rutasDesplegadas: RouteObject[] = []
        const funcionHijas = (basePath: string, r: TipoRuta) => {
            if (r.import) {
                /** Redirecciona a Login si es una ruta protegida y si no esta logueado, si esta logueado y si esta activa la redireccion, redirecciona tambien*/
                const redirect = (r.protected && !loggedIn) ? LOGIN_PAGE : ((loggedIn && r.redirectOnLoggedIn) ? r.redirectOnLoggedIn : null)
                const OtherComponent = loadable(() => import('./' + r.import))
                rutasDesplegadas.push({
                    path: basePath + r.link,
                    element: redirect ? <Navigate to={redirect}/> : <OtherComponent/>
                })
            }
            r.hijos?.forEach(i => funcionHijas(r.link, i))
        }
        routes.forEach(i => funcionHijas('', i))
        return rutasDesplegadas;
    }, [loggedIn])
    const ProjectRoutes = () => useRoutes(rutasUsadas);
    return (
        <ProjectRoutes/>
    );
};

export default Rutas;

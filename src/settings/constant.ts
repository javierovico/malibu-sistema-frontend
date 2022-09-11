// **************** ROUTE CONSTANT START **************************
// General Page Section
import {RolesDisponibles} from "../modelos/Usuario";

export const HOME_PAGE = '/';
export const SUBORDINADOS_PAGE = '/subordinados';
export const AGENTS_PAGE = '/agents';

//Lista productos
export const PRODUCTO_ADMINISTRAR_PRODUCTO = '/administrar-productos'

// Login / Registration Page
export const LOGIN_PAGE = '/login';

/*******************************************************
 * Codigos de errores *
 *******************************************************/
export const ERROR_CODE_NO_AUTENTICADO = 'tkn_vnc';
export const ERROR_CODE_SIN_ACCESO_SSO = 'plat_sp';
export const ERROR_CODE_NO_VALIDO = 'tkn_inv';

//Permisos disponibles

export const ROL_ADMIN_PRODUCTOS = RolesDisponibles.ROL_ADMIN_PRODUCTO
export const ROL_VISOR_INGRESOS = RolesDisponibles.ROL_VISOR_INGRESOS
export const ROL_OPERADOR = RolesDisponibles.ROL_OPERADOR
export const ROL_COCINERO = RolesDisponibles.ROL_COCINERO

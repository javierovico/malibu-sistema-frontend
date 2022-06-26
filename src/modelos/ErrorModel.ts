import {AxiosError} from "axios";

interface ItemError {
    name: string,
    errors: string[]
}

export interface IError {
    code: string,
    message: string,
    title: string,
    items: ItemError[]
}

export function objectIsItemError(o:any): o is ItemError {
    return 'name' in o && 'errors' in o && Array.isArray(o.errors) && o.errors.every((i:any) => typeof i === 'string')
}

export function objectIsIError(o:any): o is IError {
    return ('code' in o) && ('message' in o) && ('title' in o) && ('items' in o) && Array.isArray(o.items) && o.items.every((i:any)=>objectIsItemError(i))
}

export function errorToFormik(e: any): Record<string, string>|null {
    const errorEstandar: IError = errorRandomToIError(e)
    if (errorEstandar.items.length) {
        const errorFormik: Record<string, string> = {}
        for (const key in errorEstandar.items) {
            errorFormik[errorEstandar.items[key].name] = errorEstandar.items[key].errors.join(', ')
        }
        return errorFormik
    } else {
        return null
    }
}

export function errorRandomToIError(e: any, conversiones?: Record<string, string>): IError {
    if (objectIsIError(e)) {
        return e;
    }
    let title: string
    let code: string
    let message: string
    const items: ItemError[] = []
    if (e instanceof AxiosError) {
        title = e.response?.data?.title || "Sin datos reconocidos desde Peticion HTTP"
        code = e.response?.data?.code || "sinCodeHTTP"
        message = e.response?.data?.message || 'Sin mensaje detallado'
        const errorsLaravel: Record<string, string[]> = e.response?.data?.data?.errors || {}
        for (const key2 in errorsLaravel) {
            const key: string = key2.split('.')[0]
            items.push({
                name: (conversiones && key in conversiones)? conversiones[key] : key,
                errors: errorsLaravel[key2]
            })
        }
    } else if (e instanceof Error) {
        title = e.name
        code = e.name
        message = e.message
    } else {
        title = 'Sin Titulo'
        code = 'sinCodeJS'
        message = 'Sin Mensaje detallado'
    }
    return {
        code,
        items,
        title,
        message
    }
}

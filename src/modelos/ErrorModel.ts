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

export function errorRandomToIError(e: any): IError {
    let title: string
    let code: string
    let message: string
    const items: ItemError[] = []
    if (e instanceof AxiosError) {
        title = e.response?.data?.title || "Sin datos reconocidos desde Peticion HTTP"
        code = e.response?.data?.code || "sinCodeHTTP"
        message = e.response?.data?.message || 'Sin mensaje detallado'
        const errorsLaravel: Record<string, string[]> = e.response?.data?.data?.errors || {}
        for (const key in errorsLaravel) {
            items.push({
                name: key,
                errors: errorsLaravel[key]
            })
        }
    } else if (e instanceof Error) {
        title = e.name
        code = e.name
        message = e.message
    }else {
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

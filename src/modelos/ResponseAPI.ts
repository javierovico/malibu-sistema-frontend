export default interface ResponseAPI<T> {
    title: string
    message: string
    code: string
    data: T
    success: boolean
    errors: string[][] | null
}
export interface ResponseAPIPaginado<T> {
    current_page: number,
    data: T[],
    last_page: number,
    per_page: number,
    total: number
}

export const PaginacionVacia = {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
}

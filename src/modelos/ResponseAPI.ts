export default interface ResponseAPI<T> {
    title: string
    message: string
    code: string
    data: T
    success: boolean
    errors: string[][] | null
}

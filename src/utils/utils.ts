import { createCanvas, loadImage } from 'canvas';
import {message} from "antd";

export function convertAndResizeImage(file: Blob) {
    return new Promise<string>(async (resolve, reject) => {
        const image = await loadImage(URL.createObjectURL(file))
            .catch(reject)
        if (image) {
            const {width: anchoOriginal, height: altoOriginal} = image;
            const tam = 500;
            const canvas = createCanvas(tam, tam);
            const ctx = canvas.getContext('2d');
            const escala = Math.max(
                canvas.width / anchoOriginal,
                canvas.height / altoOriginal
            );
            ctx.setTransform(
                escala,
                0,
                0,
                escala,
                canvas.width / 2,
                canvas.height / 2
            );
            ctx.drawImage(
                image,
                -anchoOriginal / 2,
                -altoOriginal / 2,
                anchoOriginal,
                altoOriginal
            );
            resolve(canvas.toDataURL("image/jpeg",0.95))
        }
    })
}

export function mostrarMensaje(mensaje: string, type: "success"|"error" = "success") {
    new Promise(()=>{
        switch (type) {
            case "success":
                message.success(mensaje)
                break
            case "error":
                message.error(mensaje)
                break
        }
    })
}

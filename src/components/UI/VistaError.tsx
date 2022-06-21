import {Result} from "antd";
import React from "react";

interface ArgumentosVistaError {
    error?: string
}

export default function VistaError({error}: ArgumentosVistaError) {
    return <Result
        status="error"
        title={error || "Error realizando la operacion, revise el log"}
    />
}

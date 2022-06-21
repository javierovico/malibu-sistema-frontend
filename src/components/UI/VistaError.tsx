import {Result, Typography} from "antd";
import React from "react";
import {CloseCircleOutlined} from "@ant-design/icons";
import {IError} from "../../modelos/ErrorModel";

interface ArgumentosVistaError {
    error: IError
}

export default function VistaError({error}: ArgumentosVistaError) {
    return <Result
        status="error"
        title={error.title}
        subTitle={error.message}
    >
        {!!error.items.length && <div className="desc">
            <Typography.Paragraph>
                <Typography.Text
                    strong
                    style={{
                        fontSize: 20,
                    }}
                >
                    Detalle de errores
                </Typography.Text>
            </Typography.Paragraph>
            {error.items.map((i,index) => (
                <React.Fragment key={'p'+index}>
                    <Typography.Paragraph>
                        <Typography.Text
                            strong
                            style={{
                                fontSize: 16,
                            }}
                        >
                            {i.name}:
                        </Typography.Text>
                    </Typography.Paragraph>
                    {i.errors.map((e,indexe)=>(
                        <Typography.Paragraph key={'h'+indexe}>
                            <CloseCircleOutlined className="site-result-demo-error-icon" style={{color: 'red'}}/> {e}
                        </Typography.Paragraph>
                    ))}
                </React.Fragment>
            ))}
        </div>}
    </Result>
}

import {Button, Card, Form, Select, Switch, Upload, UploadProps} from "antd";
import React, {useCallback, useContext, useMemo} from "react";
import {CheckOutlined, CloseOutlined, LoadingOutlined, PlusOutlined, UploadOutlined} from '@ant-design/icons';
import {CreateAntField} from "./AntdInputWithFormik";
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import {UploadChangeParam, UploadFile} from "antd/lib/upload/interface";
import {convertAndResizeImage} from "../../../utils/utils";
import {AuthContext} from "../../../context/AuthProvider";
import {SelectProps} from "antd/lib/select";
import {SwitchProps} from "antd/lib/switch";
import {ICliente} from "../../../modelos/Cliente";
const FormItem = Form.Item;

interface ArchivoSubible {
    base64: string
}

interface FileSelectParams {
    value: string,  //la url por lo visto
    customRequest: { (options: UploadRequestOption) : void },
    onChange: { (param?: string): void },
}

const FileSelect = ({ value, onChange }: FileSelectParams) => {
    const {setErrorException} = useContext(AuthContext)
    const loading = false;
    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Cargar</div>
        </div>
    );
    const uploadProps = useMemo(():UploadProps<ArchivoSubible> =>({
        customRequest:({onError, onSuccess, ...options}: UploadRequestOption<ArchivoSubible>)=>{
            //conversion de dimencion y conversion a base64
            if (!(options.file instanceof Blob)) {
                onError && onError({
                    message: 'Tipo de file no es compatible con Blob',
                    name: 'Error',
                })
                return
            }
            convertAndResizeImage(options.file)
                .then(r => onSuccess && onSuccess({base64:r}))
                .catch(e => onError && onError(e))
        },
        name: 'avatar',
        listType:'picture-card',
        className:'avatar-uploader',
        showUploadList: false,
        type: 'drag',
        accept:'image/*',
        onChange: (info: UploadChangeParam<UploadFile<ArchivoSubible>>) => {
            switch (info.file.status) {
                case "done":
                    onChange(info.file.response?.base64)
                    break;
                case "removed":     //TODO: deberia estar contemplado en la vista
                    onChange(undefined)
                    break;
                case "error":
                    setErrorException(info.file.error)
                // LOS demas son ignorados (no mostramos progressbar)
            }
        },
    }),[onChange, setErrorException])

    return (
        <Upload {...uploadProps}>
            {value ? (
                <div>
                    <img src={value} alt='avatar' style={{ width: '100%' }} />
                    <Button icon={<UploadOutlined />} type="dashed">
                        Actualizar
                    </Button>
                </div>
            ) : (
                uploadButton
            )}
        </Upload>
    );
};

export const AntFileSelect = CreateAntField(FileSelect);

export type AntdSelectV2Option<T> = { key: T, value: string}

interface ArgSelect<T extends string|number> {
    label: string,
    selectOptions: AntdSelectV2Option<T>[],
    onChange: {(item: T):void},
    value?: T,
    placeholder?: string,
    submitCount: number,
    touched?:boolean,
    error?: string,
    onBlur?:{():void}
}

export function AntdSelectV2<T extends string|number>(arg: ArgSelect<T> & SelectProps) {
    const {
        label,
        selectOptions,
        onChange,
        touched,
        submitCount,
        error,
        ...argSelect
    } = arg
    const {
        onBlur
    } = argSelect
    const enviado: boolean = useMemo(()=>submitCount > 0,[submitCount])
    return (
        <div className="field-container">
            <FormItem
                label={label}
                colon={false}
                hasFeedback={enviado || touched}
                validateStatus={((enviado || touched) && error)? 'error':'success'}
                help={((enviado || touched))? error:''}
            >
                <Select
                    {...argSelect}
                    showSearch
                    optionFilterProp="children"
                    onChange={(v)=>{onChange(v);onBlur && onBlur()}}
                    filterOption={(input, option) =>
                        (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {selectOptions.map(m=><Select.Option key={m.key} value={m.key}>{m.value}</Select.Option>)}
                </Select>
            </FormItem>
        </div>
    )
}

interface ArgsSwitch {
    label: string,
    onChange: {(val: boolean):void}, //comparte con SwitchProps
    checked: boolean,       //comparte con SwitchProps
    submitCount: number,
    touched?:boolean,
    error?: string,
    onBlur?:{():void}
}

export function SwitchV2(arg: ArgsSwitch & SwitchProps) {
    const {
        label,
        onChange,
        submitCount,
        touched,
        error,
        onBlur,
        ...switchProps
    } = arg
    const enviado: boolean = submitCount > 0
    return (
        <div className="field-container">
            <FormItem
                label={label}
                colon={false}
                hasFeedback={enviado || touched}
                validateStatus={((enviado || touched) && error)? 'error':'success'}
                help={((enviado || touched))? error:''}
            >
                <Switch
                    {...switchProps}
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    onChange={(v)=>{onChange(v);onBlur?.()}}
                />
            </FormItem>
        </div>
    )
}

interface ArgClienteCard {
    cliente?: ICliente,
    handleChangeCliente?: {() : void}
}

export function DatosClienteCard(arg: ArgClienteCard) {
    const {
        cliente,
        handleChangeCliente
    } = arg
    const extra = useMemo(()=>handleChangeCliente?<a href="/#" onClick={(e) => {
        e.preventDefault();
        handleChangeCliente()
    }}>Cambiar</a>:undefined,[handleChangeCliente])
    
    return <Card title="Datos del cliente" extra={extra}>
        {cliente ? <>
            <p>Nombre: {cliente.nombre ?? 'ANONIMO'}</p>
            <p>Telefono: {cliente.telefono}</p>
            <p>Ruc: {cliente.ruc}</p>
            <p>Ciudad: {cliente.ciudad}</p>
            <p>Barrio: {cliente.barrio}</p>
        </>: <p>Sin cliente</p>}
    </Card>
}
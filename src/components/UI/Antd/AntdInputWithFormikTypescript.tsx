import {Button, Form, Select, Switch, Upload, UploadProps} from "antd";
import React, {useContext, useMemo} from "react";
import {CheckOutlined, CloseOutlined, LoadingOutlined, PlusOutlined, UploadOutlined} from '@ant-design/icons';
import {CreateAntField} from "./AntdInputWithFormik";
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import {UploadChangeParam, UploadFile} from "antd/lib/upload/interface";
import {convertAndResizeImage} from "../../../utils/utils";
import {AuthContext} from "../../../context/AuthProvider";
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

export function AntdSelectV2<T extends string|number>(arg: ArgSelect<T>) {
    const {
        label,
        selectOptions,
        onChange,
        value,
        placeholder,
        touched,
        submitCount,
        error,
        onBlur
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
                <Select
                    showSearch
                    placeholder={placeholder}
                    optionFilterProp="children"
                    onChange={(v)=>{onChange(v);onBlur && onBlur()}}
                    value={value}
                    filterOption={(input, option) =>
                        (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                    }
                    onBlur={onBlur}
                >
                    {selectOptions.map(m=><Select.Option key={m.key} value={m.key}>{m.value}</Select.Option>)}
                </Select>
            </FormItem>
        </div>
    )
}

interface ArgsSwitch {
    label: string,
    onChange: {(val: boolean):void},
    value: boolean,
    placeholder?: string,
    submitCount: number,
    touched?:boolean,
    error?: string,
    onBlur?:{():void}
}

export function SwitchV2(arg: ArgsSwitch) {
    const {
        label,
        onChange,
        value,
        touched,
        submitCount,
        error,
        onBlur
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
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={value}
                    onChange={(v)=>{onChange(v);onBlur?.()}}
                />
            </FormItem>
        </div>
    )
}

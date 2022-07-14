import {Button, Form, Select, Upload, UploadProps} from "antd";
import React, {useContext, useMemo} from "react";
import { LoadingOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {CreateAntField} from "./AntdInputWithFormik";
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import {UploadChangeParam, UploadFile} from "antd/lib/upload/interface";
import {convertAndResizeImage} from "../../../utils/utils";
import {AuthContext} from "../../../context/AuthProvider";
import {FieldProps} from "formik";
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
    hasFeedback:boolean,
    label: string,
    selectOptions?: AntdSelectV2Option<T>[],
    submitCount: number,
    onChange: {(item: T):void}
}

export function AntdSelectV2<T extends string|number>(arg: FieldProps & ArgSelect<T>) {
    const {
        field,
        form,
        meta,
        hasFeedback,
        label,
        selectOptions,
        submitCount,
        onChange,
    } = arg
    const touched = form.touched[field.name];
    const submitted = submitCount > 0;
    const hasError = form.errors[field.name];
    const submittedError = hasError && submitted;
    const touchedError = hasError && touched;
    return (
        <div className="field-container">
            <FormItem
                label={label}
                colon={false}
                hasFeedback={
                    !!((hasFeedback && submitted) || (hasFeedback && touched))
                }
                help={submittedError || touchedError ? (hasError.toString()??false) : false}
                validateStatus={submittedError || touchedError ? 'error' : 'success'}
            >
                <Select
                    showSearch
                    placeholder="Select a person"
                    optionFilterProp="children"
                    // onChange={(mesa_id)=>setValues({...values,mesa_id,mesa:mesas?.find(m=>m.id===mesa_id)})}
                    onChange={onChange}
                    value={field.value}
                    filterOption={(input, option) =>
                        (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {selectOptions?.map(m=><Select.Option key={m.key} value={m.key}>{m.value}</Select.Option>)}
                </Select>
            </FormItem>
        </div>
    )
}

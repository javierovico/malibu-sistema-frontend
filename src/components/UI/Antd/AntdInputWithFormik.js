import React from 'react';

import map from 'lodash/map';
import {
    DatePicker,
    Form,
    Input,
    TimePicker,
    Select,
    Rate,
    // Switch,
    Checkbox,
} from 'antd';


const {RangePicker} = DatePicker;
const FormItem = Form.Item;
const {Option} = Select;

export const CreateAntField = Component => ({
                                         field,
                                         form,
                                         hasFeedback,
                                         label,
                                         selectOptions,
                                         selectOptionsKeyValue,
                                         submitCount,
                                         type,
                                         renderRight,
                                         ...props
                                     }) => {
    const touched = form.touched[field.name];
    const submitted = submitCount > 0;
    const hasError = form.errors[field.name];
    const submittedError = hasError && submitted;
    const touchedError = hasError && touched;
    const onInputChange = ({target: {value}}) =>
        form.setFieldValue(field.name, value);
    const onChange = value => form.setFieldValue(field.name, value);
    const onBlur = () => form.setFieldTouched(field.name, true);

    const optionSelect = selectOptions
        ? map(selectOptions, name => <Option key={name}>{name}</Option>)
        : selectOptionsKeyValue
            ? map(selectOptionsKeyValue, ({ label, value }) => (
                <Option key={value} value={value}>
                    {label}
                </Option>
            ))
            : null;
    return (
        <div className="field-container">
            <FormItem
                label={label}
                colon={false}
                hasFeedback={
                    !!((hasFeedback && submitted) || (hasFeedback && touched))
                }
                help={submittedError || touchedError ? hasError : false}
                validateStatus={submittedError || touchedError ? 'error' : 'success'}
            >
                <Component
                    {...field}
                    {...props}
                    type={type}
                    onBlur={onBlur}
                    onChange={type ? onInputChange : onChange}
                    suffix={(<span/>)}
                >
                    {optionSelect}
                </Component>
            </FormItem>
        </div>
    );
};

export const AntSelect = CreateAntField(Select);
export const AntDatePicker = CreateAntField(DatePicker);
export const AntInput = CreateAntField(Input);
export const AntTextArea = CreateAntField(Input.TextArea);
export const AntTimePicker = CreateAntField(TimePicker);
export const AntRate = CreateAntField(Rate);
// export const AntSwitch = CreateAntField(Switch);
export const AntRange = CreateAntField(RangePicker);
export const AntCheckbox = CreateAntField(Checkbox);

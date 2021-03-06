import React from 'react';

const IS_REACT_GREATER_FITHTEEN = parseInt(React.version, 10) > 15;
const prefix = 'ant';
const noop = v => v;

function formatValue(value) {
    if (value === null || value === undefined) return '';
    return value; // 0 或 []直接返回
}

function formatArray(value) {
    if (value === null || value === undefined) return [];
    return value;
}

function formatBoolValue(value) {
    if (value === null || value === undefined) return false;
    if (value === true || value === 'true') {
        return true;
    } else if (value === false || value === 'false') {
        return false;
    }
    return false;
}

function getValueProps(props, opts = {}) {
    const valueProps = {};
    const { keyname = 'value', defaultValue = '', format = noop } = opts;
    if ('value' in props) {
        valueProps[keyname] = format(props.value || defaultValue);
    }

    return valueProps;
}


function renderValue(value) {
    if (value === null || value === undefined) return null; // 空值直接返回
    if (Array.isArray(value)) { // 数组需要判断版本号返回
        const arrValue = value.map(valItem => <span className="multi-value-item">{valItem}</span>);

        return <div className="multi-value-item-wrapper">{arrValue}</div>;
    }

    return IS_REACT_GREATER_FITHTEEN ? value : <span className="multi-value-item">{value}</span>;
}

function renderOption(props = {}) { // 处理
    const value = formatValue(props.value); // 格式化值
    const arrValue = [].concat(value); // 处理多选, 如checkbox
    if (Array.isArray(props.dataSource) || Array.isArray(props.options)) { // dataSource模式
        const dataSource = props.dataSource || props.options;
        const hitLabel = [];
        dataSource.forEach((item) => {
            if (arrValue.indexOf(item.value) !== -1) {
                hitLabel.push(item.label);
            }
        });

        return renderValue(hitLabel);
    } else if (Array.isArray(props.children)) { // children模式
        const hitLabel = [];
        props.children.forEach((item) => {
            if (item.props && item.props.children && arrValue.indexOf(item.props.value) !== -1) {
                hitLabel.push(item.props.children);
            }
        });

        return renderValue(hitLabel);
    }
    return null;
}

const defaultFileUploadProps = {
    fileList: [],
    beforeUpload() { },
    onChange() { },
    onSuccess() { },
};

class WrapperClass {
    constructor(AntdSource) {
        this.Antd = AntdSource;
    }

    Input = (props) => {
        const { status, value } = props;
        const valueProps = getValueProps(props);

        if (status === 'preview') return renderValue(formatValue(value)); // 处理预览态
        return <this.Antd.Input {...props} {...valueProps} />;
    }

    Textarea = (props) => {
        const { status, value } = props;
        const valueProps = getValueProps(props);

        if (status === 'preview') return renderValue(formatValue(value)); // 处理预览态
        return <this.Antd.Input.TextArea {...props} {...valueProps} />;
    }

    Select = (props) => {
        const { className = '', value, children } = props;
        const { options, ...others } = props;
        const opts = {};
        if (options && Array.isArray(options) && !children) {
            opts.children = options.map((item) => {
                const { label, value: itemVal } = item;
                return <this.Antd.Select.Option value={itemVal}>{label}</this.Antd.Select.Option>;
            });
        }

        const valueProps = getValueProps(props);

        if (props.status === 'preview') return <this.Antd.Select placeholder="" {...props} disabled className={`${className || ''} ${prefix}-preview-select`} value={formatValue(value)} />;
        return <this.Antd.Select {...others} {...opts} {...valueProps} />;
    }

    CheckboxGroup = (props) => {
        const valueProps = getValueProps(props);

        if (props.status === 'preview') return renderOption(props);
        return <this.Antd.Checkbox.Group {...props} {...valueProps} />;
    }

    RadioGroup = (props) => {
        const valueProps = getValueProps(props);

        if (props.status === 'preview') return renderOption(props);
        return <this.Antd.Radio.Group {...props} {...valueProps} />;
    }

    Checkbox = (props) => {
        const valueProps = getValueProps(props, {
            format: formatBoolValue,
            keyname: 'checked',
        });

        if (props.status === 'preview') {
            const checked = formatBoolValue(props.value);
            if (props.children) { // 存在label
                return checked ? renderValue(props.children) : null;
            } // 不存在
            console.warn('label必须写在Checkbox内，如需编写外部label, 请使用suffix、prefix等熟悉'); // 给出警告
            return null;
        }

        const beforeChange = (e) => {
            const checkedVal = e.target.checked;
            const { onChange } = props;
            onChange && onChange(checkedVal);
        };

        return <this.Antd.Checkbox {...props} {...valueProps} onChange={beforeChange} />;
    }

    Radio = (props) => {
        const valueProps = getValueProps(props, {
            format: formatBoolValue,
            keyname: 'checked',
        });

        if (props.status === 'preview') {
            const checked = formatBoolValue(props.value);
            if (props.children) { // 存在label
                return checked ? renderValue(props.children) : null;
            } // 不存在
            console.warn('label必须写在Radio内，如需编写外部label, 请使用suffix、prefix等熟悉'); // 给出警告
            return null;
        }

        const beforeChange = (e) => {
            const checkedVal = e.target.checked;
            const { onChange } = props;
            onChange && onChange(checkedVal);
        };

        return <this.Antd.Radio {...props} {...valueProps} onChange={beforeChange} />;
    }

    Switch = (props) => {
        const valueProps = getValueProps(props, {
            format: formatBoolValue,
            keyname: 'checked',
        });

        if (props.status === 'preview') {
            const checked = formatBoolValue(props.value);
            if (props.checkedChildren || props.unCheckedChildren) { // 存在label
                const checkedStr = checked ? props.checkedChildren : props.unCheckedChildren;
                return renderValue(checkedStr);
            } // 不存在
            return renderValue(`${checked}`);
        }

        return <this.Antd.Switch {...props} {...valueProps} />;
    }

    Slider = (props) => {
        const { className = '', value } = props;
        const valueProps = getValueProps(props);

        if (props.status === 'preview') {
            return <this.Antd.Slider className={`${className || ''} ${prefix}-preview-slider`} {...props} disabled value={formatValue(value)} />;
        }

        return <this.Antd.Slider {...props} {...valueProps} />;
    }

    DatePicker = (props) => {
        const { className = '', value } = props;
        const valueProps = getValueProps(props);

        if (props.status === 'preview') {
            const placeholderClearer = {
                datePlaceholder: '',
                monthPlaceholder: '',
                yearPlaceholder: '',
                rangeStartPlaceholder: '',
                rangeEndPlaceholder: '',
            };

            return <this.Antd.DatePicker placeholder="" {...props} value={value} locale={placeholderClearer} disabled className={`${className || ''} ${prefix}-preview-datepicker`} />;
        }

        const onChange = (momentVal, formatDate) => {
            const { onChange } = props;
            onChange && onChange(momentVal, { escape: true });
        };

        return <this.Antd.DatePicker {...props} {...valueProps} onChange={onChange} />;
    }

    TimePicker = (props) => {
        const { className = '', value } = props;
        const valueProps = getValueProps(props);

        if (props.status === 'preview') {
            const placeholderClearer = {
                placeholder: '',
            };
            return <this.Antd.TimePicker placeholder="" {...props} value={value} locale={placeholderClearer} disabled className={`${className || ''} ${prefix}-preview-datepicker`} />;
        }

        const onChange = (momentVal, formatDate) => {
            const { onChange } = props;
            onChange && onChange(momentVal, { escape: true });
        };

        return <this.Antd.TimePicker {...props} {...valueProps} onChange={onChange} />;
    }

    InputNumber = (props) => {
        const { value } = props;
        const valueProps = getValueProps(props);

        if (props.status === 'preview') return renderValue(value); // 处理预览态

        return <this.Antd.InputNumber {...props} {...valueProps} />;
    }

    Rate = (props) => {
        const { value } = props;
        const valueProps = getValueProps(props);

        if (props.status === 'preview') {
            return <this.Antd.Rate {...props} disabled value={formatValue(value)} />;
        }

        return <this.Antd.Rate {...props} {...valueProps} />;
    }

    Cascader = (props) => {
        const { className = '', value } = props;
        const valueProps = getValueProps(props);
        if (props.status === 'preview') {
            return <this.Antd.Cascader placeholder="" {...props} className={`${className || ''} ${prefix}-preview-select`} disabled value={formatValue(value)} />;
        }
        return <this.Antd.Cascader {...props} {...valueProps} />;
    }

    TreeSelect = (props) => {
        const { className = '', value } = props;
        const valueProps = getValueProps(props);
        if (props.status === 'preview') {
            return <this.Antd.TreeSelect placeholder="" {...props} className={`${className || ''} ${prefix}-preview-select`} disabled value={formatValue(value)} />;
        }
        return <this.Antd.TreeSelect {...props} {...valueProps} />;
    }

    Upload = (props) => {
        const value = formatArray(props.value);
        const { name, ...others } = props;
        const { className = '' } = props;

        if (props.status === 'preview') {
            return <this.Antd.Upload {...defaultFileUploadProps} {...others} onChange={onChange} className={`${className || ''} ${prefix}-preview-upload`} disabled fileList={value} />;
        }

        const onChange = (origin) => {
            const { fileList = [] } = origin || {};
            props.onChange && props.onChange(fileList);
        };

        return <this.Antd.Upload {...defaultFileUploadProps} {...others} onChange={onChange} fileList={value} />;
    }

    AutoComplete = (props) => {
        const { className = '', value } = props;
        const { options, ...others } = props;
        const valueProps = getValueProps(props);

        const opts = {};
        if (options && Array.isArray(options) && !props.children) {
            opts.children = options.map((item) => {
                const { label, value } = item;
                return <this.Antd.AutoComplete.Option key={value}>{label}</this.Antd.AutoComplete.Option>;
            });
        }

        if (props.status === 'preview') return <this.Antd.AutoComplete placeholder="" {...props} disabled className={`${className || ''} ${prefix}-preview-select`} value={formatValue(value)} />;
        return <this.Antd.AutoComplete {...others} {...opts} {...valueProps} />;
    }

    Mention = (props) => {
        const { className = '' } = props;
        const { value, options, ...others } = props;
        const { toContentState, toString } = this.Antd.Mention;
        const valueProps = getValueProps(props, {
            format: v => (typeof v === 'string' ? toContentState(v || '') : v),
        });

        const opts = {};
        if (Array.isArray(options) && !('suggestions' in props)) {
            opts.suggestions = options;
        }

        const onChange = (val) => {
            const { onChange } = props;
            onChange && onChange(val, { escape: true });
        };

        if (props.status === 'preview') return <this.Antd.Mention placeholder="" {...opts} {...props} disabled className={`${className || ''} ${prefix}-preview-select`} value={formatValue(value)} />;
        return <this.Antd.Mention {...others} {...opts} {...valueProps} onChange={onChange} />;
    }

    format = () => {
        if (this.Antd.Select && this.Antd.Select.Option) this.Select.Option = this.Antd.Select.Option;
        if (this.Antd.TreeSelect) this.TreeSelect.Node = this.Antd.TreeSelect.Node;

        this.Checkbox.Group = this.CheckboxGroup;
        this.Radio.Group = this.RadioGroup;
        this.Input.Textarea = this.Textarea;

        return {
            ...this.Antd,
            Input: this.Input,
            Select: this.Select,
            Checkbox: this.Checkbox,
            Radio: this.Radio,
            AutoComplete: this.AutoComplete,
            Switch: this.Switch,
            Slider: this.Slider,
            DatePicker: this.DatePicker,
            TimePicker: this.TimePicker,
            InputNumber: this.InputNumber,
            Rate: this.Rate,
            Mention: this.Mention,
            Cascader: this.Cascader,
            TreeSelect: this.TreeSelect,
            Upload: this.Upload,
        };
    }
}

function wrapper(AntdSource) {
    const instance = new WrapperClass(AntdSource);
    return instance.format();
}

export default wrapper;

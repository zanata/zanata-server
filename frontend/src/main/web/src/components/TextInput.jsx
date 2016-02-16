import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import TextareaAutosize from 'react-textarea-autosize'
import { flattenClasses } from 'zanata-ui'

const classes = {
  base: {
    ap: 'Ap(n)',
    bgc: 'Bgc(t)',
    bdc: 'Bdc(neutral)',
    bdw: 'Bdw(2px)',
    bds: 'Bds(s)',
    bdrs: 'Bdrs(rq)',
    bxz: 'Bxz(bb)',
    c: 'C(i)',
    ff: 'Ff(inh)',
    fw: 'Fw(inh)',
    fz: 'Fz(inh)',
    fs: 'Fs(inh)',
    o: 'O(n)',
    p: 'Px(rh) Py(re)',
    ph: 'Ph(neutral)',
    focus: {
      bdc: 'Bdc(pri):f'
    }
  }
}

class TextInput extends Component {
  static propTypes = {
    accessibilityLabel: PropTypes.string,
    autoComplete: PropTypes.bool,
    autoFocus: PropTypes.bool,
    clearTextOnFocus: PropTypes.bool,
    defaultValue: PropTypes.string,
    editable: PropTypes.bool,
    keyboardType: PropTypes.oneOf(['default', 'email-address', 'numeric',
      'phone-pad', 'url']),
    maxLength: PropTypes.number,
    maxNumberOfLines: PropTypes.number,
    multiline: PropTypes.bool,
    numberOfLines: PropTypes.number,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onChangeText: PropTypes.func,
    onFocus: PropTypes.func,
    onSelectionChange: PropTypes.func,
    placeholder: PropTypes.string,
    placeholderTextColor: PropTypes.string,
    secureTextEntry: PropTypes.bool,
    selectTextOnFocus: PropTypes.bool,
    value: PropTypes.string
  };
  static defaultProps = {
    editable: true,
    keyboardType: 'default',
    multiline: false,
    numberOfLines: 2,
    secureTextEntry: false
  };
  _onBlur (e) {
    const { onBlur } = this.props
    if (onBlur) onBlur(e)
  }
  _onChange (e) {
    const { onChange, onChangeText } = this.props
    if (onChangeText) onChangeText(e.target.value)
    if (onChange) onChange(e)
  }
  _onFocus (e) {
    const { clearTextOnFocus, onFocus, selectTextOnFocus } = this.props
    const node = ReactDOM.findDOMNode(this)
    if (clearTextOnFocus) node.value = ''
    if (selectTextOnFocus) node.select()
    if (onFocus) onFocus(e)
  }
  _onSelectionChange (e) {
    const { onSelectionChange } = this.props
    const { selectionDirection, selectionEnd, selectionStart } = e.target
    const event = {
      selectionDirection,
      selectionEnd,
      selectionStart,
      nativeEvent: e.nativeEvent
    }
    if (onSelectionChange) onSelectionChange(event)
  }
  render () {
    const {
      accessibilityLabel,
      autoComplete,
      autoFocus,
      defaultValue,
      editable,
      keyboardType,
      maxLength,
      maxNumberOfLines,
      multiline,
      numberOfLines,
      onBlur,
      onChange,
      onChangeText,
      onSelectionChange,
      placeholder,
      secureTextEntry,
      theme,
      value
    } = this.props

    let type

    switch (keyboardType) {
      case 'email-address':
        type = 'email'
        break
      case 'numeric':
        type = 'number'
        break
      case 'phone-pad':
        type = 'tel'
        break
      case 'url':
        type = 'url'
        break
    }

    if (secureTextEntry) {
      type = 'password'
    }

    const propsCommon = {
      'aria-label': accessibilityLabel,
      autoComplete: autoComplete && 'on',
      autoFocus,
      className: flattenClasses(classes, theme),
      defaultValue,
      maxLength,
      onBlur: onBlur && this._onBlur.bind(this),
      onChange: (onChange || onChangeText) && this._onChange.bind(this),
      onFocus: this._onFocus.bind(this),
      onSelect: onSelectionChange && this._onSelectionChange.bind(this),
      placeholder,
      readOnly: !editable,
      value
    }

    const propsMultiline = {
      ...propsCommon,
      maxRows: maxNumberOfLines || numberOfLines,
      minRows: numberOfLines
    }

    const propsSingleline = {
      ...propsCommon,
      type
    }

    if (multiline) {
      return <TextareaAutosize {...propsMultiline} />
    } else {
      return <input {...propsSingleline} />
    }
  }
}

export default TextInput

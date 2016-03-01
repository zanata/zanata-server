import React, { Component, PropTypes } from 'react'
import { mergeClasses } from 'zanata-ui'
import {
  Row,
  TextInput
} from './'

const classes = {
  root: {
    w: 'W(100%)'
  },
  textInput: {},
  text: {
    base: {
      bd: 'Bd(bd2) Bdc(t)',
      c: 'Cur(t)',
      p: 'Px(rq) Py(re)',
      lineClamp: 'LineClamp(1,36px)',
      h: 'H(r1h)',
      w: 'W(100%)'
    },
    editable: {
      brds: 'Bdrs(rq)',
      trs: 'Trs(aeo)',
      hover: {
        bd: 'editable:h_Bd(bd2) editable:h_Bdc(neutral)'
      }
    },
    placeholder: {
      c: 'C(muted)'
    }
  }
}

class EditableText extends Component {
  render () {
    const {
      children,
      editable = false,
      editing = false,
      emptyReadOnlyText = '',
      placeholder = '',
      theme,
      ...props
    } = this.props
    const themed = mergeClasses(classes, theme)
    const textStateClasses = {
      base: mergeClasses(
        themed.text.base,
        editable && classes.text.editable,
        !children && classes.text.placeholder
      )
    }
    const emptyText = editable ? placeholder : emptyReadOnlyText
    const text = children || emptyText
    if (editable && editing) {
      return (
        <TextInput
          {...props}
          placeholder={placeholder}
          theme={classes.textInput}
          value={children} />
      )
    }
    return (
      <Row theme={textStateClasses} align='start'>
        {text}
      </Row>
    )
  }
}

EditableText.propTypes = {
  children: PropTypes.string.isRequired,
  editable: PropTypes.bool,
  editing: PropTypes.bool,
  placeholder: PropTypes.string
}

export default EditableText

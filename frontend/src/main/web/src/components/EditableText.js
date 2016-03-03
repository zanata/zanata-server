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
  textInput: {
    base: {
      ai: 'Ai(c)',
      bgc: 'Bgc(#fff)',
      h: 'H(r1h)',
      w: 'W(100%)'
    }
  },
  text: {
    base: {
      ai: 'Ai(c)',
      bd: 'Bd(bd2) Bdc(t)',
      c: 'Cur(t)',
      h: 'H(r1h)',
      lineClamp: 'LineClamp(1,36px)',
      p: 'Px(rq) Py(re)',
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
  constructor () {
    super()
    this.state = {
      focus: false
    }
  }
  handleClick () {
    this.setState({ focus: true })
  }
  handleBlur () {
    this.setState({ focus: false })
  }
  render () {
    const {
      children = '',
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
          autoFocus={this.state.focus}
          onBlur={::this.handleBlur}
          placeholder={placeholder}
          theme={classes.textInput}
          ref={(ref) => this.textInput = ref}
          defaultValue={children} />
      )
    }
    return (
      <Row theme={textStateClasses} align='start' onClick={::this.handleClick}>
        {text}
      </Row>
    )
  }
}

EditableText.propTypes = {
  children: PropTypes.string,
  editable: PropTypes.bool,
  editing: PropTypes.bool,
  placeholder: PropTypes.string
}

export default EditableText

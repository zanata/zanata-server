import React, { Component, PropTypes } from 'react'
import { mergeClasses, flattenClasses } from 'zanata-ui'
import TextInput from './'

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
      lineClamp: 'LineClamp(1,48px)',
      mih: 'Mih(r1h)',
      w: 'W(100%)'
    },
    editable: {
      hover: {
        bdrs: 'Bdrs(rq):h',
        bd: 'Bdc(neutral):h'
      }
    }
  }
}

class EditableText extends Component {
  render () {
    const {
      children,
      editable = true,
      editing = false
    } = this.props
    const textStateClasses = mergeClasses(
      classes.text.base,
      editable && classes.text.editable
    )
    return (
      <div className={flattenClasses(classes.root)}>
        {editable && editing
          ? (<TextInput theme={classes.textInput} value={children} />)
          : (<div className={flattenClasses(textStateClasses)}>
            {children}
          </div>)
        }
      </div>
    )
  }
}

EditableText.propTypes = {
  children: PropTypes.string.isRequired,
  editable: PropTypes.bool,
  editing: PropTypes.bool
}

export default EditableText

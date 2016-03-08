import React, { PropTypes } from 'react'
import { merge } from 'lodash'
import { Base } from '../'

const classes = {
  base: {
    whs: 'Whs(nw)',
    disabled: {
      cur: 'Cur(d):di',
      op: 'Op(.6):di',
      pe: 'Pe(n):di'
    }
  }
}

const Button = ({
  children,
  disabled,
  theme = {},
  ...props
}) => {
  const themed = merge({}, classes, theme)
  const themedState = merge({}, themed.base)
  return (
    <Base
      componentName='Button'
      {...props}
      tagName='button'
      disabled={disabled}
      theme={themedState}
    >
      {children}
    </Base>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  /**
   * Toggle whether the button is disabled or not
   */
  disabled: PropTypes.bool,
  /**
   * Used to override the default theme
   */
  theme: PropTypes.object
}

export default Button

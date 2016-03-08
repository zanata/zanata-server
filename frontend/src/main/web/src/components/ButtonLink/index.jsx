import React, { PropTypes } from 'react'
import { merge } from 'lodash'
import { Button } from '../'

const classes = {
  base: {
    c: 'C(pri)',
    trs: 'Trs(aeo)',
    hover: {
      filter: 'Brightness(.75):h'
    },
    focus: {
      filter: 'Brightness(.75):f'
    },
    active: {
      filter: 'Brightness(.5):a'
    }
  },
  default: {
    c: 'C(pri)'
  },
  primary: {
    c: 'C(pri)'
  },
  success: {
    c: 'C(success)'
  },
  unsure: {
    c: 'C(unsure)'
  },
  warning: {
    c: 'C(warning)'
  },
  danger: {
    c: 'C(danger)'
  },
  muted: {
    c: 'C(muted)'
  }
}

const ButtonLink = ({
  children,
  theme = {},
  type,
  ...props
}) => {
  const themed = merge({}, classes, theme)
  const themedState = {
    base: merge({}, themed.base, themed[type])
  }
  return (
    <Button
      {...props}
      componentName='ButtonLink'
      theme={themedState}
    >
      {children}
    </Button>
  )
}

ButtonLink.propTypes = {
  children: PropTypes.node,
  /**
   * Used to override the default theme.
   */
  theme: PropTypes.object,
  /**
   * The style of the link based on it's context or state.
   */
  type: PropTypes.oneOf(['default', 'primary', 'success', 'unsure',
    'warning', 'danger', 'muted'])
}

ButtonLink.defaultProps = {
  type: 'default'
}

export default ButtonLink

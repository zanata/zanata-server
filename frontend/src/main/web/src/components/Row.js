import React, { PropTypes } from 'react'
import warning from 'warning'
import { mergeClasses } from 'zanata-ui'
import { View } from './'

const classes = {
  base: {
    fld: 'Fld(r)!'
  },
  align: {
    start: {
      ai: 'Ai(fs)'
    },
    end: {
      ai: 'Ai(fe)'
    },
    center: {
      ai: 'Ai(c)'
    },
    baseline: {
      ai: 'Ai(b)'
    },
    stretch: {
      ai: 'Ai(st)'
    }
  }
}

const Row = ({
  align = 'center',
  children,
  className,
  theme = {},
  ...props
}) => {
  warning(!className,
    'Please use `theme` instead of `className` to style Row.')
  const themed = mergeClasses(
    classes,
    theme
  )
  const themeState = {
    base: mergeClasses(
      themed.base,
      themed.align[align]
    )
  }
  return (
    <View
      {...props}
      theme={themeState}>
      {children}
    </View>
  )
}

Row.propType = {
  align: PropTypes.oneOf(['start', 'end', 'center', 'baseline', 'stretch']),
  children: PropTypes.node,
  className: PropTypes.string,
  theme: PropTypes.object
}

export default Row

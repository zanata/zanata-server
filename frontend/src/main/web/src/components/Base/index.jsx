import React, { PropTypes } from 'react'
import { values, merge } from 'lodash'
import warning from 'warning'
import flattenObj from 'flat'

const flattenThemeClasses = (base, ...otherClasses) => {
  return values(
    flattenObj(merge({}, base, ...otherClasses))
  ).join(' ').trim()
}

const Base = ({
  atomic = {},
  children,
  className,
  tagName,
  componentName,
  theme = {},
  ...props
}) => {
  const Component = tagName || 'div'
  const classes = flattenThemeClasses(theme, atomic)
  warning(!className,
    'Please use `theme` instead of `className` to style `' +
    componentName + '` with `' + className + '`.')
  return (
    <Component
      {...props}
      className={classes}
    >
      {children}
    </Component>
  )
}

Base.propTypes = {
  /**
   * An object of [atomic classes](acss.io/reference) that override any theme
   * based classes. This is useful for one of styles like margin or padding.
   */
  atomic: PropTypes.object,
  children: PropTypes.node,
  /**
   * This should not be used.
   * Prefer theme or [atomic classes](acss.io/reference) object over classes.
   * @type {[type]}
   */
  className: PropTypes.string,
  /**
   * The system name for the component.
   * Used for warnings and references.
   */
  componentName: PropTypes.string.isRequired,
  /**
  * HTML element string or React component to render.
  */
  tagName: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.element
  ]),
  /**
   * Based on an [atomic classes](acss.io/reference) object.
   * This should be merged to a single object before it is passed
   * into the base component.
   * Each component can have it's own structure for it's theme object.
   */
  theme: PropTypes.object
}

export default Base

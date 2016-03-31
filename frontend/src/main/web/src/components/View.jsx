import React, { PropTypes } from 'react' // eslint-disable-line
import { flattenThemeClasses } from '../utils/styleUtils'

const classes = {
  base: {
    ai: 'Ai(st)',
    d: 'D(f)',
    fld: 'Fld(c)',
    flxs: 'Flxs(0)'
  }
}

const View = ({
  name,
  items,
  children,
  theme,
  ...props
}) => (
  <div
    className={flattenThemeClasses(classes, theme)}
    {...props}
  >
    { children }
  </div>
)

export default View

import React, { PropTypes } from 'react' // eslint-disable-line
import { flattenClasses } from '../utils/styleUtils'

const classes = {
  base: {
    ai: 'Ai(st)',
    d: 'D(f)',
    fld: 'Fld(c)',
    flxs: 'Flxs(0)'
  }
}

const View = ({
  items,
  children,
  theme,
  ...props
}) => (
  <div
    className={flattenClasses(classes, theme)}
    {...props}
  >
    { children }
  </div>
)

export default View

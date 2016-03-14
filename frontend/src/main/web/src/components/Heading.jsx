import React from 'react' // eslint-disable-line
import { flattenThemeClasses } from './Base'

const Heading = ({
  children,
  level,
  theme,
  ...props
}) => {
  const classes = {
    base: {
      c: 'C(pri)',
      m: 'M(0)',
      fz: 'Fz(ms0)',
      fw: 'Fw(i)',
      lh: 'Lh(1)'
    }
  }
  const headingClasses = flattenThemeClasses(classes, theme)
  return (<h1 {...props} className={headingClasses} >
    {children}
  </h1>)
}

export default Heading

import React from 'react' // eslint-disable-line
import { flattenThemeClasses } from '../utils/styleUtils'
import { Link as RouterLink } from 'react-router'

const classes = {
  base: {
    c: 'C(pri)',
    td: 'Td(n)',
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
  }
}

const Link = ({
  id,
  children,
  theme,
  link,
  useHref,
  ...props
}) => {
  if (useHref) {
    return (
      <a href={link} id={id}
        className={flattenThemeClasses(classes, theme)} {...props}>
        {children}
      </a>
    )
  }
  return (
    <RouterLink
      id={id}
      to={link}
      className={flattenThemeClasses(classes, theme)}
      {...props}
    >
      {children}
    </RouterLink>
  )
}

export default Link

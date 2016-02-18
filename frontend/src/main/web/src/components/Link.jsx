import React from 'react' // eslint-disable-line
import { flattenClasses } from 'zanata-ui'
import { Link as RouterLink } from 'react-router'

const classes = {
  base: {
    bgc: 'Bgc(i)',
    c: 'C(pri)',
    cur: 'Cur(p)',
    fz: 'Fz(i)',
    td: 'Td(n)',
    hover: {
      td: 'Td(u):h'
    }
  }
}

const Link = ({
  children,
  theme,
  link,
  useHref,
  ...props
}) => {
  if(useHref) {
   return (
     <a href={link} className={flattenClasses(classes, theme)} {...props}>
       {children}
     </a>
   )
  }
  return (
  <RouterLink
    to={link}
    className={flattenClasses(classes, theme)}
    {...props}
  >
    {children}
  </RouterLink>
)}

export default Link

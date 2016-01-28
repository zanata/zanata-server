import React, { PropTypes } from 'react'
import { flattenClasses } from '../utils/styleUtils'

const classes = {
  base: {
    d: 'D(ib)',
    pos: 'Pos(r)'
  }
}

const Icon = ({
  size = '0',
  theme,
  name,
  ...props
}) => {
  const sizeClasses = {
    base: {
      w: `W(ms${size})`,
      h: `H(ms${size})`
    }
  }
  const svgIcon = `<use xlink:href="#Icon-${name}" />`
  return (
    <span
      className={flattenClasses(classes, sizeClasses, theme)}
      {...props}
    >
      <svg
        dangerouslySetInnerHTML={{ __html: svgIcon }}
        className='Pos(a) StretchedBox Mah(100%) Maw(100%) Fill(cc)'
      />
    </span>
  )
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.string,
  theme: PropTypes.object
}

export default Icon

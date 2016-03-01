import React, { PropTypes } from 'react'
import { mergeClasses } from 'zanata-ui'
import { Row } from './'

const classes = {
  base: {
    bd: 'Bdb(bd1) Bdc(light)',
    h: 'H(r2)'
  },
  highlight: {
    trs: 'Trs(aeo)',
    hover: {
      bgc: 'Bgc(light):h'
    }
  }
}

const TableRow = ({
  children,
  className,
  highlight = false,
  theme = {},
  ...props
}) => {
  const themed = mergeClasses(
    classes,
    theme
  )
  const themedState = {
    base: mergeClasses(
      themed.base,
      highlight && classes.highlight,
      className && { classes: className }
    )
  }
  return (
    <Row
      {...props}
      theme={themedState}>
      {children}
    </Row>
  )
}

TableRow.propType = {
  children: PropTypes.node,
  highlight: PropTypes.bool
}

export default TableRow

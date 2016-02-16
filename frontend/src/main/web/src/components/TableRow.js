import React, { PropTypes } from 'react'
import { mergeClasses } from 'zanata-ui'
import { View } from './'

const theme = {
  base: {
    bd: 'Bdb(bd1) Bdc(light)',
    fld: '',
    h: 'H(r2)',
    hover: {
      bgc: 'Bgc(light):h'
    }
  }
}

const TableRow = ({
  children,
  className,
  ...props
}) => {
  const themeState = {
    base: mergeClasses(
      theme.base,
      className && { classes: className }
    )
  }
  console.log(View)
  return (
    <View
      {...props}
      theme={themeState}>
      {children}
    </View>
  )
}

TableRow.propType = {
  children: PropTypes.node
}

export default TableRow

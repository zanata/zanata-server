import React from 'react' // eslint-disable-line
import { mergeClasses } from 'zanata-ui'
import { View } from './'

const classes = {
  base: {
    flxs: '',
    flx: 'Flx(flx1)',
    ov: 'Ov(h)'
  }
}

const Page = ({
  children,
  theme,
  ...props
}) => {
  return (
    <View theme={mergeClasses(classes, theme)} {...props}>
      {children}
    </View>
  )
}

export default Page

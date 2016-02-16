import React from 'react' // eslint-disable-line
import { mergeClasses } from 'zanata-ui'
import { View } from './'

const ScrollView = ({
  children,
  theme,
  ...props
}) => {
  const classes = {
    base: {
      flxs: '',
      flxg: 'Flxg(1)',
      ov: 'Ov(a)',
      ovh: 'Ovx(h)',
      ovs: 'Ovs(touch)'
    }
  }
  return (
    <View {...props} theme={mergeClasses(classes, theme)}>
      <View theme={{
        base: {
          flxg: 'Flxg(1)',
          p: 'Py(r1) Px(rh) Px(r1)--sm',
          pos: 'Pos(r)',
          w: 'W(100%)'
        }
      }}>
        {children}
      </View>
    </View>
  )
}

export default ScrollView

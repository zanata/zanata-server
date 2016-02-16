import React from 'react' // eslint-disable-line
import { Icon, mergeClasses } from 'zanata-ui'
import { View, Heading, Link } from './'

const wrapperTheme = {
  base: {
    bxsh: 'Bxsh(shw)',
    p: 'Py(rq) Px(rh) P(r1)--sm',
    pos: 'Pos(r)'
  }
}
const innerViewTheme = {
  base: {
    ai: 'Ai(c)',
    fld: '',
    pos: 'Pos(r)'
  }
}
const logoLinkTheme = {
  base: {
    bd: '',
    d: 'D(n)--sm',
    lh: 'Lh(1)',
    m: 'Mend(rh)'
  }
}
const headingTheme = {
  base: {
    fz: 'Fz(ms1) Fz(ms2)--sm'
  }
}
const headerActionsTheme = {
  base: {
    ai: 'Ai(c)',
    fld: '',
    m: 'Mstart(a)'
  }
}
const searchLinkTheme = {
  base: {
    bd: '',
    c: 'C(pri)',
    d: 'D(n)--sm',
    h: 'H(ms1)',
    m: 'Mstart(rh)',
    w: 'W(ms1)',
    hover: {
      bd: ''
    }
  }
}

const Header = ({
  children,
  theme,
  title,
  extraElements,
  ...props
}) => {
  return (
    <View theme={mergeClasses(wrapperTheme, theme)}>
      <View theme={innerViewTheme}>
        <Link link='/' theme={logoLinkTheme}>
          <Icon name='zanata' size='3' />
        </Link>
        <Heading level='1' theme={headingTheme}>
          {title || 'Title'}
        </Heading>
        <View theme={headerActionsTheme}>
          {extraElements}
          <Link link='search' theme={searchLinkTheme}>
            <span className='Hidden'>Search</span>
            <Icon name='search' size='1' />
          </Link>
        </View>
      </View>
      {children ? (
        <View theme={innerViewTheme}>
          {children}
        </View>
      ) : undefined}
    </View>
  )
}

export default Header

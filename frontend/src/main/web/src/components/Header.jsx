import React from 'react' // eslint-disable-line
import { mergeClasses, flattenClasses } from 'zanata-ui'
import {
  Icon
} from './'
import { View, Heading, Link } from './'

const wrapperTheme = {
  base: {
    // Adjust right position for scrollbar
    end: 'End(1rem)',
    p: 'Px(rh) Px(r1)--sm',
    pos: 'Pos(f)',
    start: 'Start(0) Start(r3)--sm',
    z: 'Z(100)'
  }
}
const baseClasses = {
  base: {
    bd: 'Bdb(bd2) Bdbc(light)',
    bgc: 'Bgc(#fff)',
    p: 'Pt(rq) Pt(r1)--sm'
  }
}
const innerViewTheme = {
  base: {
    ai: 'Ai(c)',
    fld: ''
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
      <div className={flattenClasses(baseClasses)}>
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
      </div>
    </View>
  )
}

export default Header

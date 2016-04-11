import React from 'react' // eslint-disable-line
import Link from '../components/Link'
import View from '../components/View'
import Icon from '../components/Icon'
// import { flattenClasses } from '../utils'

const viewTheme = {
  base: {
    ai: 'Ai(c)',
    fld: '',
    m: 'Mb(rh)'
  }
}

const LanguageTeamTeaser = ({
  children,
  name,
  details,
  ...props
}) => {
  const useHref = true
  const link = useHref
    ? window.config.baseUrl + '/language/view/' + details.id
    : 'language/' + details.id

  return (
    <View theme={viewTheme} name={name}>
      <View theme={{ base: {fld: 'Fld(r)'} }}>
        <Link link={link} useHref={useHref}
          theme={{ base: { fw: 'Fw(600)' } }}>
          {details.locale}
        </Link>
        <span className='C(muted) Mstart(rq)'>
          {details.id}
        </span>
      </View>
      <View theme={{ base: { ai: 'Ai(c)', fld: '', m: 'Mstart(a)' } }} >
        <Icon name='users'
          theme={{
            base: {
              c: 'C(muted)',
              m: 'Mend(rq) Mstart(rh)'
            }
          }}
        />
      {details.memberCount}
      </View>
    </View>
  )
}

export default LanguageTeamTeaser

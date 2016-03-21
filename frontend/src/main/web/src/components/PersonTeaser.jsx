import React from 'react' // eslint-disable-line
import Link from '../components/Link'
import View from '../components/View'
import Icon from '../components/Icon'

const viewTheme = {
  base: {
    ai: 'Ai(c)',
    fld: '',
    m: 'Mb(rh)'
  }
}

const UserTeaser = ({
  children,
  details,
  ...props
}) => {
  const wordsTranslated = details.wordsTranslated
    ? (
      <View
        theme={{ base: { ai: 'Ai(c)', fld: '', m: 'Mstart(a)' } }}
         >
        <Icon name='translate'
          theme={{
            base: {
              c: 'C(muted)',
              m: 'Mend(rq) Mstart(rh)'
            }
          }}
        />
        {details.wordsTranslated}
      </View>
    )
    : undefined
  return (
    <View theme={viewTheme}>
      <View theme={{ base: {ai: 'Ai(c)', fld: 'Fld(r)'} }}>
        <img
          src={details.avatarUrl}
          alt={details.id}
          className='Bdrs(rnd) Mend(rq) W(r1h) H(r1h)'
        />
        <Link to={details.id}
          theme={{ base: { fw: 'Fw(600)' } }}>
          {details.description}
        </Link>
      </View>
      {wordsTranslated}
    </View>
  )
}

export default UserTeaser

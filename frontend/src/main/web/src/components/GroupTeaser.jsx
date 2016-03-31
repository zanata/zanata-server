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

const GroupTeaser = ({
  details,
  name,
  children,
  ...props
}) => {
  const description = details.description ? (
      <div className={'C(muted)'}>
        {details.description}
      </div>
    )
    : (
      <div className={'C(muted) Fs(i)'}>
        No description available
      </div>
    )
  const metaData = details.owner ? (
    <View
      theme={{
        base: {
          ai: 'Ai(c)',
          fld: '',
          fz: 'Fz(msn1)',
          m: 'Mstart(a)--md'
        }
      }}>
      <Icon
        name='user'
        size='n1'
        theme={{ base: { c: 'C(muted)', m: 'Mend(rq)' } }}/>
      <Link to={details.owner}>{details.owner}</Link>
      <Icon
        name='users'
        size='n1'
        theme={{
          base: {
            c: 'C(muted)',
            m: 'Mend(rq) Mstart(rh)'
          }
        }}
      />
    </View>
  ) : undefined
  const useHref = true
  const link = useHref
    ? window.config.baseUrl + '/version-group/view/' + details.id
    : 'groups/' + details.id
  return (
    <View theme={viewTheme} name={name}>
      {/* <View className='Mend(rh)'>
        TODO: Statistics Donut here
      </View> */}
      <View theme={{ base: { fld: 'Fld(c) Fld(r)--md', flx: 'Flx(flx1)' } }}>
        <View>
          <Link link={link} useHref={useHref}
            theme={{ base: { fw: 'Fw(600)' } }}>
            {details.title}
          </Link>
          {description}
        </View>
        {metaData}
      </View>
    </View>
  )
}

export default GroupTeaser

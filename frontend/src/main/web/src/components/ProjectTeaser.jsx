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

const statusIcons = {
  ACTIVE: '',
  READONLY: 'locked'
}

const ProjectTeaser = ({
  details,
  name,
  children,
  ...props
}) => {
  const status = statusIcons[details.status]
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
  const metaData = details.owner && (
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
      <Link
        to={details.owner + '/' + details.id + '/people'}>
        {details.contributorCount}
      </Link>
    </View>
  )
  const useHref = true
  const link = useHref
    ? window.config.baseUrl + '/project/view/' + details.id
    : 'projects/' + details.id
  const theme = status !== statusIcons.ACTIVE
    ? { base: { fw: 'Fw(600)', c: 'C(muted)' } }
    : { base: { fw: 'Fw(600)' } }
  const tooltip = status !== statusIcons.ACTIVE
    ? 'This project is currently read only'
    : ''
  return (
    <View theme={viewTheme} name={name}>
      {/* <View className='Mend(rh)'>
        TODO: Statistics Donut here
      </View> */}
      <View theme={{ base: { fld: 'Fld(c) Fld(r)--md', flx: 'Flx(flx1)' } }}>
        <View>
          <Link link={link} useHref={useHref} theme={theme} title={tooltip}>
            {status !== statusIcons.ACTIVE &&
            (<Icon name={statusIcons[details.status]} size='1'
              theme={{ base: { m: 'Mend(rq)' } }}/>)}
            {details.title}
          </Link>
          {description}
        </View>
        {metaData}
      </View>
    </View>
  )
}

export default ProjectTeaser

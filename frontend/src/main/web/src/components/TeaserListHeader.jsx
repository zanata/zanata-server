import React from 'react' // eslint-disable-line
import View from '../components/View'
import Heading from '../components/Heading'
import Icon from '../components/Icon'
// import { flattenClasses } from '../utils'

const TeaserListHeader = ({
  children,
  title,
  type,
  showFilter,
  ...props
}) => {
  const viewTheme = {
    base: {
      fld: ''
    }
  }
  const icons = {
    Project: 'project',
    LanguageTeam: 'language',
    Person: 'user',
    Group: 'folder'
  }
  const headerTitle = showFilter ? 'Most Active ' + title : title
  const headerIcon = type
    ? <Icon name={icons[type]} theme={{ base: { m: 'Mend(rq)' } }}/> : null
  return (
    <View theme={viewTheme}>
      {headerIcon}
      <Heading
        level='2'
        theme={{ base: { c: 'C(dark)', tt: 'Tt(u)' } }}
      >
        {headerTitle}
      </Heading>
      {showFilter ? (
        <span select className='Lh(1) Tt(u) Mstart(rq) C(pri) D(f) Ai(c)'>
          This Week <Icon name='chevron-down' />
        </span>
      ) : undefined}
    </View>
  )
}

export default TeaserListHeader

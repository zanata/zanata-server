import React from 'react' // eslint-disable-line
import { View } from '../../components'
import TeaserListHeader from './TeaserListHeader'
import ProjectTeaser from './ProjectTeaser'
import GroupTeaser from './GroupTeaser'
import LanguageTeamTeaser from './LanguageTeamTeaser'
import PersonTeaser from './PersonTeaser'

const TeaserList = ({
  children,
  title,
  totalCount,
  items,
  type,
  sizePerPage,
  page,
  updatePage,
  loading,
  ...props
}) => {
  let TeaserComponent
  const teaserListTheme = {
    base: {
      m: 'Mb(r1h)'
    }
  }
  const listTheme = {
    base: {
      m: 'Mt(r1)'
    }
  }
  switch (type) {
    case 'Project':
      TeaserComponent = ProjectTeaser
      break
    case 'LanguageTeam':
      TeaserComponent = LanguageTeamTeaser
      break
    case 'Person':
      TeaserComponent = PersonTeaser
      break
    case 'Group':
      TeaserComponent = GroupTeaser
      break
    default:
      TeaserComponent = () => (<div>Teaser</div>)
      break
  }

  return (
    <View theme={teaserListTheme}>
      <TeaserListHeader title={title} type={type}
        sizePerPage={sizePerPage} page={page}
        totalCount={totalCount} updatePage={updatePage} loading={loading}/>
      <View theme={listTheme} id={'explore_' + type + '_result'}>
        {!items || items.length <= 0
          ? (<p className={'C(muted)'}>No Results</p>)
          : (items.map((item, key) => (
            <TeaserComponent details={item} key={key} name='entry'/>
        )))
        }
      </View>
    </View>
  )
}

export default TeaserList

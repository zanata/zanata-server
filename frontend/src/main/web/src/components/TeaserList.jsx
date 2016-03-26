import React from 'react' // eslint-disable-line
import View from '../components/View'
import TeaserListHeader from '../components/TeaserListHeader'
import ProjectTeaser from '../components/ProjectTeaser'
import GroupTeaser from '../components/GroupTeaser'
import LanguageTeamTeaser from '../components/LanguageTeamTeaser'
import PersonTeaser from '../components/PersonTeaser'

const TeaserList = ({
  children,
  title,
  totalCount,
  items,
  type,
  filterable,
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
  return (items.length > 0) ? (
    <View theme={teaserListTheme}>
      <TeaserListHeader title={title} type={type} showFilter={filterable} totalCount={totalCount}/>
      <View theme={listTheme}>
        {items.map((item, key) => (
          <TeaserComponent details={item} key={key}/>
        ))}
      </View>
    </View>
  ) : null
}

export default TeaserList

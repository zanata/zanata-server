import React from 'react' // eslint-disable-line
import View from '../components/View'
import TeaserListHeader from '../components/TeaserListHeader'
import ProjectTeaser from '../components/ProjectTeaser'
import LanguageTeamTeaser from '../components/LanguageTeamTeaser'
import PersonTeaser from '../components/PersonTeaser'
// import { flattenClasses } from '../utils'

const TeaserList = ({
  children,
  title,
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
    case 'project':
      TeaserComponent = ProjectTeaser
      break
    case 'languageTeam':
      TeaserComponent = LanguageTeamTeaser
      break
    case 'person':
      TeaserComponent = PersonTeaser
      break
    default:
      TeaserComponent = () => (<div>Teaser</div>)
      break
  }
  return (items.length > 0) ? (
    <View theme={teaserListTheme}>
      <TeaserListHeader title={title} type={type} showFilter={filterable}/>
      <View theme={listTheme}>
        {items.map((item, key) => (
          <TeaserComponent details={item} key={key}/>
        ))}
      </View>
    </View>
  ) : null
}

export default TeaserList

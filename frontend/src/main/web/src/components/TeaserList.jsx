import React from 'react' // eslint-disable-line
import { View, LoaderText } from '../components'
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
        totalCount={totalCount} updatePage={updatePage}/>
      <View theme={listTheme}>
        {loading
          ? (<LoaderText theme={{ base: { fz: 'Fz(ms1)' } }} size='1' loading/>)
          : items.length <= 0
          ? (<p className={'C(muted)'}>No Results</p>)
          : (items.map((item, key) => (
            <TeaserComponent details={item} key={key}/>
        )))
        }
      </View>
    </View>
  )
}

export default TeaserList

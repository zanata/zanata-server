import React, { Component } from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { isEmpty, debounce } from 'lodash'
import {
  Base,
  Page,
  ScrollView,
  View,
  Heading,
  Icon,
  Button,
  TextInput,
  TeaserList,
  LoaderText
} from '../../components'
import {
  searchTextChanged,
  searchPageLoaded,
  updateSearchPage,
  SIZE_PER_PAGE
} from '../../actions/explore'

const headerClasses = {
  ai: 'Ai(c)',
  bxsh: 'Bxsh(shw)',
  bxz: 'Bxz(cb)', // For chrome bug that doesn't keep height of container
  d: 'D(f)',
  fz: 'Fz(ms1)--md',
  jc: 'Jc(c)',
  p: 'Py(rq) Px(rh) P(r1)--sm',
  pos: 'Pos(r)'
}
const headingTheme = {
  base: {
    hidden: 'Hidden'
  }
}
const searchViewTheme = {
  base: {
    ai: 'Ai(c)',
    c: 'C(dark)',
    fld: '',
    pos: 'Pos(r)',
    maw: 'Maw(r32)',
    w: 'W(100%)'
  }
}
const iconClasses = {
  ai: 'Ai(c)',
  c: 'C(neutral)',
  fz: 'Fz(ms1) Fz(ms2)--sm',
  jc: 'Jc(c)',
  h: 'H(100%)',
  l: 'Start(rq) Start(rh)--md',
  m: 'Mstart(re) Mstart(0)--md',
  pos: 'Pos(a)',
  t: 'T(0)',
  ta: 'Ta(c)',
  w: 'W(ms1) W(ms2)--md'
}
const inputTheme = {
  base: {
    bdrs: 'Bdrs(rnd)',
    p: 'Py(rq) Py(rh)--md Pstart(r1q) Pstart(r1h)--md Pend(rq)',
    w: 'W(100%)'
  }
}
const buttonTheme = {
  base: {
    c: 'C(pri)',
    m: 'Mstart(rq)'
  }
}
const scrollViewTheme = {
  base: {
    ai: 'Ai(c)'
  }
}
const contentViewContainerTheme = {
  base: {
    maw: 'Maw(r32)',
    m: 'Mx(a)',
    w: 'W(100%)'
  }
}

class Explore extends Component {
  componentWillMount () {
    this.props.handleSearchPageLoad()
  }

  handleKeyDown (e) {
    if (e.key === 'Escape') {
      this.props.handleSearchCancelClick()
    }
  }

  render () {
    const {
      handleSearchCancelClick,
      handleSearchTextChange,
      handleUpdateSearchPage,
      searchText,
      projectPage,
      groupPage,
      personPage,
      languageTeamPage,
      searchResults,
      searchError,
      searchLoading,
      ...props
    } = this.props

    let content
    if (searchError) {
      content = (<p>Error completing search for "{searchText}".<br/>
                    {searchResults.message}. Please try again.</p>)
    } else {
      const projectContent = (<TeaserList
        loading={isEmpty(searchResults) && searchLoading['Project']}
        items={searchResults['Project']
            ? searchResults['Project'].results : []}
        title='Projects'
        totalCount={searchResults['Project']
            ? searchResults['Project'].totalCount : 0}
        type='Project'
        key='Project'
        sizePerPage={SIZE_PER_PAGE}
        updatePage={handleUpdateSearchPage}
        page={projectPage}/>)

      const groupContent = (<TeaserList
        loading={isEmpty(searchResults) && searchLoading['Group']}
        items={searchResults['Group']
            ? searchResults['Group'].results : []}
        title='Groups'
        totalCount={searchResults['Group']
            ? searchResults['Group'].totalCount : 0}
        type='Group'
        key='Group'
        sizePerPage={SIZE_PER_PAGE}
        updatePage={handleUpdateSearchPage}
        page={groupPage}/>)

      const personContent = searchText &&
        (<TeaserList
          loading={isEmpty(searchResults) && searchLoading['Person']}
          items={searchResults['Person']
            ? searchResults['Person'].results : []}
          title='People'
          totalCount={searchResults['Person']
            ? searchResults['Person'].totalCount : 0}
          type='Person'
          key='Person'
          sizePerPage={SIZE_PER_PAGE}
          updatePage={handleUpdateSearchPage}
          page={personPage}/>)

      const languageTeamContent = searchText &&
        (<TeaserList
          loading={isEmpty(searchResults) && searchLoading['LanguageTeam']}
          items={searchResults['LanguageTeam']
            ? searchResults['LanguageTeam'].results : []}
          title='Language Teams'
          totalCount={searchResults['LanguageTeam']
            ? searchResults['LanguageTeam'].totalCount : 0}
          type='LanguageTeam'
          key='LanguageTeam'
          sizePerPage={SIZE_PER_PAGE}
          updatePage={handleUpdateSearchPage}
          page={languageTeamPage}/>)

      content = (
        <div>
            {projectContent}
            {personContent}
            {languageTeamContent}
            {groupContent}
        </div>)
    }
    return (
      <Page>
        <Helmet title='Search' />
        <Base tagName='header' theme={headerClasses}>
          <Heading level='1' theme={headingTheme}>Search</Heading>
          <View theme={searchViewTheme}>
            <Icon name='search' atomic={iconClasses}/>
            <TextInput
              autoFocus
              id='explore_search'
              type='search'
              placeholder='Search Zanata…'
              accessibilityLabel='Search Zanata'
              theme={inputTheme}
              value={searchText}
              onKeyDown={(e) => { this.handleKeyDown(e) }}
              onChange={handleSearchTextChange}
            />
            <Button
              theme={buttonTheme}
              onClick={handleSearchCancelClick}>
            Cancel
            </Button>
          </View>
        </Base>
        <ScrollView theme={scrollViewTheme}>
          <View theme={contentViewContainerTheme}>
            {content}
          </View>
        </ScrollView>
      </Page>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    location: state.routing.location,
    searchText: state.routing.location.query.q,
    projectPage: state.routing.location.query.projectPage,
    groupPage: state.routing.location.query.groupPage,
    personPage: state.routing.location.query.personPage,
    languageTeamPage: state.routing.location.query.languageTeamPage,
    searchResults: state.explore.results,
    searchError: state.explore.error,
    searchLoading: state.explore.loading
  }
}

const mapDispatchToProps = (dispatch) => {
  const updateSearchText = debounce((val) =>
    dispatch(searchTextChanged(val)), 200)

  return {
    handleSearchCancelClick: () => {
      dispatch(searchTextChanged(''))
    },
    handleSearchTextChange: (event) => {
      updateSearchText(event.target.value || '')
    },
    handleSearchPageLoad: () => {
      dispatch(searchPageLoaded())
    },
    handleUpdateSearchPage: (type, currentPage, totalPage, next) => {
      dispatch(updateSearchPage(type, currentPage, totalPage, next))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Explore)

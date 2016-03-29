import React, { Component } from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'
import { isEmpty, flatMap } from 'lodash'
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
  searchPageLoaded
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

const titles = {
  Project: 'Projects',
  LanguageTeam: 'Language Teams',
  Person: 'People',
  Group: 'Groups'
}

class Explore extends Component {
  componentWillMount () {
    this.props.handleSearchPageLoad()
  }

  render () {
    const {
      handleSearchCancelClick,
      handleSearchTextChange,
      searchText,
      searchResults,
      searchError,
      searchLoading,
      ...props
    } = this.props
    const emptyResults = isEmpty(searchResults) ||
      isEmpty(flatMap(searchResults, 'results'))
    return (
      <Page>
        <Helmet title='Search' />
        <Base tagName='header' theme={headerClasses}>
          <Heading level='1' theme={headingTheme}>Search</Heading>
          <View theme={searchViewTheme}>
            <Icon name='search' atomic={iconClasses}/>
            <TextInput
              autoFocus
              type='search'
              placeholder='Search Zanata…'
              accessibilityLabel='Search Zanata'
              theme={inputTheme}
              value={searchText}
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
            {emptyResults
              ? searchError
                  ? (<p>
                      Error completing search for "{searchText}".<br/>
                    {searchResults.message}. Please try again.
                  </p>)
                  : (<p>No Results</p>)
              : Object.keys(searchResults).map((type, key) =>
                {
                  return searchLoading[type]
                    ? (<LoaderText theme={{ base: { fz: 'Fz(ms1)' } }}
                        size='1' loading/>)
                    : searchResults[type].totalCount > 0
                      ? (<TeaserList
                          items={searchResults[type].results}
                          title={titles[type]}
                          totalCount={searchResults[type].totalCount}
                          type={type}
                          key={key}
                          filterable={!searchText}/>
                      )
                  : null }
              )
            }
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
    searchResults: state.explore.results,
    searchError: state.explore.error,
    searchLoading: state.explore.loading
  }
}

const mapDispatchToProps = (dispatch, {
  history
}) => {
  return {
    handleSearchCancelClick: () => {
      dispatch(searchTextChanged(''))
    },
    handleSearchTextChange: (event) => {
      dispatch(searchTextChanged(event.target.value))
    },
    handleSearchPageLoad: () => {
      dispatch(searchPageLoaded())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Explore)

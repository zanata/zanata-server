import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { LoaderText } from 'zanata-ui'
import { debounce } from 'lodash'
import { replaceRouteQuery } from '../../utils/RoutingHelpers'
import {
  Page,
  Row,
  ScrollView,
  View
} from '../../components'
import {
  glossaryUpdateIndex,
  glossaryGetTermsIfNeeded,
} from '../../actions/glossary'
import ViewHeader from './ViewHeader'

const loadingContainerTheme = {
  base: {
    ai: 'Ai(c)',
    flxg: 'Flxg(1)',
    jc: 'Jc(c)',
    w: 'W(100%)'
  }
}

class Glossary extends Component {
  constructor () {
    super()
    // Need to add the debounce to onScroll here
    // So it creates a new debounce for each instance
    this.onScroll = debounce(this.onScroll, 100)
  }

  onScroll () {
    // Debounced by 100ms in super()
    if (!this.list) return

    console.info(this.list)
    const {
      dispatch,
      location
    } = this.props
    const loadingThreshold = 250
    const indexRange = this.list.getVisibleRange()
    const newIndex = indexRange[0]
    const newIndexEnd = indexRange[1]
    replaceRouteQuery(location, {
      index: newIndex
    })
    dispatch(glossaryUpdateIndex(newIndex))
    dispatch(glossaryGetTermsIfNeeded(newIndex))
    // If close enough, load the prev/next page too
    dispatch(glossaryGetTermsIfNeeded(newIndex - loadingThreshold))
    dispatch(glossaryGetTermsIfNeeded(newIndexEnd + loadingThreshold))
  }

  render () {
    const {
      termsLoading,
      termCount,
      scrollIndex = 0
    } = this.props
    return (
      <Page>
        <Helmet title='Glossary' />
        <ScrollView onScroll={::this.onScroll}>
          <ViewHeader />
          <View theme={{ base: {p: 'Pt(r6) Pb(r2)'} }}>
            { termsLoading && !termCount
              ? (
                  <View theme={loadingContainerTheme}>
                    <LoaderText theme={{ base: { fz: 'Fz(ms1)' } }}
                      size='1'
                      loading />
                  </View>
                )
              : (<Entries ref={c => this.list = c}/>)
            }
          </View>
        </ScrollView>
      </Page>
    )
  }
}

const mapStateToProps = (state) => {
  const {
    page,
    termsLoading,
    termCount,
  } = state.glossary
  const query = state.routing.location.query
  return {
    location: state.routing.location,
    termCount,
    termsLoading,
    page,
    scrollIndex: Number.parseInt(query.index, 10),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Glossary)

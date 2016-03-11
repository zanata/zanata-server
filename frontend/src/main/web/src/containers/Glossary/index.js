import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { debounce, cloneDeep } from 'lodash'
import { replaceRouteQuery } from '../../utils/RoutingHelpers'
import ReactList from 'react-list'
import {
  LoaderText,
  Page,
  ScrollView,
  View
} from '../../components'
import {
  glossaryDeleteTerm,
  glossaryGetTermsIfNeeded,
  glossaryResetTerm,
  glossarySelectTerm,
  glossaryUpdateIndex,
  glossaryUpdateField,
  glossaryUpdateTerm
} from '../../actions/glossary'
import ViewHeader from './ViewHeader'
import Entry from './Entry'

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
  renderItem (index, key) {
    const {
      handleSelectTerm,
      handleTermFieldUpdate,
      handleDeleteTerm,
      handleResetTerm,
      handleUpdateTerm,
      termsLoading,
      termIds,
      terms,
      selectedTransLocale,
      selectedTerm,
      permission,
      saving
      } = this.props
    const entryId = termIds[index]
    const selected = entryId === selectedTerm.id
    const entry = selected ? selectedTerm : entryId
      ? cloneDeep(terms[entryId]) : false
    const savingEntry = saving[entryId]
    return (
      <Entry key={key}
             entry={entry}
             index={index}
             selected={selected}
             savingEntry={savingEntry}
             permission={permission}
             transSelected={!!selectedTransLocale}
             termsLoading={termsLoading}
             handleSelectTerm={handleSelectTerm}
             handleTermFieldUpdate={handleTermFieldUpdate}
             handleDeleteTerm={handleDeleteTerm}
             handleResetTerm={handleResetTerm}
             handleUpdateTerm={handleUpdateTerm}
      />
    )
  }
  onScroll () {
    // Debounced by 100ms in super()
    if (!this.list) return
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
              : (<ReactList
                  useTranslate3d
                  itemRenderer={::this.renderItem}
                  length={termCount}
                  type='uniform'
                  initialIndex={scrollIndex || 0}
                  ref={c => this.list = c}
                />)
            }
          </View>
        </ScrollView>
      </Page>
    )
  }
}

const mapStateToProps = (state) => {
  const {
    selectedTerm,
    stats,
    terms,
    termIds,
    filter,
    permission,
    termsLoading,
    termCount,
    saving
  } = state.glossary
  const query = state.routing.location.query
  return {
    terms,
    termIds,
    termCount,
    termsLoading,
    transLocales: stats.transLocales,
    srcLocale: stats.srcLocale,
    filterText: filter,
    selectedTerm: selectedTerm,
    selectedTransLocale: query.locale,
    scrollIndex: Number.parseInt(query.index, 10),
    permission,
    location: state.routing.location,
    saving
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    handleSelectTerm: (termId) => dispatch(glossarySelectTerm(termId)),
    handleTermFieldUpdate: (field, event) => {
      dispatch(glossaryUpdateField({ field, value: event.target.value || '' }))
    },
    handleDeleteTerm: (termId) => dispatch(glossaryDeleteTerm(termId)),
    handleResetTerm: (termId) => dispatch(glossaryResetTerm(termId)),
    handleUpdateTerm: (term) => dispatch(glossaryUpdateTerm(term))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Glossary)

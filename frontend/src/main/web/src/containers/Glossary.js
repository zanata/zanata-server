import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import ReactList from 'react-list'
import { ButtonLink, Icon, LoaderText, Select } from 'zanata-ui'
import { debounce } from 'lodash'
import { replaceRouteQuery } from '../utils/RoutingHelpers'
import {
  EditableText,
  Header,
  Page,
  Row,
  ScrollView,
  TableCell,
  TableRow,
  TextInput,
  View
} from '../components'
import {
  glossaryChangeLocale,
  glossaryUpdateIndex,
  glossaryFilterTextChanged,
  glossaryGetEntriesIfNeeded
} from '../actions/glossary'

let sameRenders = 0

const isSameRender = () => {
  sameRenders++
  console.debug('Same Render', sameRenders)
  if (sameRenders > 10) {
    debugger
    sameRenders = 0
    console.debug('Debug, Reset')
  }
}

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
    const termId = this.props.termIds[index]
    const term = termId ? this.props.terms[termId] : false
    const transContent = term && term.glossaryTerms[1]
      ? term.glossaryTerms[1].content
      : ''
    const transSelected = !!this.props.selectedTransLocale
    const transLoading = this.props.loading
    if (!term) {
      return (
        <TableRow key={key}>
          <TableCell>
            <div className='LineClamp(1,24px) Px(rq)'>Loading…</div>
          </TableCell>
        </TableRow>
      )
    }
    if (index === 1) {
      isSameRender()
    }
    return (
      <TableRow highlight className='editable' key={key}>
        <TableCell size='2' tight>
          <EditableText editable={!this.props.selectedTransLocale}>
            {term.glossaryTerms[0].content}
          </EditableText>
        </TableCell>
        <TableCell size='2' tight={transSelected}>
          {transSelected
            ? transLoading
              ? <div className='LineClamp(1,24px) Px(rq)'>Loading…</div>
            : (<EditableText
                editable={transSelected}
                placeholder='Add a translation…'
                emptyReadOnlyText='No translation'>
                {transContent}
              </EditableText>)
            : <div className='LineClamp(1,24px) Px(rq)'>{term.termsCount}</div>
          }
        </TableCell>
        <TableCell hideSmall>
          {term.pos
            ? <div className='LineClamp(1,24px)'>{term.pos}</div>
          : <div className='C(muted) LineClamp(1,24px)'>N/A</div>}
        </TableCell>
        <TableCell hideSmall>
          <div className='LineClamp(1,24px)'>{term.description}</div>
        </TableCell>
      </TableRow>
    )
  }
  currentLocaleCount () {
    if (this.props.filterText && this.props.results) {
      return this.props.results
        .filter(result => result.glossaryTerms.length >= 2).length
    } else {
      const selectedTransLocaleObj = this.props.transLocales
        .find((locale) => locale.value === this.props.selectedTransLocale)
      return selectedTransLocaleObj ? selectedTransLocaleObj.count : 0
    }
  }
  currentLocaleName () {
    const selectedTransLocaleObj = this.props.transLocales
      .find((locale) => locale.value === this.props.selectedTransLocale)
    return selectedTransLocaleObj
      ? selectedTransLocaleObj.label
      : 'Translation'
  }
  localeOptionsRenderer (op) {
    return (
    <span className='D(f) Ai(c) Jc(sb)'>
      <span className='Flx(flx1) LineClamp(1)' title={op.label}>
        {op.label}
      </span>
      <span className='Flx(n) Pstart(re) Ta(end) Maw(r4) LineClamp(1)'>
        {op.value}
      </span>
      <span className='Flx(n) C(muted) Pstart(re) Ta(end) LineClamp(1) W(r2)'>
        {op.count}
      </span>
    </span>
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
    dispatch(glossaryGetEntriesIfNeeded(newIndex))
    // If close enough, load the prev/next page too
    dispatch(glossaryGetEntriesIfNeeded(newIndex - loadingThreshold))
    dispatch(glossaryGetEntriesIfNeeded(newIndexEnd + loadingThreshold))
  }
  render () {
    const {
      filterText = '',
      loading,
      termCount,
      scrollIndex = 0,
      statsLoading,
      transLocales,
      selectedTransLocale,
      onTranslationLocaleChange,
      onFilterTextChange
    } = this.props
    const currentLocaleCount = this.currentLocaleCount()
    return (
      <Page>
        <Helmet title='Glossary' />
        <ScrollView onScroll={::this.onScroll}>
          <Header title='Glossary'
            extraElements={(
              <View theme={{base: { ai: 'Ai(c)', fld: '' }}}>
                <TextInput
                  theme={{base: { flx: 'Flx(flx1)', m: 'Mstart(rh)--md' }}}
                  type='search'
                  placeholder='Search Terms…'
                  accessibilityLabel='Search Terms'
                  value={filterText}
                  onChange={onFilterTextChange} />
                <ButtonLink theme={{ base: { m: 'Mstart(rh)' } }}>
                  <Row>
                    <Icon name='import' className='Mend(rq)'
                      theme={{ base: { m: 'Mend(rq)' } }}/>
                    <span className='Hidden--lesm'>Import Glossary</span>
                  </Row>
                </ButtonLink>
                <ButtonLink theme={{ base: { m: 'Mstart(rh)' } }}>
                  <Row>
                    <Icon name='plus' className='Mend(rq)'
                      theme={{ base: { m: 'Mend(rq)' } }}/>
                    <span className='Hidden--lesm'>New Term</span>
                  </Row>
                </ButtonLink>
              </View>
            )}>
            <View theme={{
              base: {
                w: 'W(100%)',
                m: 'Mt(rq) Mt(rh)--sm'
              }}}>
              <TableRow
                theme={{ base: { bd: '' } }}
                className='Flxg(1)'>
                <TableCell size='2'>
                  <Row>
                    <Icon name='glossary'
                      className='C(neutral) Mend(re)' />
                    <span className='LineClamp(1,24px)'>
                      English (United States)
                    </span>
                    <span className='C(muted) Mstart(rq)'>{termCount}</span>
                  </Row>
                </TableCell>
                <TableCell tight size='2' theme={{base: {lineClamp: ''}}}>
                  <Select
                    name='language-selection'
                    placeholder={statsLoading
                      ? 'Loading…' : 'Select a language…'}
                    className='Flx(flx1)'
                    isLoading={statsLoading}
                    value={selectedTransLocale}
                    options={transLocales}
                    pageSize={20}
                    optionRenderer={this.localeOptionsRenderer}
                    onChange={onTranslationLocaleChange}
                  />
                  {selectedTransLocale &&
                    (<Row>
                      <Icon name='translate'
                        className='C(neutral) Mstart(rq) Mend(re)' />
                      <span className='C(muted)'>
                        {currentLocaleCount}
                      </span>
                    </Row>)
                  }
                </TableCell>
                <TableCell hideSmall>
                  <div className="LineClamp(1,24px)">Part of Speech</div>
                </TableCell>
                <TableCell hideSmall>
                  Description
                </TableCell>
              </TableRow>
            </View>
          </Header>
          <View theme={{ base: {p: 'Pt(r6) Pb(r2)'} }}>
            { loading && !termCount
              ? (
                  <View theme={loadingContainerTheme}>
                    <LoaderText theme={{ base: { fz: 'Fz(ms1)' } }}
                      size='1'
                      loading />
                  </View>
                )
              : (
                <ReactList
                  useTranslate3d
                  itemRenderer={::this.renderItem}
                  length={termCount}
                  type='uniform'
                  initialIndex={scrollIndex || 0}
                  ref={c => this.list = c}
                />
              )
            }
          </View>
        </ScrollView>
      </Page>
    )
  }
}

const mapStateToProps = (state) => {
  const {
    loading,
    terms,
    termIds,
    page,
    totalCount
  } = state.glossary.entries
  const query = state.routing.location.query
  return {
    location: state.routing.location,
    terms,
    termIds,
    termCount: totalCount || 0,
    loading,
    page,
    statsLoading: state.glossary.stats.loading,
    transLocales: state.glossary.stats.results
      ? state.glossary.stats.results.transLocale : [],
    filterText: query.filter,
    selectedTransLocale: query.locale,
    scrollIndex: Number.parseInt(query.index, 10)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    onTranslationLocaleChange: (selectedLocale) =>
      dispatch(
        glossaryChangeLocale(selectedLocale ? selectedLocale.value : '')
      ),
    onFilterTextChange: (event) =>
      dispatch(glossaryFilterTextChanged(event.target.value || ''))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Glossary)

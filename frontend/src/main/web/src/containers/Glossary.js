import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import ReactList from 'react-list'
import { ButtonLink, Icon, LoaderText, Select } from 'zanata-ui'
import { debounce } from 'lodash'
import {
  EditableText,
  Header,
  Page,
  ScrollView,
  TableRow,
  TextInput,
  View
} from '../components'
import {
  glossaryMounted,
  glossaryScrolled,
  glossaryLoadPage,
  glossaryChangeLocale,
  glossaryFilterTextChanged
} from '../actions/glossary'

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
  componentWillMount () {
    this.props.onMount()
  }
  renderItem (index, key) {
    const item = this.props.results[index] || false
    const transContent = item && item.glossaryTerms[1]
      ? item.glossaryTerms[1].content
      : (<span className='C(muted) Fs(i)'>No translation</span>)
    const transLoading = this.props.loading
    return item ? (
      <TableRow className='editable' key={key}>
        <div className='D(f) Ai(c) Flx(flx2) P(rq)'>
          <EditableText editable={false}>
            {item.glossaryTerms[0].content}
          </EditableText>
        </div>
        <div className='D(f) Ai(c) Flx(flx2) P(rq)'>
          {this.props.selectedTransLocale
            ? transLoading
              ? <div className='LineClamp(1,36px)'>Loading…</div>
              : (<div className='LineClamp(1,36px)'>
                  {transContent}
                </div>)
            : <div className='LineClamp(1,36px)'>{item.termsCount}</div>
          }
        </div>
        <div className='D(f) Ai(c) Flx(flx1) D(n)--oxsm P(rq)'>
          {item.pos
            ? <div className='LineClamp(1,36px)'>{item.pos}</div>
          : <div className='C(muted) LineClamp(1,36px)'>N/A</div>}
        </div>
        <div
          className='D(f) Ai(c) Flx(flx1) D(n)--lesm Py(rq) Pstart(rq)'>
          <div className='LineClamp(1,36px)'>{item.description}</div>
        </div>
      </TableRow>
    ) : (
      <TableRow key={key}>
        <div className='D(f) Ai(c) Flx(flx1) Py(rq) Px(rh) C(muted) H(r2)'>
          <div className='LineClamp(1,36px)'>Loading…</div>
        </div>
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
    if (this.list) {
      this.props.scrolled(this.list.getVisibleRange())
    }
  }
  render () {
    const {
      filterText = '',
      loading,
      resultsCount,
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
        <Header title='Glossary'
          theme={{ base: { p: 'Px(rh) Px(r1)--sm Pt(r1)' } }}
          extraElements={(
            <View theme={{base: { ai: 'Ai(c)', fld: '' }}}>
              <ButtonLink theme={{ base: { m: 'Mstart(rh)' } }}>
                <Icon name='import' className='Mend(rq)'
                  theme={{ base: { m: 'Mend(rq)' } }}/>
                <span className='Hidden--lesm'>Import Glossary</span>
              </ButtonLink>
              <ButtonLink theme={{ base: { m: 'Mstart(rh)' } }}>
                <Icon name='plus' className='Mend(rq)'
                  theme={{ base: { m: 'Mend(rq)' } }}/>
                <span className='Hidden--lesm'>New Term</span>
              </ButtonLink>
            </View>
          )}>
          <View theme={{
            base: {
              w: 'W(100%)',
              m: 'Mt(rh)'
            }
          }}>
            <View theme={{
              base: {
                ai: 'Ai(c)',
                fld: '',
                flw: 'Flw(w)'
              }
            }}>
              <Select
                name='language-selection'
                placeholder={statsLoading ? 'Loading…' : 'Select a language…'}
                className='Flx(flx1) Miw(100%)--lesm Mb(rh)--lesm Mend(rh)'
                isLoading={statsLoading}
                value={selectedTransLocale}
                options={transLocales}
                optionRenderer={this.localeOptionsRenderer}
                onChange={onTranslationLocaleChange}
              />
              <Icon name='glossary'
                className='C(neutral) Mend(re)' />
              <span className='C(muted)'>{resultsCount}</span>
              { selectedTransLocale &&
                <Icon name='translate'
                  className='C(neutral) Mstart(rq) Mend(re)' /> }
              { selectedTransLocale &&
                <span className='C(muted)'>{currentLocaleCount}</span>
              }
              <TextInput
                theme={{base: { flx: 'Flx(flx1)', m: 'Mstart(rh)' }}}
                type='search'
                placeholder='Search Terms…'
                accessibilityLabel='Search Terms'
                value={filterText}
                onChange={onFilterTextChange} />
            </View>
            <View theme={{
              base: {
                bd: 'Bdb(bd2) Bdc(neutral)',
                fld: '',
                flxg: 'Flxg(1)',
                m: 'Mt(rh)'
              }
            }}>
              <div className='LineClamp(1) Flx(flx2) Py(rq) Pend(rq) Fw(600)'>
                English (United States)
              </div>
              <div className='LineClamp(1) Flx(flx2) Minw(4/12) P(rq)'>
                {selectedTransLocale
                  ? <span>{::this.currentLocaleName()}</span>
                  : <span>Translations</span>
                }
              </div>
              <div className='LineClamp(1) D(n)--oxsm P(rq) Flx(flx1)'>
                Part of Speech
              </div>
              <div
                className='LineClamp(1) Flx(flx1) D(n)--lesm Py(rq) Pstart(rq)'>
                Description
              </div>
            </View>
          </View>
        </Header>
        <ScrollView onScroll={::this.onScroll}>
          { loading && !resultsCount
            ? (
                <View theme={loadingContainerTheme}>
                  <LoaderText theme={{ base: { fz: 'Fz(ms1)' } }}
                    size='1'
                    loading />
                </View>
              )
            : (
              <ReactList
                itemRenderer={::this.renderItem}
                length={resultsCount}
                type='uniform'
                initialIndex={scrollIndex}
                ref={c => this.list = c}
              />
            )
          }
        </ScrollView>
      </Page>
    )
  }
}

const mapStateToProps = (state) => {
  const {
    loading,
    results,
    page,
    totalCount
  } = state.glossary.entries
  const query = state.routing.location.query
  return {
    location: state.routing.location,
    results,
    resultsCount: totalCount || 0,
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
    onMount: () => dispatch(glossaryMounted()),
    scrolled: (index) => dispatch(glossaryScrolled(index)),
    loadNextPage: (page) => dispatch(glossaryLoadPage(page)),
    onTranslationLocaleChange: (selectedLocale) =>
      dispatch(
        glossaryChangeLocale(selectedLocale ? selectedLocale.value : '')
      ),
    onFilterTextChange: (event) =>
      dispatch(glossaryFilterTextChanged(event.target.value || ''))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Glossary)

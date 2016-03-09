import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import ReactList from 'react-list'
import {
  ButtonLink,
  ButtonRound,
  Icon,
  LoaderText,
  Select,
  OverlayTrigger,
  Overlay,
  Tooltip } from 'zanata-ui'
import { debounce, cloneDeep } from 'lodash'
import { replaceRouteQuery } from '../../utils/RoutingHelpers'
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
} from '../../components'
import {
  glossaryChangeLocale,
  glossaryUpdateIndex,
  glossaryFilterTextChanged,
  glossaryGetTermsIfNeeded,
  glossarySelectTerm,
  glossaryUpdateField,
  glossaryDeleteTerm,
  glossaryResetTerm,
  glossaryUpdateTerm,
  glossarySortColumn,
  glossaryToggleImportFileDisplay,
  glossaryToggleNewEntryModal
} from '../../actions/glossary'
import StringUtils from '../../utils/StringUtils'
import DeleteEntryModal from './DeleteEntryModal'
import ImportModal from './ImportModal'
import NewEntryModal from './NewEntryModal'
import Comment from './Comment'

let sameRenders = 0

const isSameRender = () => {
  sameRenders++
  console.debug('Same Render', sameRenders)
  if (sameRenders > 10) {
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
    const {
      handleSelectTerm,
      handleTermFieldUpdate,
      handleDeleteTerm,
      handleResetTerm,
      handleUpdateTerm,
      termIds,
      terms,
      transLoading,
      selectedTransLocale,
      selectedTerm,
      permission
    } = this.props
    const termId = termIds[index]
    const selected = termId === selectedTerm.id
    const term = selected ? selectedTerm : termId
      ? cloneDeep(terms[termId]) : false
    const transContent = term && term.transTerm
      ? term.transTerm.content
      : ''
    const transSelected = !!selectedTransLocale

    // TODO: Make this only set when switching locales
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

    const isTermModified = transSelected
      ? (term.status && term.status.isTransModified)
      : (term.status && term.status.isSrcModified)
    const displayUpdateButton = permission.canUpdateEntry && isTermModified
    const isSaving = term.status && term.status.isSaving
    const editable = permission.canUpdateEntry && !isSaving

    let updateButton
    if (isSaving) {
      updateButton = (
        <ButtonRound theme={{base: {m: 'Mstart(rh)'}}} type='primary'
          disabled={true}>
          <LoaderText loading loadingText='Updating'>Update</LoaderText>
        </ButtonRound>)
    } else if (displayUpdateButton) {
      updateButton = (
        <ButtonRound theme={{base: {m: 'Mstart(rh)'}}} type='primary'
          onClick={() => handleUpdateTerm(term)}>
          Update
        </ButtonRound>)
    }

    return (
      <TableRow highlight
        className='editable'
        key={key}
        selected={selected}
        onClick={() => handleSelectTerm(termId)}>
        <TableCell size='2' tight>
          <EditableText
            editable={false}
            editing={selected}>
            {term.srcTerm.content}
          </EditableText>
        </TableCell>
        <TableCell size={transSelected ? '2' : '1'} tight={transSelected}>
          {transSelected
            ? transLoading
              ? <div className='LineClamp(1,24px) Px(rq)'>Loading…</div>
            : (<EditableText
                editable={transSelected && editable}
                editing={selected}
                onChange={(e) => handleTermFieldUpdate('locale', e)}
                placeholder='Add a translation…'
                emptyReadOnlyText='No translation'>
                {transContent}
              </EditableText>)
            : <div className='LineClamp(1,24px) Px(rq)'>{term.termsCount}</div>
          }
        </TableCell>
        <TableCell hideSmall>
          <EditableText
            editable={!transSelected && editable}
            editing={selected}
            onChange={(e) => handleTermFieldUpdate('pos', e)}
            placeholder='Add part of speech…'
            emptyReadOnlyText='No part of speech'>
            {term.pos}
          </EditableText>
        </TableCell>
        {!transSelected ? (
            <TableCell hideSmall>
              <EditableText
                editable={!transSelected && editable}
                editing={selected}
                onChange={(e) => handleTermFieldUpdate('description', e)}
                placeholder='Add a description…'
                emptyReadOnlyText='No description'>
                {term.description}
              </EditableText>
            </TableCell>
          ) : ''
        }
        <TableCell hideSmall>
          <ButtonLink>
            <Icon name='info'/>
          </ButtonLink>

          {transSelected ? (<Comment term={term}
            canUpdateEntry={permission.canUpdateEntry}/>) : ''}
          {updateButton}
          <div className='Op(0) row--selected_Op(1) editable:h_Op(1) Trs(eo)'>
            {displayUpdateButton && !isSaving ? (
                <ButtonLink theme={{base: {m: 'Mstart(rh)'}}}
                            onClick={() => handleResetTerm(termId)}>
                  Cancel
                </ButtonLink>
              ) : ''
            }

            {!transSelected && permission.canDeleteEntry && !isSaving ? (
                <DeleteEntryModal id={termId}
                                  entry={term}
                                  className='Mstart(rh)'
                                  onDelete={handleDeleteTerm}/>
              ) : ''
            }
          </div>

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
    dispatch(glossaryGetTermsIfNeeded(newIndex))
    // If close enough, load the prev/next page too
    dispatch(glossaryGetTermsIfNeeded(newIndex - loadingThreshold))
    dispatch(glossaryGetTermsIfNeeded(newIndexEnd + loadingThreshold))
  }

  render () {
    const {
      filterText = '',
      termsLoading,
      termCount,
      scrollIndex = 0,
      statsLoading,
      transLocales,
      srcLocale,
      selectedTransLocale,
      handleTranslationLocaleChange,
      handleFilterFieldUpdate,
      handleImportFileDisplay,
      handleNewEntryDisplay,
      handleSortColumn,
      permission,
      importFile,
      newEntry,
      sort
    } = this.props
    const currentLocaleCount = this.currentLocaleCount()
    const transSelected = !!selectedTransLocale
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
                  defaultValue={filterText}
                  onChange={handleFilterFieldUpdate} />
                  {permission.canAddNewEntry ? (
                    <div className='Mstart(rq)'>
                      <ButtonLink type='default'
                        onClick={() => handleImportFileDisplay(true)}
                        theme={{ base: { m: 'Mstart(rh)' } }}>
                        <Row>
                          <Icon name='import' className='Mend(rq)'
                            theme={{ base: { m: 'Mend(rq)' } }}/>
                          <span className='Hidden--lesm'>Import Glossary</span>
                        </Row>
                      </ButtonLink>
                       <ImportModal
                        srcLocale={srcLocale}
                        transLocales={transLocales}
                        file={importFile.file}
                        show={importFile.show}
                        status={importFile.status}
                        transLocale={importFile.transLocale}/></div>) : ''}

                   {permission.canAddNewEntry ? (
                     <div className='Mstart(rq)'>
                        <ButtonLink theme={{ base: { m: 'Mstart(rh)' } }}
                          onClick={() => handleNewEntryDisplay(true)}>
                          <Row>
                            <Icon name='plus' className='Mend(rq)'
                              theme={{ base: { m: 'Mend(rq)' } }}/>
                            <span className='Hidden--lesm'>New Term</span>
                          </Row>
                        </ButtonLink>
                        <NewEntryModal
                          entry={newEntry.entry}
                          show={newEntry.show}
                          isSaving={newEntry.isSaving}/>
                     </div>) : ''
                   }

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
                <TableCell size='2'
                           onClick={() => handleSortColumn('src_content')}>
                  <ButtonLink type='default'>
                    <Row>
                      {'src_content' in sort ? (sort.src_content === true ? <Icon name='chevron-down'/> : <Icon name='chevron-up'/>) : ''}
                      <Icon name='glossary' className='C(neutral) Mend(re) MStart(rq)' />
                      <span className='LineClamp(1,24px)'>
                        English (United States)
                      </span>
                      <span className='C(muted) Mstart(rq)'>{termCount}</span>
                    </Row>
                  </ButtonLink>
                </TableCell>
                <TableCell tight size={transSelected ? '2' : '1'}
                  theme={{base: {lineClamp: ''}}}>
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
                    onChange={handleTranslationLocaleChange}
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
                <TableCell hideSmall onClick={() => handleSortColumn('part_of_speech')}>
                  <ButtonLink type='default'>
                    <Row>
                      {'part_of_speech' in sort ? (sort.part_of_speech === true ? <Icon name='chevron-down'/> : <Icon name='chevron-up'/>) : ''}
                      <span className='LineClamp(1,24px) MStart(rq)'>Part of Speech</span>
                    </Row>
                  </ButtonLink>
                </TableCell>
                {!transSelected ? (
                  <TableCell hideSmall onClick={() => handleSortColumn('desc')}>
                    <ButtonLink type='default'>
                      <Row>
                        {'desc' in sort ? (sort.desc === true ? <Icon name='chevron-down'/> : <Icon name='chevron-up'/>) : ''}
                        <span className='LineClamp(1,24px) MStart(rq)'>Description</span>
                      </Row>
                    </ButtonLink>
                  </TableCell>
                  ) : ''
                }
                <TableCell hideSmall>
                </TableCell>
              </TableRow>
            </View>
          </Header>
          <View theme={{ base: {p: 'Pt(r6) Pb(r2)'} }}>
            { termsLoading && !termCount
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
    page,
    selectedTerm,
    stats,
    statsLoading,
    termsLoading,
    terms,
    termIds,
    termCount,
    filter,
    permission,
    importFile,
    newEntry,
    sort
  } = state.glossary
  const query = state.routing.location.query
  return {
    location: state.routing.location,
    terms,
    termIds,
    termCount,
    termsLoading,
    page,
    statsLoading,
    transLocales: stats.transLocales,
    srcLocale: stats.srcLocale,
    filterText: filter,
    selectedTerm: selectedTerm,
    selectedTransLocale: query.locale,
    scrollIndex: Number.parseInt(query.index, 10),
    permission,
    importFile,
    newEntry,
    sort
  }
}

const mapDispatchToProps = (dispatch) => {
  const updateFilter = debounce(val =>
    dispatch(glossaryFilterTextChanged(val)), 200)

  return {
    dispatch,
    handleSelectTerm: (termId) => dispatch(glossarySelectTerm(termId)),
    handleTranslationLocaleChange: (selectedLocale) =>
      dispatch(
        glossaryChangeLocale(selectedLocale ? selectedLocale.value : '')
      ),
    handleFilterFieldUpdate: (event) => {
      updateFilter(event.target.value || '')
    },
    handleTermFieldUpdate: (field, event) => {
      dispatch(glossaryUpdateField({ field, value: event.target.value || '' }))
    },
    handleDeleteTerm: (termId) => dispatch(glossaryDeleteTerm(termId)),
    handleResetTerm: (termId) => dispatch(glossaryResetTerm(termId)),
    handleUpdateTerm: (term) => dispatch(glossaryUpdateTerm(term)),
    handleSortColumn: (col) => dispatch(glossarySortColumn(col)),
    handleImportFileDisplay: (display) =>
      dispatch(glossaryToggleImportFileDisplay(display)),
    handleNewEntryDisplay: (display) =>
      dispatch(glossaryToggleNewEntryModal(display))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Glossary)

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { debounce } from 'lodash'
import {
  ButtonLink,
  Header,
  Icon,
  Row,
  Select,
  TableCell,
  TableRow,
  TextInput,
  View
} from '../../components'
import {
  glossaryChangeLocale,
  glossaryFilterTextChanged,
  glossarySortColumn,
  glossaryToggleImportFileDisplay,
  glossaryToggleNewEntryModal
} from '../../actions/glossary'
import ImportModal from './ImportModal'
import NewEntryModal from './NewEntryModal'

class ViewHeader extends Component {

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
  render () {
    const {
      filterText = '',
      termCount,
      statsLoading,
      transLocales,
      selectedTransLocale,
      handleTranslationLocaleChange,
      handleFilterFieldUpdate,
      handleImportFileDisplay,
      handleNewEntryDisplay,
      handleSortColumn,
      permission,
      sort
      } = this.props
    const currentLocaleCount = this.currentLocaleCount()
    const transSelected = !!selectedTransLocale
    return (
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
                    atomic={{m: 'Mstart(rh)'}}>
                    <Row>
                      <Icon name='import'
                        atomic={{m: 'Mend(rq)'}}/>
                      <span className='Hidden--lesm'>Import Glossary</span>
                    </Row>
                  </ButtonLink>
                  <ImportModal/>
                </div>) : ''}

               {permission.canAddNewEntry ? (
                 <div className='Mstart(rq)'>
                    <ButtonLink atomic={{m: 'Mstart(rh)'}}
                      onClick={() => handleNewEntryDisplay(true)}>
                      <Row>
                        <Icon name='plus'
                          atomic={{m: 'Mend(rq)'}}/>
                        <span className='Hidden--lesm'>New Term</span>
                      </Row>
                    </ButtonLink>
                    <NewEntryModal/>
                 </div>) : ''
               }
          </View>
        )}>
        <View theme={{
          base: {
            w: 'W(100%)',
            m: 'Mt(rq) Mt(rh)--sm'
          }}}
        >
          <TableRow
            theme={{ base: { bd: '' } }}
            className='Flxg(1)'>
            <TableCell size='3'
                       onClick={() => handleSortColumn('src_content')}>
              <ButtonLink type='default'>
                <Row>
                  {'src_content' in sort
                    ? (sort.src_content === true)
                      ? <Icon name='chevron-down'/>
                      : <Icon name='chevron-up'/>
                    : ''}
                  <Icon name='glossary'
                    atomic={{c: 'C(neutral)', m: 'Mend(re) MStart(rq)'}} />
                    <span className='LineClamp(1,24px)'>
                      English (United States)
                    </span>
                  <span className='C(muted) Mstart(rq)'>{termCount}</span>
                </Row>
              </ButtonLink>
            </TableCell>
            <TableCell tight size={'3'}
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
                  atomic={{c: 'C(neutral)', m: 'Mstart(rq) Mend(re)'}} />
                <span className='C(muted)'>
                  {currentLocaleCount}
                </span>
              </Row>)
              }
            </TableCell>
            <TableCell hideSmall
              onClick={() => handleSortColumn('part_of_speech')}>
              <ButtonLink type='default'>
                <Row>
                  {'part_of_speech' in sort
                    ? (sort.part_of_speech === true)
                      ? <Icon name='chevron-down'/>
                      : <Icon name='chevron-up'/>
                    : ''}
                  <span className='LineClamp(1,24px) MStart(rq)'>
                    Part of Speech
                  </span>
                </Row>
              </ButtonLink>
            </TableCell>
            <TableCell size='2'>
            </TableCell>
          </TableRow>
        </View>
      </Header>
    )
  }
}

const mapStateToProps = (state) => {
  const {
    page,
    stats,
    statsLoading,
    termCount,
    filter,
    permission,
    sort
    } = state.glossary
  const query = state.routing.location.query
  return {
    location: state.routing.location,
    termCount,
    page,
    statsLoading,
    transLocales: stats.transLocales,
    filterText: filter,
    selectedTransLocale: query.locale,
    permission,
    sort
  }
}

const mapDispatchToProps = (dispatch) => {
  const updateFilter = debounce(val =>
    dispatch(glossaryFilterTextChanged(val)), 200)

  return {
    dispatch,
    handleTranslationLocaleChange: (selectedLocale) =>
      dispatch(
        glossaryChangeLocale(selectedLocale ? selectedLocale.value : '')
      ),
    handleFilterFieldUpdate: (event) => {
      updateFilter(event.target.value || '')
    },
    handleSortColumn: (col) => dispatch(glossarySortColumn(col)),
    handleImportFileDisplay: (display) =>
      dispatch(glossaryToggleImportFileDisplay(display)),
    handleNewEntryDisplay: (display) =>
      dispatch(glossaryToggleNewEntryModal(display))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewHeader)

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { debounce, cloneDeep } from 'lodash'
import ReactList from 'react-list'
import {
  glossarySelectTerm,
  glossaryUpdateField,
  glossaryDeleteTerm,
  glossaryResetTerm,
  glossaryUpdateTerm
} from '../../actions/glossary'
import {
  EditableText,
  TableCell,
  TableRow,
  TextInput
} from '../../components'
import {
  ButtonLink,
  ButtonRound,
  Icon,
  LoaderText } from 'zanata-ui'

import EntryModal from './EntryModal'
import DeleteEntryModal from './DeleteEntryModal'

let sameRenders = 0

const isSameRender = () => {
  sameRenders++
  console.debug('Same Render', sameRenders)
  if (sameRenders > 10) {
    sameRenders = 0
    console.debug('Debug, Reset')
  }
}

class Entries extends Component {

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
            ? termsLoading
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

          {transSelected ? (<EntryModal term={term}
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

  render () {
    const {
      scrollIndex,
      termCount,
      ...props
    } = this.props

    return (<ReactList
      useTranslate3d
      itemRenderer={::this.renderItem}
      length={termCount}
      type='uniform'
      initialIndex={scrollIndex || 0}
      ref={c => this.list = c}
      {...props}
    />)
  }
}

Entries.propType = {}

const mapStateToProps = (state) => {
  const {
    selectedTerm,
    stats,
    termsLoading,
    terms,
    termIds,
    termCount,
    filter,
    permission
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
    permission
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

export default connect(mapStateToProps, mapDispatchToProps)(Entries)

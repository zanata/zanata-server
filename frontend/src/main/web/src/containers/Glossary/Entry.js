import React, { Component, PropTypes } from 'react'
import { isUndefined } from 'lodash'

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

class Entry extends Component {
  render () {
    const {
      handleSelectTerm,
      handleTermFieldUpdate,
      handleDeleteTerm,
      handleResetTerm,
      handleUpdateTerm,
      termsLoading,
      entry,
      index,
      transSelected,
      selected,
      permission,
      savingTerm
      } = this.props

    const isSaving = !isUndefined(savingTerm)
    const entryToUse = isSaving ? savingTerm : entry
    const transContent = entry && entry.transTerm
      ? entry.transTerm.content
      : ''

    if (!entryToUse) {
      return (
        <TableRow>
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
      ? (entryToUse.status && entryToUse.status.isTransModified)
      : (entryToUse.status && entryToUse.status.isSrcModified)
    const displayUpdateButton = permission.canUpdateEntry && isTermModified
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
                     onClick={() => handleUpdateTerm(entryToUse)}>
          Update
        </ButtonRound>)
    }

    return (
      <TableRow highlight
                className='editable'
                selected={selected}
                onClick={() => handleSelectTerm(entryToUse.id)}>
        <TableCell size='2' tight>
          <EditableText
            editable={false}
            editing={selected}>
            {entryToUse.srcTerm.content}
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
            : <div className='LineClamp(1,24px) Px(rq)'>{entryToUse.termsCount}</div>
          }
        </TableCell>
        <TableCell hideSmall>
          <EditableText
            editable={!transSelected && editable}
            editing={selected}
            onChange={(e) => handleTermFieldUpdate('pos', e)}
            placeholder='Add part of speech…'
            emptyReadOnlyText='No part of speech'>
            {entryToUse.pos}
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
              {entryToUse.description}
            </EditableText>
          </TableCell>
        ) : ''
        }
        <TableCell hideSmall>
          <ButtonLink theme={{base: { m: 'Mend(rh)' }}}>
            <Icon name='info'/>
          </ButtonLink>
          <EntryModal entry={entryToUse}/>

          {updateButton}
          <div className='Op(0) row--selected_Op(1) editable:h_Op(1) Trs(eo)'>
            {displayUpdateButton && !isSaving ? (
              <ButtonLink theme={{base: {m: 'Mstart(rh)'}}}
                          onClick={() => handleResetTerm(entryToUse.id)}>
                Cancel
              </ButtonLink>
            ) : ''
            }

            {!transSelected && permission.canDeleteEntry && !isSaving ? (
              <DeleteEntryModal id={entryToUse.id}
                                entry={entryToUse}
                                className='Mstart(rh)'
                                onDelete={handleDeleteTerm}/>
            ) : ''
            }
          </div>
        </TableCell>
      </TableRow>
    )
  }
}

Entry.propType = {
  entry: PropTypes.object,
  selected: PropTypes.bool,
  index: PropTypes.number,
  permission: PropTypes.object,
  savingEntry: PropTypes.object,
  transSelected: PropTypes.bool,
  termsLoading: PropTypes.bool,
  handleSelectTerm: PropTypes.func,
  handleTermFieldUpdate: PropTypes.func,
  handleDeleteTerm: PropTypes.func,
  handleResetTerm: PropTypes.func,
  handleUpdateTerm: PropTypes.func
}

export default Entry


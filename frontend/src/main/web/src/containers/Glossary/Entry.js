import React, { Component, PropTypes } from 'react'
import { isUndefined, isEqual } from 'lodash'

import {
  ButtonLink,
  ButtonRound,
  EditableText,
  Icon,
  LoaderText,
  TableCell,
  TableRow,
  TextInput
} from '../../components'
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
  constructor () {
    super()
    this.state = {
      showEntryModal: false,
      showDeleteModal: false
    }
  }

  handleEntryModalDisplay (display) {
    this.setState({
      showEntryModal: display
    })
  }

  handleDeleteEntryDisplay (display) {
    this.setState({
      showDeleteModal: display
    })
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState)
  }

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
      selectedTransLocale,
      selected,
      permission,
      isSaving,
      isDeleting
      } = this.props

    const transContent = entry && entry.transTerm
      ? entry.transTerm.content : ''
    const transSelected = !!selectedTransLocale

    if (!entry) {
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
      ? (entry.status && entry.status.isTransModified)
      : (entry.status && entry.status.isSrcModified)
    const displayUpdateButton = permission.canUpdateEntry &&
      isTermModified && selected
    const editable = permission.canUpdateEntry && !isSaving

    let updateButton
    if (isSaving) {
      updateButton = (
        <ButtonRound atomic={{m: 'Mstart(rh)'}} type='primary'
          disabled={true}>
          <LoaderText loading loadingText='Updating'>Update</LoaderText>
        </ButtonRound>)
    } else if (displayUpdateButton) {
      updateButton = (
        <ButtonRound atomic={{m: 'Mstart(rh)'}} type='primary'
          onClick={() => handleUpdateTerm(entry)}>
          Update
        </ButtonRound>)
    }

    return (
      <TableRow highlight
                className='editable'
                selected={selected}
                onClick={() => handleSelectTerm(entry.id)}>
        <TableCell size='2' tight>
          <EditableText
            editable={false}
            editing={selected}>
            {entry.srcTerm.content}
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
            : (<div className='LineClamp(1,24px) Px(rq)'>
              {entry.termsCount}
            </div>)
          }
        </TableCell>
        <TableCell hideSmall>
          <EditableText
            editable={!transSelected && editable}
            editing={selected}
            onChange={(e) => handleTermFieldUpdate('pos', e)}
            placeholder='Add part of speech…'
            emptyReadOnlyText='No part of speech'>
            {entry.pos}
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
              {entry.description}
            </EditableText>
          </TableCell>
        ) : ''
        }
        <TableCell hideSmall>
          <ButtonLink atomic={{m: 'Mend(rh)'}}
                      onClick={() => this.handleEntryModalDisplay(true)}>
            <Icon name='info'/>
          </ButtonLink>
          <EntryModal entry={entry}
                      show={this.state.showEntryModal}
                      isSaving={isSaving}
                      selectedTransLocale={selectedTransLocale}
                      canUpdate={displayUpdateButton}
                      handleEntryModalDisplay={(display) =>
                        this.handleEntryModalDisplay(display)}
                      handleResetTerm={(entryId) =>
                        handleResetTerm(entryId)}
                      handleTermFieldUpdate={(field, e) =>
                        handleTermFieldUpdate(field, e)}
                      handleUpdateTerm={(entry) =>
                        handleUpdateTerm(entry)}
          />

          {updateButton}
          <div className='Op(0) row--selected_Op(1) editable:h_Op(1) Trs(eo)'>
            {displayUpdateButton && !isSaving ? (
              <ButtonLink atomic={{m: 'Mstart(rh)'}}
                onClick={() => handleResetTerm(entry.id)}>
                Cancel
              </ButtonLink>
            ) : ''
            }

            {!transSelected && permission.canDeleteEntry && !isSaving ? (
              <DeleteEntryModal entry={entry}
                                isDeleting={isDeleting}
                                show={this.state.showDeleteModal}
                                className='Mstart(rh)'
                                handleDeleteEntryDisplay={(display) =>
                                  this.handleDeleteEntryDisplay(display)}
                                handleDeleteEntry={handleDeleteTerm}/>
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
  selectedTransLocale: PropTypes.object,
  isSaving: PropTypes.bool,
  isDeleting: PropTypes.bool,
  termsLoading: PropTypes.bool,
  handleSelectTerm: PropTypes.func,
  handleTermFieldUpdate: PropTypes.func,
  handleDeleteTerm: PropTypes.func,
  handleResetTerm: PropTypes.func,
  handleUpdateTerm: PropTypes.func
}

export default Entry


import React, { Component, PropTypes } from 'react'
import {
  ButtonLink,
  ButtonRound,
  Icon,
  LoaderText,
  Modal,
} from 'zanata-ui'
import {
  EditableText
} from '../../components'

class EntryModal extends Component {

  render () {
    const {
      entry,
      displayUpdateButton,
      transSelected,
      editable,
      show,
      handleEntryModalDisplay,
      handleResetTerm,
      handleUpdateTerm,
      handleTermFieldUpdate
    } = this.props

    const isSaving = entry.status && entry.status.isSaving

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
                     onClick={() => handleUpdateTerm()}>
          Update
        </ButtonRound>)
    }

    return(
      <Modal show={show} onHide={() => handleEntryModalDisplay(entry.id, false)}>
        <Modal.Header>
          <Modal.Title>Glossary Term</Modal.Title>
        </Modal.Header>
        <Modal.Body className='tal' scrollable={true}>
          {entry.id}
        </Modal.Body>
        <Modal.Footer>
          {updateButton}
          <div className='Op(0) row--selected_Op(1) editable:h_Op(1) Trs(eo)'>
            {displayUpdateButton && !isSaving ? (
                <ButtonLink theme={{base: {m: 'Mstart(rh)'}}}
                            onClick={() => handleResetTerm()}>
                  Cancel
                </ButtonLink>
              ) : ''
            }
          </div>
        </Modal.Footer>
      </Modal>
    )
  }
}

EntryModal.propType = {
  entry: PropTypes.object,
  permission: PropTypes.object,
  show: PropTypes.bool,
  displayUpdateButton: PropTypes.bool,
  transSelected: PropTypes.bool,
  editable: PropTypes.bool,
  handleResetTerm: PropTypes.func,
  handleEntryModalDisplay: PropTypes.func,
  handleUpdateTerm: PropTypes.func,
  handleTermFieldUpdate: PropTypes.func
}

export default EntryModal
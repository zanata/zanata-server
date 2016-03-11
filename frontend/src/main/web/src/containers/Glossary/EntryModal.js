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
      canUpdate,
      selectedTransLocale,
      show,
      isSaving,
      handleEntryModalDisplay,
      handleResetTerm,
      handleUpdateTerm,
      handleTermFieldUpdate
    } = this.props

    const transContent = entry && entry.transTerm
      ? entry.transTerm.content : ''
    const transSelected = !!selectedTransLocale
    const comment = entry.transTerm ? entry.transTerm.comment : ''

    return (
      <Modal show={show}
             onHide={() => handleEntryModalDisplay(false)}>
        <Modal.Header>
          <Modal.Title>
            Glossary Term
            {transSelected ? (
              <span>
                <Icon name='language'
                      className='C(neutral) Mstart(rq) Mend(re)' />
                <span className='C(muted)'>{selectedTransLocale}</span>
              </span>)
              : (<span>
                    <Icon name='translate'
                          className='C(neutral) Mstart(rq) Mend(re)' />
                    <span className='C(muted)'>{entry.termsCount}</span>
                  </span>)
            }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='Ta(start)' scrollable={true}>
          <div className='Mb(rh)'>
            <label className='Fw(b)'>Term</label>
            <EditableText
              editable={false}
              editing={false}>
              {entry.srcTerm.content}
            </EditableText>
          </div>
          <div className='Mb(rh)'>
            <label className='Fw(b)'>Part of speech</label>
            <EditableText
              editable={!transSelected}
              editing={true}
              onChange={(e) => handleTermFieldUpdate('pos', e)}>
              {entry.pos}
            </EditableText>
          </div>
          <div className='Mb(rh)'>
            <label className='Fw(b)'>Description</label>
            <EditableText
              editable={!transSelected}
              editing={true}
              onChange={(e) => handleTermFieldUpdate('description', e)}>
              {entry.description}
            </EditableText>
          </div>
          {transSelected ? (
            <div className='Mb(rh)'>
              <label className='Fw(b)'>Translation</label>
              <EditableText
                editable={true}
                editing={true}
                onChange={(e) => handleTermFieldUpdate('locale', e)}>
                {transContent}
              </EditableText>
            </div>
            ) : '' }

          {transSelected ? (
            <div className='Mb(rh)'>
              <label className='Fw(b)'>Comment</label>
              <EditableText
                editable={true}
                editing={true}
                onChange={(e) => handleTermFieldUpdate('comment', e)}>
                {comment}
              </EditableText>
            </div>
          ) : '' }
        </Modal.Body>
        <Modal.Footer>
          <ButtonLink theme={{base: {m: 'Mstart(rh)'}}}
                      onClick={() => {
                        handleResetTerm(entry.id)
                        handleEntryModalDisplay(false)
                      }}>
            Cancel
          </ButtonLink>

          {isSaving
            ? (<ButtonRound theme={{base: {m: 'Mstart(rh)'}}}
                           type='primary'
                           disabled={true}>
                <LoaderText loading loadingText='Updating'>Update</LoaderText>
              </ButtonRound>)
            : (<ButtonRound theme={{base: {m: 'Mstart(rh)'}}} type='primary'
                         onClick={() => handleUpdateTerm(entry)}
                         disabled={!canUpdate}>
                  Update
              </ButtonRound>)
          }
        </Modal.Footer>
      </Modal>
    )
  }
}

EntryModal.propType = {
  entry: PropTypes.object,
  permission: PropTypes.object,
  show: PropTypes.bool,
  isSaving: PropTypes.bool,
  canUpdate: PropTypes.bool,
  selectedTransLocale: PropTypes.object,
  handleResetTerm: PropTypes.func,
  handleEntryModalDisplay: PropTypes.func,
  handleUpdateTerm: PropTypes.func,
  handleTermFieldUpdate: PropTypes.func
}

export default EntryModal
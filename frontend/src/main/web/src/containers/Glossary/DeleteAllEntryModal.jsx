import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import {
  ButtonLink,
  ButtonRound,
  LoaderText,
  Icon,
  Tooltip,
  Overlay
} from '../../components'

/**
 * Confirmation modal dialog for delete all glossary entries
 */
class DeleteAllEntryModal extends Component {
  render () {
    const {
      show,
      isDeleting,
      handleDeleteAllEntryDisplay,
      handleDeleteAllEntry
      } = this.props

    return (
      <div className='Mstart(rq) D(ib)'>
        <Overlay
          placement='bottom'
          target={() => ReactDOM.findDOMNode(this)}
          rootClose
          show={show}
          onHide={() => handleDeleteAllEntryDisplay(false)}>
          <Tooltip id='delete-entries' title='Delete all glossary entry'>
            <p>
              Are you sure you want to delete&nbsp;
              <strong>all entries</strong>&nbsp;?
            </p>
            <div className='Mt(rq)'>
              <ButtonLink
                atomic={{m: 'Mend(rh)'}}
                onClick={() => handleDeleteAllEntryDisplay(false)}>
                Cancel
              </ButtonLink>
              <ButtonRound type='danger' size='n1'
                disabled={isDeleting}
                onClick={() => handleDeleteAllEntry()}>
                <LoaderText loading={isDeleting} size='n1'
                  loadingText='Deleting'>
                  Delete all
                </LoaderText>
              </ButtonRound>
            </div>
          </Tooltip>
        </Overlay>
        <ButtonLink type='danger'
          onClick={() => handleDeleteAllEntryDisplay(true)}
          disabled={isDeleting}>
          <Icon name='trash' atomic={{m: 'Mend(re)'}} />
          <span className='Hidden--lesm'>Delete all</span>
        </ButtonLink>
      </div>
    )
  }
}

DeleteAllEntryModal.propTypes = {
  show: React.PropTypes.bool,
  isDeleting: React.PropTypes.bool,
  handleDeleteAllEntryDisplay: PropTypes.func.isRequired,
  handleDeleteAllEntry: React.PropTypes.func.isRequired
}

export default DeleteAllEntryModal

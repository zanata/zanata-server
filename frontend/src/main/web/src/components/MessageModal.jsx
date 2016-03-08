import React, { PropTypes } from 'react'
import { Modal } from 'zanata-ui'
import { ButtonRound } from '../'
import Actions from '../actions/GlossaryActions'
import { isEmptyOrNull } from '../utils/StringUtils'

var MessageModal = React.createClass({
  propTypes: {
    value: PropTypes.shape({
      SEVERITY: PropTypes.string.isRequired,
      SUBJECT: PropTypes.string.isRequired,
      MESSAGE: PropTypes.string,
      DETAILS: PropTypes.object
    }).isRequired
  },

  _closeModal: function () {
    Actions.clearMessage()
  },

  _getSeverityClass: function (severity) {
    switch (severity) {
      case 'warn':
        return 'cwarning'
      case 'error':
        return 'cdanger'
      default:
        return 'chighlight'
    }
  },

  render: function () {
    const value = this.props.value
    const severityClass = this._getSeverityClass(value.SEVERITY)

    return (
    <Modal show={true} onHide={this._closeModal}>
      <Modal.Header>
        <Modal.Title>
          Notification
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='tal'>
        <div className={severityClass + ' fz2'}>
          {value.SUBJECT}
        </div>
        <div className='mv1/2'>
          {value.MESSAGE}
        </div>
        {!isEmptyOrNull(value.DETAILS)
          ? (
            <div className='Brds(rq) Bxsh(sh1) P(rh) Fz(msn1)'>
              {value.clientError
                ? value.DETAILS.text
                : value.DETAILS.error.message
              }
            </div>
          )
          : undefined}
      </Modal.Body>
      <Modal.Footer>
        <ButtonRound type='primary' onClick={this._closeModal}>
          Clear message
        </ButtonRound>
      </Modal.Footer>
    </Modal>
    )
  }
})

export default MessageModal

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  ButtonRound,
  Icon,
  Modal
} from './'
import {
  clearMessage
} from '../actions/common'
import { isEmptyOrNull } from '../utils/StringUtils'

class MessageModal extends Component {

  getSeverityClass (severity) {
    switch (severity) {
      case 'warn':
        return 'cwarning'
      case 'error':
        return 'cdanger'
      default:
        return 'chighlight'
    }
  }

  clearMessage () {
    this.props.handleClearMessage()
  }

  render () {
    const {
      severity,
      message,
      details
      } = this.props
    const severityClass = this.getSeverityClass(severity)

    return (
      <Modal show={true} onHide={() => this.clearMessage()}>
        <Modal.Header>
          <Modal.Title>
            Notification
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={severityClass + ' My(rh)'}>
            {message}
          </div>
          {!isEmptyOrNull(details)
            ? (<div className='Brds(rq) Bxsh(sh1) P(rh) Fz(msn1)'>
                  {details}
                </div>)
            : undefined}
        </Modal.Body>
        <Modal.Footer>
          <ButtonRound type='primary' onClick={() => this.clearMessage()}>
            Clear message
          </ButtonRound>
        </Modal.Footer>
      </Modal>
    )
  }
}

MessageModal.propType = {
  severity: PropTypes.string.isRequired,
  message: PropTypes.string,
  details: PropTypes.object
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    handleClearMessage: (termId) => dispatch(clearMessage())
  }
}

export default connect(null, mapDispatchToProps)(MessageModal)

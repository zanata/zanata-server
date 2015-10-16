import React from 'react'
import {Icon, Button, Modal} from 'zanata-ui';
import Actions from '../actions/GlossaryActions';
import StringUtils from '../utils/StringUtils'

var MessageModal = React.createClass({
  propTypes: {
    value: React.PropTypes.shape({
      SEVERITY: React.PropTypes.string.isRequired,
      SUBJECT: React.PropTypes.string.isRequired,
      MESSAGE: React.PropTypes.string,
      DETAILS: React.PropTypes.string
    }).isRequired
  },

  _closeModal: function() {
    Actions.clearMessage();
  },

  _getSeverityClass: function (severity) {
    switch(severity) {
      case 'warn':
        return 'cwarning';
      case 'error':
        return 'cdanger';
      default:
        return 'cpri';
    }
  },

  render: function () {
    const severityClass = this._getSeverityClass(this.props.value.SEVERITY);

    return (
      <Modal show={true} onHide={this._closeModal}>
        <Modal.Header>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body className='tal'>
          <div className='fz2 csec'>{this.props.value.SUBJECT}</div>
          <div className={severityClass + ' mv1/2'}>
            {this.props.value.MESSAGE}
          </div>
          <div className='cneutral'>
            {this.props.value.DETAILS}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            kind='primary'
            onClick={this._closeModal}>
            Clear message
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
});

export default MessageModal;

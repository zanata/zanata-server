import React from 'react';
import {PureRenderMixin} from 'react/addons';
import Actions from '../../actions/GlossaryActions';
import { Button, Icon, Tooltip, Overlay } from 'zanata-ui';

var DeleteEntry = React.createClass({
  propTypes: {
    resId: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    entry: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      show: false,
      deleting: false
    }
  },

  _handleDelete: function() {
    this.setState({deleting: true});
    var self = this;
    setTimeout(function() {
      Actions.deleteGlossary(self.props.resId);
      self._closeDialog();
    }, 100);
  },

  _toggleDialog: function () {
    this.setState({show: !this.state.show});
  },

  _closeDialog: function () {
    this.setState(this.getInitialState());
  },

  render: function () {
    var self = this, isDeleting = this.state.deleting,
      info = null;

    if(this.props.entry.termsCount > 0) {
      info = (<p>
        Are you sure you want to delete this term and <strong>{this.props.entry.termsCount}</strong> translations?
        </p>
      )
    } else {
      info =  (<p>
        Are you sure you want to delete this term?
      </p>)
    }

    var tooltip = (<Tooltip id="delete-glossary" title="Delete term and translations">
      {info}
      <div className="mt1/4">
        <Button className="mr1/2" link onClick={this._closeDialog}>Cancel</Button>
        <Button kind='primary' size={-1} loading={isDeleting} onClick={this._handleDelete}>Delete all</Button>
      </div>
    </Tooltip>);

    return (
      <div className={this.props.className + ' dib'}>
        <Overlay placement='top' target={props => React.findDOMNode(self)} onHide={this._closeDialog} rootClose show={this.state.show}>
          {tooltip}
        </Overlay>
        <Button kind='danger' loading={isDeleting} onClick={this._toggleDialog} link>
          <Icon name="trash" className='mr1/8'/><span>Delete</span>
        </Button>
      </div>
    );
  }
});

export default DeleteEntry;

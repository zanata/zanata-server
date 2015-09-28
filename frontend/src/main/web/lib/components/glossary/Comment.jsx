import React from 'react';
import {PureRenderMixin} from 'react/addons';
import { Button, Icon, Tooltip, OverlayTrigger, Overlay } from 'zanata-ui';
import StringUtils from '../../utils/StringUtils'
import _ from 'lodash';
import cx from 'classnames'


var Comment = React.createClass({
  propTypes: {
    readOnly: React.PropTypes.bool,
    className: React.PropTypes.string,
    value: React.PropTypes.string.isRequired,
    onUpdateCommentCallback: React.PropTypes.func.isRequired
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      value: this.props.value
    }
  },

  _onCommentChange: function(event) {
    this.setState({value: event.target.value});
  },

  _onUpdateComment: function () {
    this.props.onUpdateCommentCallback(this.state.value);
    this.setState({showComment: false});
  },

  _onCancelComment: function () {
    var value = _.isUndefined(this.props.value) ? '' : this.props.value;
    this.setState({value: value, showComment: false});
  },

  _handleKeyUp: function (event) {
    if(event.key == 'Escape') {
      this._onCancelComment();
    }
  },

  _hasValueChanged: function() {
    var initialValue = _.isUndefined(this.props.value) ? '' : this.props.value;
    var newValue = _.isUndefined(this.state.value) ? '' : this.state.value;
    return initialValue !== newValue;
  },

  _toggleComment: function () {
    this.setState({showComment: !this.state.showComment});
  },

  render: function () {
    var self = this, tooltip = null, disableUpdate = !self._hasValueChanged();

    if(this.props.readOnly !== true) {
      var tooltip = (<Tooltip id="comment" title="Comment">
        <textarea className="p1/4 w100p bd2 bdcsec30 bdrs1/4"
          onChange={self._onCommentChange}
          value={self.state.value}
          onKeyUp={self._handleKeyUp}/>
        <div className="mt1/4">
          <Button className="mr1/2" link onClick={self._onCancelComment}>Cancel</Button>
          <Button kind='primary' size={-1} disabled={disableUpdate} onClick={self._onUpdateComment}>Update Comment</Button>
        </div>
      </Tooltip>);
    } else {
      var comment = StringUtils.isEmptyOrNull(self.state.value) ? (<i>No comment</i>) : (<span>{self.state.value}</span>);
      tooltip = (<Tooltip id="comment">{comment}</Tooltip>);
    }

    var buttonClasses = cx(
      self.props.className,
      'mr1/2'
    );

    return (
      <div className="dib">
        <Overlay placement='top' target={props => React.findDOMNode(self)} onHide={self._onCancelComment} rootClose show={self.state.showComment}>
          {tooltip}
        </Overlay>
        <Button link kind={StringUtils.isEmptyOrNull(self.state.value) ? 'muted' : 'primary'} className={buttonClasses} onClick={self._toggleComment}>
          <Icon name='comment'/>
        </Button>
      </div>
    );
  }
});


export default Comment;
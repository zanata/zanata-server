import React from 'react';
import {PureRenderMixin} from 'react/addons';
import { Icon, Tooltip, OverlayTrigger } from 'zanata-ui';
import StringUtils from '../../utils/StringUtils'

var Comment = React.createClass({
  propTypes: {
    readOnly: React.PropTypes.bool,
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
  },

  _onCancelComment: function () {
    this.setState({value: this.props.value});
  },

  _handleKeyUp: function (event) {
    if(event.key == 'Escape') {
      this._onCancelComment();
    }
  },

  render: function () {
    var self = this, tooltip = null, buttons = null;
    var isValueChanged = this.props.value !== this.state.value;

    if(isValueChanged) {
      buttons = (<div className="mt1/2">
        <button className="cpri mr1/2" onClick={self._onCancelComment}>Cancel</button>
        <button className="cwhite bgcpri ph1/2 bdrs" onClick={self._onUpdateComment}>Update Comment</button>
      </div>);
    }

    if(this.props.readOnly !== true) {
      var tooltip = (<Tooltip id="comment" title="Comment">
        <textarea className="p1/4 w100p"
          onChange={self._onCommentChange}
          value={self.state.value}
          onKeyUp={this._handleKeyUp}/>
        {buttons}
      </Tooltip>);
    } else {
      var comment = StringUtils.isEmptyOrNull(self.state.value) ? (<i>No comment</i>) : (<span>{self.state.value}</span>);
      tooltip = (<Tooltip>{comment}</Tooltip>);
    }

    return (
      <OverlayTrigger placement='top' trigger='click' overlay={tooltip} rootClose>
        <button className='cpri mr1/2'><Icon name='comment'></Icon></button>
      </OverlayTrigger>
    );
  }
});


export default Comment;
import React from 'react';
import {PureRenderMixin} from 'react/addons';
import { Button, Icon, Tooltip, OverlayTrigger } from 'zanata-ui';
import Actions from '../../actions/GlossaryActions';
import LoadingCell from './LoadingCell'
import Comment from './Comment'
import GlossaryStore from '../../stores/GlossaryStore';
import _ from 'lodash';
import StringUtils from '../../utils/StringUtils'

var ActionCell = React.createClass({
  propTypes: {
    resId: React.PropTypes.string.isRequired,
    info: React.PropTypes.string.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    canUpdateEntry: React.PropTypes.bool,
    onCancel: React.PropTypes.func
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    var entry = GlossaryStore.getEntry(this.props.resId);
    return {
      entry: entry,
      comment: entry.transTerm.comment
    }
  },

  componentDidMount: function() {
    GlossaryStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    GlossaryStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    if (this.isMounted()) {
      this.setState({entry: GlossaryStore.getEntry(this.props.resId)});
    }
  },

  _handleUpdate: function() {
    Actions.updateGlossary(this.props.resId);
  },

  _handleCancel: function() {
    if(this.props.onCancel) {
      this.props.onCancel(this.props.resId, this.props.rowIndex);
    }
  },

  _onUpdateComment: function (value) {
    Actions.updateComment(this.props.resId, value);
  },

  render: function () {
    var self = this;

    if (this.props.resId === null || this.state.entry === null) {
      return (<LoadingCell/>);
    } else {
      var isTransModified = this.state.entry.status.isTransModified;
      var canUpdateComment = this.state.entry.status.canUpdateTransComment;

      var infoTooltip = <Tooltip id="info">{this.props.info}</Tooltip>;
      var info = (<OverlayTrigger placement='top' rootClose overlay={infoTooltip}>
        <Icon className="cpri" name="info"/>
      </OverlayTrigger>);

      var updateButton = null, cancelButton = null,
        comment = (<Comment className="ml1/4" readOnly={!self.props.canUpdateEntry || !canUpdateComment}
        value={this.state.entry.transTerm.comment}
        onUpdateCommentCallback={self._onUpdateComment}/>);

      if(isTransModified) {
        updateButton = (<Button kind='primary' className='ml1/4' onClick={self._handleUpdate}>Update</Button>);
        cancelButton = (<Button className='ml1/4' onClick={self._handleCancel}>Cancel</Button>);
      }

      return (<div>{info} {comment} {updateButton} {cancelButton}</div>);
    }
  }
});

export default ActionCell;
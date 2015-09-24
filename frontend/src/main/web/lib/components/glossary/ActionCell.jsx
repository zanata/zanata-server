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
    canUpdateEntry: React.PropTypes.bool
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    return this._getState();
  },

  _getState: function() {
    return {
      entry: GlossaryStore.getEntry(this.props.resId)
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
      this.setState(this._getState());
    }
  },

  _handleUpdate: function() {
    Actions.updateGlossary(this.props.resId);
  },

  _handleCancel: function() {
    Actions.resetEntry(this.props.resId);
  },

  _onUpdateComment: function (value) {
    Actions.updateComment(this.props.resId, value);
  },

  render: function () {
    var self = this;

    if (self.props.resId === null || self.state.entry === null) {
      return (<LoadingCell/>);
    } else {
      var isTransModified = self.state.entry.status.isTransModified;
      var canUpdateComment = self.state.entry.status.canUpdateTransComment;

      var infoTooltip = <Tooltip id="info">{self.props.info}</Tooltip>;
      var info = (
        <OverlayTrigger placement='top' rootClose overlay={infoTooltip}>
          <Icon className="cpri" name="info"/>
        </OverlayTrigger>);

      var updateButton = null, cancelButton = null,
        comment = (
          <Comment className="ml1/4" readOnly={!self.props.canUpdateEntry || !canUpdateComment}
            value={self.state.entry.transTerm.comment}
            onUpdateCommentCallback={self._onUpdateComment}
          />);

      if(isTransModified) {
        updateButton = (<Button kind='primary' className='ml1/4' onClick={self._handleUpdate}>Update</Button>);
        cancelButton = (<Button className='ml1/4' link onClick={self._handleCancel}>Cancel</Button>);
      }

      return (<div>{info} {comment} <div className='cdtargetib'>{updateButton} {cancelButton}</div></div>);
    }
  }
});

export default ActionCell;
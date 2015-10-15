import React from 'react';
import {PureRenderMixin} from 'react/addons';
import { Button, Icon, Tooltip, OverlayTrigger } from 'zanata-ui';
import Actions from '../../actions/GlossaryActions';
import LoadingCell from './LoadingCell'
import Comment from './Comment'
import GlossaryStore from '../../stores/GlossaryStore';
import StringUtils from '../../utils/StringUtils'
import _ from 'lodash';

var ActionCell = React.createClass({
  propTypes: {
    contentHash: React.PropTypes.string.isRequired,
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
      entry: GlossaryStore.getEntry(this.props.contentHash)
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
    Actions.updateGlossary(this.props.contentHash);
  },

  _handleCancel: function() {
    Actions.resetEntry(this.props.contentHash);
  },

  _onUpdateComment: function (value) {
    Actions.updateComment(this.props.contentHash, value);
  },

  render: function () {
    if (this.props.contentHash === null || this.state.entry === null) {
      return <LoadingCell/>;
    } else {
      var isTransModified = this.state.entry.status.isTransModified;
      var canUpdateComment = this.state.entry.status.canUpdateTransComment;
      var isSaving = this.state.entry.status.isSaving;

      var infoTooltip = <Tooltip id="info">{this.props.info}</Tooltip>;
      var info = (
        <OverlayTrigger placement='top' rootClose overlay={infoTooltip}>
          <Icon className="cpri" name="info"/>
        </OverlayTrigger>);

      var updateButton = null,
        cancelButton = null,
        comment = (
          <Comment
            className="ml1/4"
            readOnly={!this.props.canUpdateEntry || !canUpdateComment || isSaving}
            value={this.state.entry.transTerm.comment}
            onUpdateCommentCallback={this._onUpdateComment}/>
        );

      if(isSaving) {
        return (
          <div>
            {info} {comment}
            <Button kind='primary' className="ml1/4" loading>Update</Button>
          </div>
        );
      }

      if(isTransModified) {
        updateButton = (
          <Button kind='primary' className='ml1/4' onClick={this._handleUpdate}>
            Update
          </Button>
        );
        cancelButton = (
          <Button className='ml1/4' link onClick={this._handleCancel}>
            Cancel
          </Button>
        );
      }

      return (
        <div>
          {info} {comment}
          <div className='cdtargetib'>
            {updateButton} {cancelButton}
          </div>
        </div>);
    }
  }
});

export default ActionCell;

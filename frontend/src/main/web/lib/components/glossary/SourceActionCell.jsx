import React from 'react';
import {PureRenderMixin} from 'react/addons';
import { Button, Icon, Tooltip, OverlayTrigger } from 'zanata-ui';
import Actions from '../../actions/GlossaryActions';
import LoadingCell from './LoadingCell'
import DeleteEntryModal from './DeleteEntryModal'
import GlossaryStore from '../../stores/GlossaryStore';
import _ from 'lodash';

var SourceActionCell = React.createClass({
  propTypes: {
    contentHash: React.PropTypes.string.isRequired,
    info: React.PropTypes.string.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    srcLocaleId: React.PropTypes.string.isRequired,
    canUpdateEntry: React.PropTypes.bool,
    canDeleteEntry: React.PropTypes.bool
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    return this._getState();
  },

  _getState: function () {
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

  render: function() {
    if(this.props.contentHash === null || this.state.entry === null) {
      return (<LoadingCell/>);
    } else {
      var info = (
        <OverlayTrigger placement='top'
          rootClose
          overlay={<Tooltip id='src-info'>{this.props.info}</Tooltip>}>
          <Icon className="cpri" name="info"/>
        </OverlayTrigger>
      );

      if(this.state.entry.status.isSaving) {
        return (<div>{info} <Button kind='primary' className="ml1/4" loading>Update</Button></div>);
      } else {
        var deleteButton = null;

        if(this.props.canDeleteEntry) {
          deleteButton = <DeleteEntryModal className='ml1/4' contentHash={this.props.contentHash} entry={this.state.entry}/>;
        }

        var isSrcModified= this.state.entry.status.isSrcModified,
          isSrcValid = this.state.entry.status.isSrcValid;

        if(isSrcModified) {
          var updateButton = null,
            cancelButton = <Button className='ml1/4' link onClick={this._handleCancel}>Cancel</Button>;
          if(this.props.canUpdateEntry && isSrcValid) {
            updateButton = <Button kind='primary' className="ml1/4" onClick={this._handleUpdate}>Update</Button>;
          }
          return (
              <div className='difx aic'>
                <div className='cdtargetib'>{info}</div>
                {updateButton}
                {cancelButton}
                {deleteButton}
              </div>)
        } else {
          return (<div>{info}<div className='cdtargetib'>{deleteButton}</div></div>)
        }
      }
    }
  }
});

export default SourceActionCell;

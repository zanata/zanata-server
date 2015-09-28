import React from 'react';
import {PureRenderMixin} from 'react/addons';
import { Button, Icon, Tooltip, OverlayTrigger } from 'zanata-ui';
import Actions from '../../actions/GlossaryActions';
import LoadingCell from './LoadingCell'
import DeleteEntry from './DeleteEntry'
import GlossaryStore from '../../stores/GlossaryStore';
import _ from 'lodash';

var SourceActionCell = React.createClass({
  propTypes: {
    resId: React.PropTypes.string.isRequired,
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

  render: function() {
    var self = this,
      isSrcValid = self.state.entry.status.isSrcValid;

    if(this.props.resId === null || this.state.entry === null) {
      return (<LoadingCell/>);
    } else {
      var isSrcModified= self.state.entry.status.isSrcModified;
      var cancelButton = null;

      var info = (
        <OverlayTrigger placement='top'
          rootClose
          overlay={<Tooltip id='src-info'>{self.props.info}</Tooltip>}>
          <Icon className="cpri" name="info"/>
        </OverlayTrigger>);

      if(isSrcModified) {
        cancelButton = (<Button className='ml1/4' link onClick={self._handleCancel}>Cancel</Button>);
      }

      if(self.state.entry.status.isSaving === true) {
        return (<div>{info} <Button kind='primary' className="ml1/4" loading>Update</Button></div>);
      } else {
        var deleteButton = null, updateButton = null;
        if(self.props.canDeleteEntry) {
          deleteButton = (<DeleteEntry className='ml1/4' resId={self.props.resId} entry={self.state.entry}/>)
        }

        if(isSrcModified && this.props.canUpdateEntry && isSrcValid) {
          updateButton = (<Button kind='primary' className="ml1/4" onClick={self._handleUpdate}>Update</Button>);
        }

        if(isSrcModified) {
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
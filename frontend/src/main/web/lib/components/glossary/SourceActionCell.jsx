import React from 'react';
import {PureRenderMixin} from 'react/addons';
import { Button, Icon, Tooltip, OverlayTrigger } from 'zanata-ui';
import Actions from '../../actions/GlossaryActions';
import LoadingCell from './LoadingCell'
import GlossaryStore from '../../stores/GlossaryStore';
import _ from 'lodash';

var SourceActionCell = React.createClass({
  propTypes: {
    resId: React.PropTypes.string.isRequired,
    info: React.PropTypes.string.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    srcLocaleId: React.PropTypes.string.isRequired,
    newEntryCell: React.PropTypes.bool,
    canAddNewEntry: React.PropTypes.bool,
    canUpdateEntry: React.PropTypes.bool,
    onCancel: React.PropTypes.func
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    return this._getState();
  },

  _getState: function () {
    var self = this, isFocused = false,
        focusedRow = GlossaryStore.getFocusedRow();

    if(focusedRow) {
      isFocused = focusedRow.rowIndex === self.props.rowIndex;
    }
    return {
      entry: GlossaryStore.getEntry(self.props.resId),
      isFocused: isFocused
    }
  },

  componentDidMount: function() {
    GlossaryStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    GlossaryStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(this._getState());
  },

  _handleSave: function() {
    Actions.createGlossary(this.props.resId);
  },

  _handleUpdate: function() {
    Actions.updateGlossary(this.props.resId);
  },

  _handleDelete: function() {
    Actions.deleteGlossary(this.props.resId);
  },

  _handleCancel: function() {
    if(this.props.onCancel) {
      this.props.onCancel(this.props.resId, this.props.rowIndex);
    }
  },

  render: function() {
    var self = this,
      newEntryCell  = this.props.newEntryCell,
      canAddNewEntry = this.props.canAddNewEntry,
      isSrcValid = self.state.entry.status.isSrcValid;


    if(this.props.resId === null || this.state.entry === null) {
      return (<LoadingCell/>);
    } else {
      var isSrcModified= self.state.entry.status.isSrcModified;
      var cancelButton = null, saveButton = null;

      var info = (
        <OverlayTrigger placement='top'
          rootClose
          overlay={<Tooltip id='src-info'>{self.props.info}</Tooltip>}>
          <Icon className="cpri" name="info"/>
        </OverlayTrigger>);

      if(isSrcModified) {
        cancelButton = (<Button className='ml1/4' onClick={self._handleCancel}>Cancel</Button>);
        if(newEntryCell && canAddNewEntry && isSrcValid) {
          saveButton = (<Button kind='primary' className='ml1/4' onClick={self._handleSave}>Save</Button>);
        }
      }
      if (newEntryCell && canAddNewEntry) {
        if(isSrcModified) {
          return (<div>
            {saveButton}
            {cancelButton}
          </div>)
        } else {
          return (<div></div>)
        }
      } else if(self.state.entry.status.isSaving === true) {
        return (<div>{info} <Button kind='primary' className="ml1/4" loading>Update</Button></div>);
      } else {
        var deleteButton = null,
          updateButton = null,
          buttonVisibleClass = '';

        //if row focused or hovered
        if(self.state.isFocused) {
          buttonVisibleClass = 'is--active';
        }

        if(canAddNewEntry && self.state.isFocused) {
          deleteButton = (
            <Button kind="danger" className='ml1/4' onClick={self._handleDelete}>
              <Icon name="trash"/> <span>Delete</span>
            </Button>);
        }

        if(isSrcModified && this.props.canUpdateEntry && isSrcValid) {
          updateButton = (<Button kind='primary' className="ml1/4" onClick={self._handleUpdate}>Update</Button>);
        }

        if(isSrcModified) {
          return (<div>
            {info}
            {updateButton}
            {cancelButton}
            {deleteButton}
            </div>)
        } else {
          return (<div>{info} {deleteButton}</div>)
        }
      }
    }
  }
});

export default SourceActionCell;
import React from 'react';
import {PureRenderMixin} from 'react/addons';
import { Icon, Tooltip, OverlayTrigger } from 'zanata-ui';
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
      this.setState({entry: GlossaryStore.getEntry(this.props.resId)});
    }
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
      isSrcValid = this.state.entry.status.isSrcValid;

    if(this.props.resId === null || this.state.entry === null) {
      return (<LoadingCell/>);
    } else {
      var isSrcModified= this.state.entry.status.isSrcModified;
      var cancelButton = null, saveButton = null;

      var info = (<OverlayTrigger placement='top'
        trigger='click' rootClose
        overlay={<Tooltip id='src-info'>{this.props.info}</Tooltip>}>
        <Icon name="info"/>
      </OverlayTrigger>);

      if(isSrcModified) {
        cancelButton = (<button className='cpri' onClick={self._handleCancel}>Cancel</button>);
        if(newEntryCell && canAddNewEntry && isSrcValid) {
          saveButton = (<button className='cwhite bgcpri bdrs pv1/4 ph1/2 mr1/2' onClick={self._handleSave}>Save</button>);
        }
      }

      if (newEntryCell && canAddNewEntry) {
        if(isSrcModified) {
          return (<div>
            {info}
            {saveButton}
            {cancelButton}
          </div>)
        } else {
          return (<div></div>)
        }
      } else {
        var deleteButton = null, updateButton = null;
        if(canAddNewEntry) {
          deleteButton = (<button className='cdanger pv1/4 ph1/2 mr1/2' onClick={self._handleDelete}>
            <Icon name="trash"/> <span>Delete</span>
          </button>);
        }

        if(isSrcModified && this.props.canUpdateEntry && isSrcValid) {
          updateButton = (<button className='cwhite bgcpri bdrs pv1/4 ph1/2 mr1/2' onClick={self._handleUpdate}>Update</button>);
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
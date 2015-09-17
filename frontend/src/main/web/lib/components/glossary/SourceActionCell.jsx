import React from 'react';
import {PureRenderMixin} from 'react/addons';
import { Icon } from 'zanata-ui';
import Actions from '../../actions/GlossaryActions';
import LoadingCell from './LoadingCell'
import GlossaryStore from '../../stores/GlossaryStore';
import _ from 'lodash';

var SourceActionCell = React.createClass({
  propTypes: {
    resId: React.PropTypes.string.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    srcLocaleId: React.PropTypes.string.isRequired,
    newEntryCell: React.PropTypes.bool,
    canAddNewEntry: React.PropTypes.bool,
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
      canAddNewEntry = this.props.canAddNewEntry;
    if(this.props.resId === null || this.state.entry === null) {
      return (<LoadingCell/>);
    } else {
      var isSrcModified= this.state.entry.modified.source;
      var cancelButton =
        (<button className='cpri' onClick={self._handleCancel}>Cancel</button>);

      if (newEntryCell && canAddNewEntry) {
        if(isSrcModified) {
          return (<div>
            <button className='cwhite bgcpri bdrs pv1/4 ph1/2 mr1/2' onClick={self._handleSave}>Save</button>
            {cancelButton}
          </div>)
        } else {
          return (<div></div>)
        }
      } else {
        var deleteButton = (<button className='cdanger pv1/4 ph1/2 mr1/2' onClick={self._handleDelete}>
          <Icon name="trash"/>
          <span className='sronly'>Delete</span>
        </button>);
        if(isSrcModified) {
          return (<div>
            <button className='cwhite bgcpri bdrs pv1/4 ph1/2 mr1/2' onClick={self._handleUpdate}>Update</button>
            {cancelButton}
            {deleteButton}
            </div>)
        } else {
          return (<div>{deleteButton}</div>)
        }
      }
    }
  }
});

export default SourceActionCell;
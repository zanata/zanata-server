import React from 'react';
import {PureRenderMixin} from 'react/addons';
import Actions from '../../actions/GlossaryActions';
import LoadingCell from './LoadingCell'
import GlossaryStore from '../../stores/GlossaryStore';

var ActionCell = React.createClass({
  propTypes: {
    resId: React.PropTypes.string.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    srcLocaleId: React.PropTypes.string.isRequired,
    newEntryCell: React.PropTypes.bool,
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
    this.setState({entry:GlossaryStore.getEntry(this.props.resId)});
  },

  _handleSave: function(resId) {
    Actions.createGlossary(resId);
  },

  _handleUpdate: function(resId) {
    Actions.updateGlossary(resId);
  },

  _handleDelete: function(resId) {
    Actions.deleteGlossary(resId, this.props.srcLocaleId);
  },

  render: function() {
    var resId = this.props.resId, rowIndex = this.props.rowIndex,
      newEntryCell  = this.props.newEntryCell;
    if(resId === null || this.state.entry === null) {
      return (<LoadingCell/>);
    } else {
      var self = this, entry = this.state.entry;
      console.info(this.state);
      return (<div>{resId}, {rowIndex}</div>);
    }
    //} else {
    //  var self = this, entry = this.state.entry;
    //  var cancelButton = (<button className='cpri' onClick={self.props.onCancel(resId, rowIndex)}>Cancel</button>);
    //
    //  if (newEntryCell) {
    //    return (<div>
    //      <button className='cwhite bgcpri bdrs pv1/4 ph1/2 mr1/2' onClick={self._handleSave.bind(self,
    //        resId)}>Save</button>
    //            {cancelButton}
    //    </div>)
    //  } else if (this.props.canUpdateEntry) {
    //    return (<div>
    //      <button className='cwhite bgcpri bdrs pv1/4 ph1/2 mr1/2' onClick={self._handleDelete.bind(self,
    //        resId)}>Delete</button>
    //      <button className='cwhite bgcpri bdrs pv1/4 ph1/2 mr1/2' onClick={self._handleUpdate.bind(self,
    //        resId)}>Update</button>
    //            {cancelButton}
    //    </div>)
    //  } else {
    //    return (<div></div>)
    //  }
    //}
  }
});

export default ActionCell;
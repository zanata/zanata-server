import React from 'react';
import {PureRenderMixin} from 'react/addons';
import { Icon } from 'zanata-ui';
import Actions from '../../actions/GlossaryActions';
import LoadingCell from './LoadingCell'
import GlossaryStore from '../../stores/GlossaryStore';
import _ from 'lodash';

var ActionCell = React.createClass({
  propTypes: {
    resId: React.PropTypes.string.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
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

  _handleUpdate: function() {
    Actions.updateGlossary(this.props.resId);
  },

  _handleCancel: function() {
    if(this.props.onCancel) {
      this.props.onCancel(this.props.resId, this.props.rowIndex);
    }
  },

  render: function () {
    var self = this;

    if (this.props.resId === null || this.state.entry === null) {
      return (<LoadingCell/>);
    } else {
      var isTransModified = this.state.entry.modified.trans,
        commentButton = (<button className='cpri mr1/2'><Icon name='comment'></Icon></button>);

      if(isTransModified) {
        return (
          <div>
            {commentButton}
            <button className='cwhite bgcpri bdrs pv1/4 ph1/2 mr1/2'onClick={self._handleUpdate}>Update</button>
            <button className='cpri' onClick={self._handleCancel}>Cancel</button>
          </div>
        );
      } else {
        return (<div>{commentButton}</div>);
      }
    }
  }
});

export default ActionCell;
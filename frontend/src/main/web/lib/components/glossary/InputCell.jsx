import React from 'react';
import {PureRenderMixin} from 'react/addons';
import {Input} from 'zanata-ui';
import StringUtils from '../../utils/StringUtils';
import Actions from '../../actions/GlossaryActions';
import GlossaryStore from '../../stores/GlossaryStore';
import _ from 'lodash';

var InputCell = React.createClass({
  propTypes: {
    resId: React.PropTypes.string.isRequired,
    field: React.PropTypes.string.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    placeholder: React.PropTypes.string,
    onFocusCallback: React.PropTypes.func,
    onBlurCallback: React.PropTypes.func
  },

  TIMEOUT: 100,

  getInitialState: function() {
    return this._getState();
  },

  _getState: function() {
    var entry = GlossaryStore.getEntry(this.props.resId),
      value = _.get(entry, this.props.field),
      focusedRow = GlossaryStore.getFocusedRow(),
      isFocused = focusedRow && (focusedRow.rowIndex === this.props.rowIndex);

    return {
      value: value,
      isFocused : isFocused,
      timeout: null
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

  _onValueChange : function(event) {
    var self = this,
      value = event.target.value;
    this.setState({value: value});
    if(this.state.timeout !== null) {
      clearTimeout(this.state.timeout);
    }
    this.state.timeout = setTimeout(function() {
      Actions.updateEntryField(self.props.resId, self.props.field, value);
    }, this.TIMEOUT);
  },

  _onFocus: function(event) {
    if(this.props.onFocusCallback) {
      this.props.onFocusCallback(event, this.props.rowIndex);
    }
  },

  _onBlur: function(event) {
    if(this.props.onBlurCallback) {
      this.props.onBlurCallback(event, this.props.rowIndex);
    }
  },

  //handle reset from the input
  _onReset: function () {
    this.setState({value: this.props.value});
    Actions.updateEntryField(this.props.resId, this.props.field, this.props.value);
  },

  render: function() {
    return (
      <div>
        <span className='cdtargetn mh1/2'>{this.state.value}</span>
        <Input
          className='cdtargetib'
          margin='mh1/8'
          border='outline'
          label={this.props.field}
          hideLabel
          value={this.state.value}
          placeholder={this.props.placeholder}
          onChange={this._onValueChange}
          onFocus={this._onFocus}
          onReset={this._onReset}
          onBlur={this._onBlur}
        />
      </div>
    );
  }
});

export default InputCell;

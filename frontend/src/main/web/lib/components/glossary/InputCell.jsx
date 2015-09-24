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
    onFocusCallback: React.PropTypes.func
  },

  TIMEOUT: 100,

  getInitialState: function() {
    return this._getState();
  },

  _getState: function() {
    var entry = GlossaryStore.getEntry(this.props.resId),
      value = _.get(entry, this.props.field),
      focusedRow = GlossaryStore.getFocusedRow(),
      isFocused = focusedRow ? (focusedRow.rowIndex === this.props.rowIndex) : false;

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
    this.setState(this._getState());
  },

  _onValueChange : function(event) {
    var self = this,
      value = event.target.value;
    if(this.state.timeout !== null) {
      clearTimeout(this.state.timeout);
    }
    this.state.timeout = setTimeout(function() {
      Actions.updateEntryField(self.props.resId, self.props.field, value);
    }, self.TIMEOUT);
  },

  _onFocus: function(event) {
    if(this.props.onFocusCallback) {
      this.props.onFocusCallback(event, this.props.rowIndex);
    }
  },

  //handle reset from the input
  _handleReset: function () {
    Actions.resetEntry(this.props.resId);
  },

  render: function() {
    var outlineClass = this.state.isFocused === true ? 'outline' : 'none';
    return (<Input
      reset
      border={outlineClass}
      label={this.props.field}
      hideLabel
      value={this.state.value}
      placeholder={this.props.placeholder}
      onChange={this._onValueChange}
      onFocus={this._onFocus}
    />);
  }
});

export default InputCell;
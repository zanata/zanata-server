import React from 'react';
import {PureRenderMixin} from 'react/addons';

var TextInput = React.createClass({
  propTypes: {
    value: React.PropTypes.string,
    id: React.PropTypes.string.isRequired,
    field: React.PropTypes.string.isRequired,
    placeholder: React.PropTypes.string,
    title: React.PropTypes.string,
    onChangeCallback: React.PropTypes.func
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      value: this.props.value
    };
  },

  reset: function () {
    this._setValue(this.props.value);
  },

  _handleValueChange: function (event) {
    this._setValue(event.target.value);
  },

  _handleKeyDown: function (event) {
    if(event.key == 'Escape') {
      this.reset();
    }
  },

  _setValue: function (value) {
    if(this.props.onChangeCallback) {
      this.props.onChangeCallback(this, value);
    }
    this.setState({value: value});
  },

  render: function() {
    var self = this,
      readOnly = self.props.readOnly;

    if(readOnly) {
      return (<span title={this.props.title}>{this.state.value}</span>)
    } else {
      return (<input type="text" placeholder={this.props.placeholder}
        onChange={this._handleValueChange}
        onKeyDown={this._handleKeyDown}
        value={this.state.value}></input>)
    }
  }
});

export default TextInput;
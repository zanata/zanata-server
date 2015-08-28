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

  reset: function () {
    console.info('reset');
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      value: this.props.value
    };
  },

  _handleValueChange: function (event) {
    if(this.props.onChangeCallback) {
      this.props.onChangeCallback(this.props.id, this.props.field, event.target.value);
    }
    this.setState({value: event.target.value});
  },

  render: function() {
    var self = this,
      readOnly = self.props.readOnly;

    if(readOnly) {
      return (<span title={this.props.title}>{this.state.value}</span>)
    } else {
      return (<input type="text" placeholder={this.props.placeholder} onChange={this._handleValueChange} value={this.state.value}></input>)
    }
  }
});

export default TextInput;
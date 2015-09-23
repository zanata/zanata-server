import React from 'react';
import {Input} from 'zanata-ui';
import StringUtils from '../../utils/StringUtils'

var TextInput = React.createClass({
  propTypes: {
    value: React.PropTypes.string,
    id: React.PropTypes.string.isRequired,
    resId: React.PropTypes.string,
    field: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    rowIndex: React.PropTypes.number,
    onChangeCallback: React.PropTypes.func,
    onFocusCallback: React.PropTypes.func,
    onBlurCallback: React.PropTypes.func
  },

  TIMEOUT: 100,

  getInitialState: function() {
    return {
      value: this.props.value,
      timeout: null
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

  _handleOnFocus: function (event) {
    if(this.props.onFocusCallback) {
      this.props.onFocusCallback(this, this.props.rowIndex);
    }
  },

  _handleOnBlur: function (event) {
    if(this.props.onBlurCallback) {
      this.props.onBlurCallback(this, this.props.rowIndex);
    }
  },

  _setValue: function (value) {
    var self = this;
    value = StringUtils.trimLeadingSpace(value);
    this.setState({value: value});
    if(this.state.timeout !== null) {
      clearTimeout(this.state.timeout);
    }
    this.state.timeout = setTimeout(function() {
      if(self.props.onChangeCallback) {
        self.props.onChangeCallback(self, value);
      }
    }, self.TIMEOUT);

  },

  render: function() {
    return (<input type="text" placeholder={this.props.placeholder}
      label={this.props.field}
      hideLabel
      className="db w100p"
      onFocus={this._handleOnFocus}
      onKeyDown={this._handleKeyDown}
      onBlur={this._handleOnBlur}
      onChange={this._handleValueChange}
      value={this.state.value}/>);
  }
});

export default TextInput;
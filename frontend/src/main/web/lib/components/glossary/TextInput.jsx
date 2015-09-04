import React from 'react';
import {PureRenderMixin} from 'react/addons';
import {Input} from 'zanata-ui';

var TextInput = React.createClass({
  propTypes: {
    value: React.PropTypes.string,
    id: React.PropTypes.string.isRequired,
    resId: React.PropTypes.string.isRequired,
    field: React.PropTypes.string.isRequired,
    placeholder: React.PropTypes.string,
    rowIndex: React.PropTypes.number,
    title: React.PropTypes.string,
    onChangeCallback: React.PropTypes.func,
    onFocusCallback: React.PropTypes.func,
    onBlurCallback: React.PropTypes.func
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
    if(this.props.onChangeCallback) {
      this.props.onChangeCallback(this, value);
    }
    this.setState({value: value});
  },

  render: function() {
    return (<Input type="text" placeholder={this.props.placeholder}
      label={this.props.field}
      hideLabel
      outline
      className="db w100p"
      onFocus={this._handleOnFocus}
      onBlur={this._handleOnBlur}
      onChange={this._handleValueChange}
      value={this.state.value}/>)
  }
});

export default TextInput;
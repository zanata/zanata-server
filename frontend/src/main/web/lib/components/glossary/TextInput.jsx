import React from 'react';
import {PureRenderMixin} from 'react/addons';
import {Input} from 'zanata-ui';
import StringUtils from '../../utils/StringUtils'

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
    onKeydownCallback: React.PropTypes.func,
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

  _handleKeyDown: function (event) {
    if(this.props.onKeydownCallback) {
      this.props.onKeydownCallback(this, event);
    }

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
    value = StringUtils.trimLeadingSpace(value);
    if(this.props.onChangeCallback) {
      this.props.onChangeCallback(this, value);
    }
    this.setState({value: value});
  },

  render: function() {
    //return (<Input type="text" placeholder={this.props.placeholder}
    //  label={this.props.field}
    //  hideLabel
    //  outline
    //  reset
    //  className="db w100p"
    //  onFocus={this._handleOnFocus}
    //  onKeyDown={this._handleKeyDown}
    //  onBlur={this._handleOnBlur}
    //  onChange={this._handleValueChange}
    //  value={this.state.value}/>)


    return (<input type="text" placeholder={this.props.placeholder}
      label={this.props.field}
      className="db w100p"
      onFocus={this._handleOnFocus}
      onKeyDown={this._handleKeyDown}
      onBlur={this._handleOnBlur}
      onChange={this._handleValueChange}
      value={this.state.value}/>)
  }
});

export default TextInput;
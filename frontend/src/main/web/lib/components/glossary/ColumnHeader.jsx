import React from 'react';
import {PureRenderMixin} from 'react/addons';

var ColumnHeader = React.createClass({
  propTypes: {
    ascending: React.PropTypes.bool.isRequired,
    value: React.PropTypes.string.isRequired,
    field: React.PropTypes.oneOf(['src_content', 'part_of_speech', 'desc', 'trans_count']),
    onClickCallback: React.PropTypes.func
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      ascending: this.props.ascending
    };
  },

  _handleOnClick: function (event) {
    var asc = !this.state.ascending;
    this.setState({ascending: asc});

    if(this.props.onClickCallback) {
      this.props.onClickCallback(this.props.field, asc);
    }
  },

  render: function() {
    var asc = this.state.ascending ? '+' : '-';
    return (<button className='csec' onClick={this._handleOnClick}>{asc + ' ' + this.props.value}</button>);
  }

});

export default ColumnHeader;
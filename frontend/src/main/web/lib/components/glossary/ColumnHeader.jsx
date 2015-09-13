import React from 'react';
import {PureRenderMixin} from 'react/addons';
import { Icon } from 'zanata-ui';

var ColumnHeader = React.createClass({
  propTypes: {
    sort: React.PropTypes.oneOf(['ascending', 'descending', null]),
    value: React.PropTypes.string.isRequired,
    field: React.PropTypes.oneOf(['src_content', 'part_of_speech', 'desc', 'trans_count']),
    onClickCallback: React.PropTypes.func
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      sort: this.props.sort
    };
  },

  _handleOnClick: function (event) {
    var asc = this.state.sort === "ascending" ? "descending" : "ascending";
    this.setState({sort: asc});

    if(this.props.onClickCallback) {
      this.props.onClickCallback(this.props.field, asc === 'ascending');
    }
  },

  render: function() {
    var sortIcon = null;

    if(this.state.sort !== null) {
      var asc = this.state.sort === 'descending' ? 'chevron-up' : 'chevron-down';
      sortIcon = (<Icon name={asc}/>);
    }
    return (<button className='csec fwsb' onClick={this._handleOnClick}>{this.props.value} {sortIcon}</button>);
  }

});

export default ColumnHeader;
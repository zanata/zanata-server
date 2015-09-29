import React from 'react';
import {PureRenderMixin} from 'react/addons';
import { Icon } from 'zanata-ui';

var ColumnHeader = React.createClass({
  propTypes: {
    sort: React.PropTypes.oneOf(['ascending', 'descending', null]),
    value: React.PropTypes.string.isRequired,
    allowSort: React.PropTypes.bool.isRequired,
    field: React.PropTypes.oneOf(['src_content', 'trans_content', 'part_of_speech', 'desc', 'trans_count']),
    onClickCallback: React.PropTypes.func
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      sort: this.props.sort
    };
  },

  _handleOnClick: function (event) {
    if(this.props.allowSort === true) {
      var asc = this.state.sort === "ascending" ? "descending" : "ascending";
      this.setState({sort: asc});

      if(this.props.onClickCallback) {
        this.props.onClickCallback(this.props.field, asc === 'ascending');
      }
    }
  },

  render: function() {
    var sortIcon = null;

    if(this.props.allowSort === true) {
      if(this.state.sort !== null) {
        var asc = this.state.sort === 'descending' ? 'chevron-up' : 'chevron-down';
        sortIcon = (<Icon name={asc}/>);
      }
      return (<button className='csec fwsb ph1/2' onClick={this._handleOnClick}>{this.props.value} {sortIcon}</button>);
    } else {
      return (<span className='csec ph1/2'>{this.props.value}</span>)
    }
  }

});

export default ColumnHeader;

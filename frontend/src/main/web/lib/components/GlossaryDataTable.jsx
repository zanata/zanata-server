import React from 'react';
import {PureRenderMixin} from 'react/addons';
import Actions from '../actions/GlossaryActions';
import {Table, Column} from 'fixed-data-table';
import StringUtils from '../utils/StringUtils'


var GlossaryDataTable = React.createClass({
  propTypes: {
    glossaryData: React.PropTypes.arrayOf(
      React.PropTypes.shape({
          srcTerm: React.PropTypes.shape({
            content: React.PropTypes.string.isRequired,
            locale: React.PropTypes.string.isRequired,
            resId: React.PropTypes.string.isRequired,
            reference: React.PropTypes.string,
            comments: React.PropTypes.arrayOf(React.PropTypes.string),
            lastModifiedDate: React.PropTypes.string,
            lastModifiedBy: React.PropTypes.string
          }).isRequired,
          transTerm: React.PropTypes.shape({
            content: React.PropTypes.string.isRequired,
            locale: React.PropTypes.string.isRequired,
            resId: React.PropTypes.string.isRequired,
            comments: React.PropTypes.arrayOf(React.PropTypes.string),
            lastModifiedDate: React.PropTypes.string,
            lastModifiedBy: React.PropTypes.string
          }).isRequired
        })
    ).isRequired,
    isGlossaryAdmin: React.PropTypes.bool.isRequired,
    isGlossarist: React.PropTypes.bool.isRequired,
    isAuthenticated: React.PropTypes.bool.isRequired,
    user: React.PropTypes.shape({
      username: React.PropTypes.string.isRequired,
      email: React.PropTypes.string.isRequired,
      name: React.PropTypes.string.isRequired,
      imageUrl: React.PropTypes.string.isRequired,
      languageTeams: React.PropTypes.string.isRequired
    }),
    selectedSrcLocale: React.PropTypes.string.isRequired,
    selectedTransLocale: React.PropTypes.string.isRequired
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      tbl_width: 1500,
      tbl_height: 500,
      row_height: 50,
      header_height: 50,
      columnWidth: {
        0: 200,
        1: 200
      }
    };
  },

  _renderTextArea: function (cellData) {
    return this._getTextArea(cellData, true);
  },

  _renderLabel: function (cellData) {
    return this._getTextArea(cellData, false);
  },

  _getTextArea: function (term, editable) {
    var title = "";
    if(!StringUtils.isEmptyOrNull(term.lastModifiedBy)
      || !StringUtils.isEmptyOrNull(term.lastModifiedDate)) {
      title = "last modified ";
      if(!StringUtils.isEmptyOrNull(term.lastModifiedBy)) {
        title += "by: " + term.lastModifiedBy;
      }
      if(!StringUtils.isEmptyOrNull(term.lastModifiedDate)) {
        title += "date: " + term.lastModifiedDate;
      }
    }
    if(!editable) {
      return (<span title={title}>{term.content}</span>);
    } else {
      return (<textarea title={title}>{term.content}</textarea>);
    }
  },

  _renderActions: function (entry) {
    return (<div><button>Save</button> <button>Cancel</button></div>)
  },

  render: function() {
    var isGlossaryAdmin = this.props.isGlossaryAdmin,
      isGlossarist = this.props.isGlossarist,
      isAuthenticated = this.props.isAuthenticated,
      data = this.props.glossaryData,
      rows = [];

    function rowGetter(rowIndex) {
      return rows[rowIndex];
    }

    _.forOwn(data, function (entry) {
      var rowData = [];

      rowData.push(entry.srcTerm); //src content
      rowData.push(entry.transTerm); //trans content
      rowData.push(entry);

      rows.push(rowData);
    });

    var dataTable = (<Table
      rowHeight={this.state.row_height}
      rowGetter={rowGetter}
      rowsCount={rows.length}
      width={this.state.tbl_width}
      height={this.state.tbl_height}
      headerHeight={this.state.header_height} >
      <Column
        label="Source"
        width={this.state.columnWidth['0']}
        dataKey={0}
        flexGrow={1}
        isResizable={false}
        cellRenderer={this._renderLabel}
      />
      <Column
        label="Translation"
        width={this.state.columnWidth['1']}
        dataKey={1}
        flexGrow={1}
        isResizable={false}
        cellRenderer={this._renderTextArea}
      />
      <Column
        label=""
        width={200}
        dataKey={2}
        isResizable={false}
        cellRenderer={this._renderActions}
      />

    </Table>);

    return (<div>{dataTable}</div>);
  }
});

export default GlossaryDataTable;

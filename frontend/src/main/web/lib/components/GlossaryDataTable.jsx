import React from 'react';
import {PureRenderMixin} from 'react/addons';
import Actions from '../actions/GlossaryActions';
import {Table, Column} from 'fixed-data-table';
import StringUtils from '../utils/StringUtils'
import DropDown from './DropDown';


var GlossaryDataTable = React.createClass({
  propTypes: {
    //glossaryData: React.PropTypes.arrayOf(
    //  React.PropTypes.shape({
    //      resId: React.PropTypes.string.isRequired,
    //      pos: React.PropTypes.string,
    //      description: React.PropTypes.string,
    //      srcTerm: React.PropTypes.shape({
    //        content: React.PropTypes.string.isRequired,
    //        locale: React.PropTypes.string.isRequired,
    //        reference: React.PropTypes.string,
    //        comment: React.PropTypes.string,
    //        lastModifiedDate: React.PropTypes.string,
    //        lastModifiedBy: React.PropTypes.string
    //      }).isRequired,
    //      transTerm: React.PropTypes.shape({
    //        content: React.PropTypes.string.isRequired,
    //        locale: React.PropTypes.string.isRequired,
    //        comment: React.PropTypes.string,
    //        lastModifiedDate: React.PropTypes.string,
    //        lastModifiedBy: React.PropTypes.string
    //      }).isRequired
    //    })
    //).isRequired,
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
    localeOptions: React.PropTypes.arrayOf(React.PropTypes.string),
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
      data: {}
    };
  },

  canAddNewEntry: function () {
    var isGlossaryAdmin = this.props.isGlossaryAdmin,
      isGlossarist = this.props.isGlossarist;

    return isGlossarist || isGlossaryAdmin;
  },

  canUpdateEntry: function () {
    var isGlossaryAdmin = this.props.isGlossaryAdmin,
      isGlossarist = this.props.isGlossarist;

    return isGlossarist || isGlossaryAdmin;
  },

  _generateTitle: function(term) {
    var title = "";
    if(!StringUtils.isEmptyOrNull(term.lastModifiedBy)
      || !StringUtils.isEmptyOrNull(term.lastModifiedDate)) {
      title = "Last updated ";
      if(!StringUtils.isEmptyOrNull(term.lastModifiedBy)) {
        title += "by: " + term.lastModifiedBy;
      }
      if(!StringUtils.isEmptyOrNull(term.lastModifiedDate)) {
        title += " " + term.lastModifiedDate;
      }
    }
    return title;
  },

  _renderSourceHeader: function (label) {
    return (<DropDown options={this.props.localeOptions} selectedOption={this.props.selectedSrcLocale} onClick={Actions.changeSrcLocale} />);
  },

  _renderSourceCell: function(resId, cellDataKey, rowData, rowIndex,
                              columnData, width) {
    var entry = this.getGlossaryEntry(resId);

    if(rowIndex == 0 && this.canAddNewEntry()) {
      return (<input type="text"></input>)
    } else {
      var term = entry.srcTerm,
        title = this._generateTitle(term);
        return (<span title={title}>{term.content}</span>)
    }
  },

  _renderTransHeader: function (label) {
    return (<span className="epsilon">{label}</span>);
  },

  _renderTransCell: function(resId, cellDataKey, rowData, rowIndex,
                              columnData, width) {
    var entry = this.getGlossaryEntry(resId);

    if(rowIndex == 0 && this.canAddNewEntry()) {
      return (<input type="text"></input>)
    } else {
      var term = entry.transTerm,
        title = this._generateTitle(term);
      if (this.canUpdateEntry()) {
        return (<input type="text" title={title} value={term.content}></input>);
      }
      return (<span title={term.content}>{term.content}</span>)
    }
  },

  _renderPosHeader: function (label) {
    return (<span className="epsilon">{label}</span>);
  },

  _renderPosCell: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var entry = this.getGlossaryEntry(resId);

    if(rowIndex == 0 && this.canAddNewEntry()) {
      return (<input type="text"></input>)
    } else if(this.canUpdateEntry()) {
      return (<input type="text" value={entry.pos}></input>);
    } else {
      return (<span title={entry.pos}>{entry.pos}</span>)
    }
  },

  _renderDescHeader: function (label) {
    return (<span className="epsilon">{label}</span>);
  },

  _handleDescChange: function (resId, event) {
    console.info(resId, event.target.value);
  },

  _renderDescCell: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var entry = this.getGlossaryEntry(resId), self = this;

    if(rowIndex == 0 && this.canAddNewEntry()) {
      return (<input type="text" onChange={this._handleDescChange.bind(self, resId)}></input>)
    } else if(this.canUpdateEntry()) {
      return (<input type="text" onChange={this._handleDescChange.bind(self, resId)} value={this.state.data[resId].description}></input>);
    } else {
      return (<span title={entry.description}>{entry.description}</span>)
    }
  },

  handleSave: function(entry) {
    console.info(entry);
  },

  handleUpdate: function(entry) {
    console.info(entry);
  },

  _renderActions: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var self = this;
    var entry = self.getGlossaryEntry(resId);

    if(rowIndex == 0 && this.canAddNewEntry()) {
      return (
        <div className="g l--pad-all-quarter txt--align-center">
          <div className="g__item w--1-2">
            <button onClick={self.handleSave.bind(self, entry)} className="button--primary">Save</button>
          </div>
          <div className="g__item w--1-2">
            <a>Cancel</a>
          </div>
        </div>);
    } else if(this.canUpdateEntry()) {
      return (
        <div className="g l--pad-all-quarter txt--align-center">
          <div className="g__item w--1-5">
            <a><i className="i i--comment"></i></a>
          </div>
          <div className="g__item w--1-3">
            <button onClick={self.handleUpdate.bind(self, entry)} className="button--primary">Update</button>
          </div>
          <div className="g__item w--1-3">
            <a>Cancel</a>
          </div>
        </div>)
    } else {
      return (<div></div>)
    }
  },

  _getSourceColumn: function() {
    return (<Column
      label=""
      width={150}
      dataKey={0}
      flexGrow={1}
      cellRenderer={this._renderSourceCell}
      headerRenderer={this._renderSourceHeader}
      />);
  },

  _getTransColumn: function() {
    return (<Column
      label="Translation"
      width={150}
      dataKey={0}
      flexGrow={1}
      cellRenderer={this._renderTransCell}
      headerRenderer={this._renderTransHeader}
      />);
  },

  _getPosColumn: function() {
    return (<Column
      label="Part of Speech"
      width={150}
      dataKey={0}
      cellRenderer={this._renderPosCell}
      headerRenderer={this._renderPosHeader}
      />);
  },

  _getDescColumn: function() {
    return (<Column
      label="Description"
      width={150}
      dataKey={0}
      cellRenderer={this._renderDescCell}
      headerRenderer={this._renderDescHeader}
      />);
  },

  _getActionColumn: function() {
    return (<Column
      label=""
      width={300}
      dataKey={0}
      isResizable={false}
      cellRenderer={this._renderActions}
      />)
  },

  getGlossaryEntry: function (resId) {
    return this.state.data[resId];
  },

  render: function() {
    var isAuthenticated = this.props.isAuthenticated, rows = [];

    this.state['data'] = this.props.glossaryData;

    function rowGetter(rowIndex) {
      return rows[rowIndex];
    }

    if(this.canAddNewEntry()) {
      var firstRowData = [];
      firstRowData.push("");
      rows.push(firstRowData);
    }

    _.forOwn(this.props.glossaryData, function(entry, key) {
      var rowData = [];
      rowData.push(key);
      rows.push(rowData);
    });

    var srcColumn = this._getSourceColumn(),
      transColumn = this._getTransColumn(),
      posColumn = this._getPosColumn(),
      descColumn = this._getDescColumn(),
      actionColumn = this._getActionColumn();

    var dataTable = (<Table
      rowHeight={this.state.row_height}
      rowGetter={rowGetter}
      rowsCount={rows.length}
      width={this.state.tbl_width}
      height={this.state.tbl_height}
      headerHeight={this.state.header_height} >
      {srcColumn}
      {transColumn}
      {posColumn}
      {descColumn}
      {actionColumn}
    </Table>);

    return (<div>{dataTable}</div>);
  }
});

export default GlossaryDataTable;

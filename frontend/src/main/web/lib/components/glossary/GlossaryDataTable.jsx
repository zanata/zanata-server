import React from 'react';
import {PureRenderMixin} from 'react/addons';
import Actions from '../../actions/GlossaryActions';
import {Table, Column} from 'fixed-data-table';
import StringUtils from '../../utils/StringUtils'
import TextInput from './TextInput';
import LoadingCell from './LoadingCell'
import ActionCell from './ActionCell'
import ColumnHeader from './ColumnHeader'
import _ from 'lodash';

var GlossaryDataTable = React.createClass({
  ENTRY: {
      SRC: {
        col: 1,
        field: 'srcTerm.content'
      },
      TRANS: {
        col: 2,
        field: 'transTerm.content'
      },
      POS: {
        col: 3,
        field: 'pos'
      },
      DESC: {
        col: 4,
        field: 'description'
      }
  },
  CELL_HEIGHT: 48,

  propTypes: {
    glossaryData: React.PropTypes.object.isRequired,
    glossaryResId: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(React.PropTypes.string)
    ),
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
    canAddNewEntry: React.PropTypes.bool.isRequired,
    canUpdateEntry: React.PropTypes.bool.isRequired,
    user: React.PropTypes.shape({
      username: React.PropTypes.string,
      email: React.PropTypes.string,
      name: React.PropTypes.string,
      imageUrl: React.PropTypes.string,
      languageTeams: React.PropTypes.string,
    }),
    srcLocale: React.PropTypes.shape({
      locale: React.PropTypes.shape({
        localeId: React.PropTypes.string.isRequired,
        displayName: React.PropTypes.string.isRequired,
        alias: React.PropTypes.string.isRequired
      }).isRequired,
      count: React.PropTypes.number.isRequired
    }).isRequired,
    selectedTransLocale: React.PropTypes.string.isRequired,
    totalCount: React.PropTypes.number.isRequired
  },

  mixins: [PureRenderMixin],

  getInitialState: function () {
    return {
      tbl_width: window.innerWidth - this.CELL_HEIGHT,
      tbl_height: window.innerHeight - 166,
      row_height: 48,
      header_height: 48,
      inputFields: {},
      timeout: null
    }
  },

  _generateTitle: function(term) {
    var title = "";
    if(!_.isUndefined(term) && !_.isNull(term)) {
      if (!StringUtils.isEmptyOrNull(term.lastModifiedBy)
          || !StringUtils.isEmptyOrNull(term.lastModifiedDate)) {
        title = "Last updated ";
        if (!StringUtils.isEmptyOrNull(term.lastModifiedBy)) {
          title += "by: " + term.lastModifiedBy;
        }
        if (!StringUtils.isEmptyOrNull(term.lastModifiedDate)) {
          title += " " + term.lastModifiedDate;
        }
      }
    }
    return title;
  },

  _generateKey: function (colIndex, rowIndex, resId) {
    return colIndex + ":" + rowIndex + ":" + resId
  },

  _renderHeaderLabel: function (label) {
    return (<span className='csec'>{label}</span>);
  },

  _renderSourceHeader: function (label) {
    var key = "src_content",
      asc = !_.isUndefined(this.props.sort[key]) ? this.props.sort[key] : true;

    return (<ColumnHeader value={this.props.srcLocale.locale.displayName}
      field={key}
      key={key}
      ascending={asc}
      onClickCallback={this._onHeaderClick}/>);
  },

  _renderPosHeader: function (label) {
    var key = "part_of_speech",
      asc = !_.isUndefined(this.props.sort[key]) ? this.props.sort[key] : true;
    return (<ColumnHeader value={label}
      field={key}
      key={key}
      ascending={asc}
      onClickCallback={this._onHeaderClick}/>);
  },

  _renderDescHeader: function (label) {
    var key = "desc",
      asc = !_.isUndefined(this.props.sort[key]) ? this.props.sort[key] : true;
    return (<ColumnHeader value={label}
      field={key}
      key={key}
      ascending={asc}
      onClickCallback={this._onHeaderClick}/>);
  },

  _onHeaderClick: function (field, ascending) {
    Actions.updateSortOrder(field, ascending);
  },

  _renderSourceCell: function(resId, cellDataKey, rowData, rowIndex,
                              columnData, width) {
    var key = this._generateKey(this.ENTRY.SRC.col, rowIndex, resId);

    if(resId === null) {
      return (<LoadingCell key={key}/>);
    } else {
      var entry = this._getGlossaryEntry(resId),
        term = entry.srcTerm,
        title = this._generateTitle(term);
      return <span title={title} key={key}>{term.content}</span>;
    }
  },

  _renderTransCell: function(resId, cellDataKey, rowData, rowIndex,
                              columnData, width) {
    var key = this._generateKey(this.ENTRY.TRANS.col, rowIndex, resId);
    if(resId === null) {
      return (<LoadingCell key={key}/>);
    } else {
      var entry = this._getGlossaryEntry(resId),
          term = entry.transTerm,
          title = this._generateTitle(term),
          readOnly = !this.props.canUpdateEntry;
      if(readOnly) {
        return <span title={title} key={key}>{term.content}</span>;
      } else {
        return (<TextInput value={term.content}
          placeholder="enter a translation"
          title={title}
          id={key}
          resId={resId}
          key={key}
          field={this.ENTRY.TRANS.field}
          onFocusCallback={this._onInputFocus}
          onBlurCallback={this._onInputBlur}
          onChangeCallback={this._onValueChange}/>);
      }
    }
  },

  _renderPosCell: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var key = this._generateKey(this.ENTRY.POS.col, rowIndex, resId);
    if(resId === null) {
      return (<LoadingCell key={key}/>)
    } else {
      var entry = this._getGlossaryEntry(resId);
      return <span key={key}>{entry.pos}</span>
    }
  },

  _renderDescCell: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var key = this._generateKey(this.ENTRY.DESC.col, rowIndex, resId);

    if(resId === null) {
      return (<LoadingCell key={key}/>);
    } else {
      var entry = this._getGlossaryEntry(resId);
      return <span key={key}>{entry.description}</span>;
    }
  },

  _onValueChange: function(inputField, value) {
    Actions.updateEntryField(inputField.props.resId, inputField.props.field, value);
    this.state.inputFields[inputField.props.id] = inputField;
  },

  /**
   * restore glossary entry to original value
   * @param resId
   * @param rowIndex
   */
  _handleCancel: function (resId, rowIndex) {
    var self = this;

    _.forOwn(this.ENTRY, function(value, key) {
      var key = self._generateKey(value.col, rowIndex, resId),
        input = self.state.inputFields[key];
      if(!_.isUndefined(input)) {
        input.reset();
      }
    });
  },

  _renderActions: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var self = this;

    if(resId === null) {
      return (<LoadingCell/>);
    } else if(!this.props.canUpdateEntry) {
      return (<div></div>)
    } else {
      return (
        <ActionCell resId={resId} rowIndex={rowIndex}onCancel={self._handleCancel}/>
      );
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
      headerRenderer={this._renderHeaderLabel}
      />);
  },

  _getPosColumn: function() {
    return (<Column
      label="Part of Speech"
      width={150}
      dataKey={0}
      cellClassName="tac"
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
      cellClassName="ph1/4"
      width={300}
      dataKey={0}
      isResizable={false}
      cellRenderer={this._renderActions}
      />)
  },

  _getGlossaryEntry: function (resId) {
    return this.props.glossaryData[resId];
  },

  _rowGetter: function(rowIndex) {
    var self = this,
      row = self.props.glossaryResId[rowIndex];
    if(row === null) {
      if(this.state.timeout !== null) {
        clearTimeout(this.state.timeout);
      }
      this.state.timeout = setTimeout(function() {
        Actions.loadGlossary(rowIndex);
      }, 500);
      return [null];
    } else {
      return row;
    }
  },

  _rowClassNameGetter: function (rowIndex) {
    if(rowIndex == this.state.focusedRow) {
      return 'bgcsec10';
    }
  },

  _onRowClick: function (event, rowIndex) {
    this.setState({focusedRow: rowIndex});
  },

  _onInputFocus: function (input, rowIndex) {
    this.setState({focusedRow: rowIndex});
  },

  _onInputBlur: function (input, rowIndex) {
    this.setState({focusedRow: -1});
  },

  render: function() {
    var srcColumn = this._getSourceColumn(),
      transColumn = this._getTransColumn(),
      posColumn = this._getPosColumn(),
      descColumn = this._getDescColumn(),
      actionColumn = this._getActionColumn();

    var dataTable = (<Table
      onRowClick={this._onRowClick}
      rowHeight={this.CELL_HEIGHT}
      rowGetter={this._rowGetter}
      rowClassNameGetter={this._rowClassNameGetter}
      rowsCount={this.props.totalCount}
      width={this.state.tbl_width}
      height={this.state.tbl_height}
      headerHeight={this.CELL_HEIGHT} >
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

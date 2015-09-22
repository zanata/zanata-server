import React from 'react';
import {PureRenderMixin} from 'react/addons';
import Actions from '../../actions/GlossaryActions';
import {Table, Column} from 'fixed-data-table';
import StringUtils from '../../utils/StringUtils'
import TextInput from './TextInput';
import LoadingCell from './LoadingCell'
import ActionCell from './ActionCell'
import SourceActionCell from './SourceActionCell'
import ColumnHeader from './ColumnHeader'
import _ from 'lodash';

var DataTable = React.createClass({
  TIMEOUT: 400,

  ENTRY: {
    SRC: {
      col: 1,
      field: 'srcTerm.content',
      sort_field: 'src_content'
    },
    TRANS: {
      col: 2,
      field: 'transTerm.content',
      sort_field: 'trans_content'
    },
    POS: {
      col: 3,
      field: 'pos',
      sort_field: 'part_of_speech'
    },
    DESC: {
      col: 4,
      field: 'description',
      sort_field: 'desc'
    },
    TRANS_COUNT: {
      col: 5,
      field: 'termsCount',
      sort_field: 'trans_count'
    }
  },
  CELL_HEIGHT: 48,

  propTypes: {
    glossaryData: React.PropTypes.object.isRequired,
    glossaryResId: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(React.PropTypes.string)
    ),
    canAddNewEntry: React.PropTypes.bool.isRequired,
    canUpdateEntry: React.PropTypes.bool.isRequired,
    user: React.PropTypes.shape({
      username: React.PropTypes.string,
      email: React.PropTypes.string,
      name: React.PropTypes.string,
      imageUrl: React.PropTypes.string,
      languageTeams: React.PropTypes.string
    }),
    srcLocale: React.PropTypes.shape({
      locale: React.PropTypes.shape({
        localeId: React.PropTypes.string.isRequired,
        displayName: React.PropTypes.string.isRequired,
        alias: React.PropTypes.string.isRequired
      }).isRequired,
      numberOfTerms: React.PropTypes.number.isRequired
    }),
    selectedTransLocale: React.PropTypes.string,
    totalCount: React.PropTypes.number.isRequired,
    focusedRow: React.PropTypes.shape({
      resId: React.PropTypes.string,
      rowIndex: React.PropTypes.number
    }),
    hoveredRow: React.PropTypes.shape({
      resId: React.PropTypes.string,
      rowIndex: React.PropTypes.number
    })
  },

  getInitialState: function () {
    return {
      tbl_width: window.innerWidth - this.CELL_HEIGHT,
      tbl_height: window.innerHeight - 166,
      row_height: this.CELL_HEIGHT,
      header_height: this.CELL_HEIGHT,
      inputFields: {},
      hoverTimeout: null
    }
  },

  _generateTermInfo: function(term) {
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
    if(StringUtils.isEmptyOrNull(title)) {
      title = "No information available";
    }
    return title;
  },

  _generateKey: function (colIndex, rowIndex, resId) {
    return colIndex + ":" + rowIndex + ":" + resId + ":" + this.props.selectedTransLocale;
  },

  _getSort: function (key) {
    if(_.isUndefined(this.props.sort[key])) {
      return null;
    } else if(this.props.sort[key] === true) {
      return "ascending";
    } else {
      return "descending";
    }
  },

  _renderSourceHeader: function (label) {
    var key = this.ENTRY.SRC.sort_field, asc = this._getSort(key);
    return this._renderHeader(label, key, asc, true);
  },

  _renderTransHeader: function (label) {
    var key = this.ENTRY.TRANS.sort_field, asc = null;
    return this._renderHeader(label, key, asc, false);
  },

  _renderPosHeader: function (label) {
    var key = this.ENTRY.POS.sort_field, asc = this._getSort(key);
    return this._renderHeader(label, key, asc, true);
  },

  _renderDescHeader: function (label) {
    var key = this.ENTRY.DESC.sort_field, asc = this._getSort(key);
    return this._renderHeader(label, key, asc, true);
  },

  _renderTransCountHeader: function (label) {
    var key = this.ENTRY.TRANS_COUNT.sort_field, asc = this._getSort(key);
    return this._renderHeader(label, key, asc, true);
  },

  _renderHeader: function (label, key, asc, allowSort) {
    return (<ColumnHeader value={label}
      field={key}
      key={key}
      allowSort={allowSort}
      sort={asc}
      onClickCallback={this._onHeaderClick}/>);
  },

  _onHeaderClick: function (field, ascending) {
    Actions.updateSortOrder(field, ascending);
  },

  _renderCell: function (resId, rowIndex, field, readOnly, placeholder) {
    var key = this._generateKey(field.col, rowIndex, resId);
    if (resId === null) {
      return (<LoadingCell key={key}/>)
    } else {
      var entry = this._getGlossaryEntry(resId);
      var value = _.get(entry, field.field);

      if (readOnly) {
        return (<span key={key}>{value}</span>)
      } else {
        return (<TextInput value={value}
          placeholder={placeholder}
          id={key}
          rowIndex={rowIndex}
          resId={resId}
          key={key}
          field={field.field}
          onChangeCallback={this._onValueChange}/>)
      }
    }
  },

  _renderSourceCell: function (resId, cellDataKey, rowData, rowIndex,
                               columnData, width) {
    var readOnly = !(rowIndex === 0 && this.props.canAddNewEntry) || this._isTranslationSelected(),
      placeholder = 'enter a new term';
    return this._renderCell(resId, rowIndex, this.ENTRY.SRC, readOnly, placeholder);
  },

  _renderTransCell: function(resId, cellDataKey, rowData, rowIndex,
                             columnData, width) {
    var readOnly = !this.props.canUpdateEntry,
      placeholder = 'enter a translation';
    return this._renderCell(resId, rowIndex, this.ENTRY.TRANS, readOnly, placeholder);
  },

  _renderPosCell: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var readOnly = !this.props.canUpdateEntry || this._isTranslationSelected(),
      placeholder = 'enter part of speech';
    return this._renderCell(resId, rowIndex, this.ENTRY.POS, readOnly, placeholder);
  },

  _renderDescCell: function (resId, cellDataKey, rowData, rowIndex,
                             columnData, width) {
    var readOnly = !this.props.canUpdateEntry || this._isTranslationSelected(),
      placeholder = 'enter description';
    return this._renderCell(resId, rowIndex, this.ENTRY.DESC, readOnly, placeholder);
  },

  _renderTransCountCell: function (resId, cellDataKey, rowData, rowIndex,
                              columnData, width) {
    var readOnly = true, placeholder = '';
    return this._renderCell(resId, rowIndex, this.ENTRY.TRANS_COUNT, readOnly, placeholder);
  },

  _renderActionCell: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var self = this;

    if(resId === null) {
      return (<LoadingCell/>);
    } else if(!self.props.canUpdateEntry && !self.props.canAddNewEntry) {
      return (<div></div>);
    }

    var entry = this._getGlossaryEntry(resId);

    if(self._isTranslationSelected()) {
      var info = self._generateTermInfo(entry.transTerm);

      return (
        <ActionCell info={info}
          canUpdateEntry={self.props.canUpdateEntry}
          resId={resId}
          rowIndex={rowIndex}
          onCancel={self._handleCancel}/>
      );
    } else {
      var isNewEntryCell = rowIndex === 0,
        info = self._generateTermInfo(entry.srcTerm);
      return (
        <SourceActionCell resId={resId} rowIndex={rowIndex}
          srcLocaleId={self.props.srcLocale.locale.localeId}
          newEntryCell={isNewEntryCell}
          info={info}
          canUpdateEntry={self.props.canUpdateEntry}
          canAddNewEntry={self.props.canAddNewEntry}
          onCancel={self._handleCancel}/>
      );
    }
  },

  _isTranslationSelected: function () {
    return !StringUtils.isEmptyOrNull(this.props.selectedTransLocale);
  },

  _getSourceColumn: function() {
    var self = this, srcLocaleName = "";
    if(!_.isUndefined(this.props.srcLocale) && !_.isNull(this.props.srcLocale)) {
      srcLocaleName = this.props.srcLocale.locale.displayName;
    }
    return (<Column
      label={srcLocaleName}
      key={self.ENTRY.SRC.field}
      width={150}
      dataKey={0}
      flexGrow={1}
      cellRenderer={this._renderSourceCell}
      headerRenderer={this._renderSourceHeader}
      />);
  },

  _getTransColumn: function() {
    var self = this;
    return (<Column
      label="Translations"
      key={self.ENTRY.TRANS.field}
      width={150}
      dataKey={0}
      flexGrow={1}
      cellRenderer={this._renderTransCell}
      headerRenderer={this._renderTransHeader}
      />);
  },

  _getPosColumn: function() {
    var self = this;
    return (<Column
      label="Part of Speech"
      key={self.ENTRY.POS.field}
      width={150}
      dataKey={0}
      cellRenderer={this._renderPosCell}
      headerRenderer={this._renderPosHeader}
      />);
  },

  _getDescColumn: function() {
    var self = this;
    return (<Column
      label="Description"
      key={self.ENTRY.DESC.field}
      width={150}
      flexGrow={1}
      dataKey={0}
      cellRenderer={this._renderDescCell}
      headerRenderer={this._renderDescHeader}
      />);
  },

  _getTransCountColumn: function() {
    var self = this;
    return (<Column
      label="Translations"
      key={self.ENTRY.TRANS_COUNT.field}
      width={120}
      cellClassName="tac"
      dataKey={0}
      cellRenderer={this._renderTransCountCell}
      headerRenderer={this._renderTransCountHeader}
      />);
  },

  _getActionColumn: function() {
    return (<Column
      label=""
      key="Actions"
      cellClassName="ph1/4"
      width={300}
      dataKey={0}
      isResizable={false}
      cellRenderer={this._renderActionCell}
      />)
  },

  _onValueChange: function(inputField, value) {
    Actions.updateEntryField(inputField.props.resId, inputField.props.field, value);
    this.state.inputFields[inputField.props.id] = inputField;
  },

  _onRowMouseEnter: function (event, rowIndex) {
    var resId = this._rowGetter(rowIndex)[0];
    if(this.props.hoveredRow) {
      if(this.props.hoveredRow.rowIndex !== rowIndex) {
        this._updateHoverRow(resId, rowIndex);
      }
    } else {
      this._updateHoverRow(resId, rowIndex);
    }
  },

  _updateHoverRow: function (resId, rowIndex) {
    if (this.state.hoverTimeout !== null) {
      clearTimeout(this.state.hoverTimeout);
    }
    this.state.hoverTimeout = setTimeout(function () {
      Actions.updateHoveredRow(resId, rowIndex);
    }, 90);
  },

  _onRowClick: function (event, rowIndex) {
    var resId = this._rowGetter(rowIndex)[0];
    if(this.props.focusedRow) {
      if(this.props.focusedRow.rowIndex !== rowIndex) {
        Actions.updateFocusedRow(resId, rowIndex);
      }
    } else {
      Actions.updateFocusedRow(resId, rowIndex);
    }
  },

  _rowClassNameGetter: function (rowIndex) {
    if(this.props.focusedRow && this.props.focusedRow.rowIndex === rowIndex) {
      return 'bgcsec30a';
    } else if(this.props.hoveredRow && this.props.hoveredRow.rowIndex === rowIndex) {
      return 'bgcsec20a';
    }
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
      }, self.TIMEOUT);
      return [null];
    } else {
      return row;
    }
  },

  render: function() {
    var self = this, columns = [];
    columns.push(self._getSourceColumn());
    if(this._isTranslationSelected()) {
      columns.push(self._getTransColumn());
    }
    columns.push(self._getPosColumn());
    columns.push(self._getDescColumn());
    if(!self._isTranslationSelected()) {
      columns.push(self._getTransCountColumn());
    }
    columns.push(self._getActionColumn());

    var dataTable = (<Table
      onRowClick={self._onRowClick}
      onRowMouseEnter={self._onRowMouseEnter}
      rowClassNameGetter={self._rowClassNameGetter}
      rowHeight={self.CELL_HEIGHT}
      rowGetter={self._rowGetter}
      rowsCount={self.props.totalCount}
      width={self.state.tbl_width}
      height={self.state.tbl_height}
      headerHeight={self.CELL_HEIGHT}>
      {columns}
    </Table>);

    return (<div>{dataTable}</div>);
  }
});

export default DataTable;
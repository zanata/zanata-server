import React from 'react';
import {PureRenderMixin} from 'react/addons';
import Actions from '../../actions/GlossaryActions';
import {Table, Column} from 'fixed-data-table';
import StringUtils from '../../utils/StringUtils'
import InputCell from './InputCell';
import LoadingCell from './LoadingCell'
import ActionCell from './ActionCell'
import SourceActionCell from './SourceActionCell'
import ColumnHeader from './ColumnHeader'
import {Loader} from 'zanata-ui';
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
    })
  },

  getInitialState: function () {
    var top = 246;
    return {
      tbl_width: this._getWidth(),
      tbl_height: this._getHeight(top),
      row_height: this.CELL_HEIGHT,
      header_height: this.CELL_HEIGHT,
      hoveredRow: -1
    }
  },

  _getHeight: function(fixedTop) {
    var footer = window.document.getElementById("footer");
    var footerHeight = footer ? footer.clientHeight : 0;
    var top = _.isUndefined(fixedTop) ? React.findDOMNode(this).offsetTop: fixedTop;
    var newHeight = window.innerHeight - footerHeight - top;

    //minimum height 250px
    newHeight = newHeight < 250 ? 250 : newHeight;
    return newHeight;
  },

  _getWidth: function () {
    return window.innerWidth - 48;
  },

  _handleResize: function(e) {
    this.setState({tbl_height: this._getHeight(), tbl_width: this._getWidth()});
  },

  componentDidMount: function() {
    window.addEventListener('resize', this._handleResize);
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this._handleResize);
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
    var key = colIndex + ":" + rowIndex + ":" + resId;
    if(this.props.selectedTransLocale) {
      key += ":" + this.props.selectedTransLocale;
    }
    return key;
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
        return (<span className="mh1/2" key={key}>{value}</span>)
      } else {
        return (<InputCell
          value={value}
          resId={resId}
          key={key}
          placeholder={placeholder}
          rowIndex={rowIndex}
          field={field.field}
          onBlurCallback={this._onRowBlur}
          onFocusCallback={this._onRowClick}/>);
      }
    }
  },

  _renderSourceCell: function (resId, cellDataKey, rowData, rowIndex,
                               columnData, width) {
    return this._renderCell(resId, rowIndex, this.ENTRY.SRC, true, '');
  },

  _renderTransCell: function(resId, cellDataKey, rowData, rowIndex,
                             columnData, width) {
    var readOnly = !this.props.canUpdateEntry, placeholder = 'enter a translation';
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
    return this._renderCell(resId, rowIndex, this.ENTRY.TRANS_COUNT, true, '');
  },

  _renderActionCell: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var self = this;
    if(resId === null) {
      return (<LoadingCell/>);
    } else if(!self.props.canUpdateEntry && !self.props.canAddNewEntry) {
      return null;
    }
    var entry = self._getGlossaryEntry(resId);
    if(self._isTranslationSelected()) {
      var info = self._generateTermInfo(entry.transTerm);
      return (
        <ActionCell info={info}
          canUpdateEntry={self.props.canUpdateEntry}
          resId={resId}
          rowIndex={rowIndex}/>
      );
    } else {
      var info = self._generateTermInfo(entry.srcTerm);
      return (
        <SourceActionCell resId={resId} rowIndex={rowIndex}
          srcLocaleId={self.props.srcLocale.locale.localeId}
          info={info}
          canUpdateEntry={self.props.canUpdateEntry}
          canDeleteEntry={self.props.canAddNewEntry}/>
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
      cellRenderer={self._renderSourceCell}
      headerRenderer={self._renderSourceHeader}
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
      cellRenderer={self._renderTransCell}
      headerRenderer={self._renderTransHeader}
      />);
  },

  _getPosColumn: function() {
    var self = this;
    return (<Column
      label="Part of Speech"
      key={self.ENTRY.POS.field}
      width={150}
      dataKey={0}
      cellRenderer={self._renderPosCell}
      headerRenderer={self._renderPosHeader}
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
      cellRenderer={self._renderDescCell}
      headerRenderer={self._renderDescHeader}
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
      cellRenderer={self._renderTransCountCell}
      headerRenderer={self._renderTransCountHeader}
      />);
  },

  _getActionColumn: function() {
    var self = this;
    return (<Column
      label=""
      key="Actions"
      cellClassName="ph1/4"
      width={300}
      dataKey={0}
      isResizable={false}
      cellRenderer={self._renderActionCell}
      />)
  },

  _onRowMouseEnter: function (event, rowIndex) {
    if (this.state.hoveredRow !== rowIndex) {
      this.setState({hoveredRow: rowIndex});
    }
  },

  _onRowMouseLeave: function (event, rowIndex) {
    var unhoveredRow = -1;
    if (this.state.hoveredRow !== unhoveredRow) {
      this.setState({hoveredRow: unhoveredRow});
    }
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

  _onRowBlur: function (event, rowIndex) {
    if(this.props.focusedRow) {
      var unfocusedRow = -1;
      if(this.props.focusedRow.rowIndex !== unfocusedRow) {
        Actions.updateFocusedRow(null, unfocusedRow);
      }
    }
  },

  _rowClassNameGetter: function (rowIndex) {
    if(this.props.focusedRow && this.props.focusedRow.rowIndex === rowIndex) {
      return 'bgcsec30a cdtrigger';
    } else if(this.state.hoveredRow === rowIndex) {
      return 'bgcsec20a cdtrigger';
    }
  },

  _getGlossaryEntry: function (resId) {
    return this.props.glossaryData[resId];
  },

  _rowGetter: function(rowIndex) {
    var self = this,
      row = self.props.glossaryResId[rowIndex];
    if(row === null) {
      if(this.state.timeout !== null) {
        clearTimeout(self.state.timeout);
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
    columns.push(self._getPosColumn());
    columns.push(self._getDescColumn());
    if(!self._isTranslationSelected()) {
      columns.push(self._getTransCountColumn());
    } else {
      columns.push(self._getTransColumn());
    }
    columns.push(self._getActionColumn());

    return (<Table
      onRowClick={self._onRowClick}
      onRowMouseEnter={self._onRowMouseEnter}
      onRowMouseLeave={self._onRowMouseLeave}
      rowClassNameGetter={self._rowClassNameGetter}
      rowHeight={self.CELL_HEIGHT}
      rowGetter={self._rowGetter}
      rowsCount={self.props.totalCount}
      width={self.state.tbl_width}
      height={self.state.tbl_height}
      headerHeight={self.CELL_HEIGHT}>
      {columns}
    </Table>);
  }
});

export default DataTable;
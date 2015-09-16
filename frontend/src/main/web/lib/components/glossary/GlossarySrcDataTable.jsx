import React from 'react';
import {PureRenderMixin} from '../../../node_modules/react/addons';
import Actions from '../../actions/GlossaryActions';
import {Table, Column} from 'fixed-data-table';
import StringUtils from '../../utils/StringUtils'
import { Icon, Tooltip, OverlayTrigger } from 'zanata-ui';
import TextInput from './TextInput';
import LoadingCell from './LoadingCell'
import SourceActionCell from './SourceActionCell'
import ColumnHeader from './ColumnHeader'
import _ from 'lodash';


var GlossarySrcDataTable = React.createClass({
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
    }),
    totalCount: React.PropTypes.number.isRequired
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      tbl_width: window.innerWidth - this.CELL_HEIGHT,
      tbl_height: window.innerHeight - 166,
      row_height: 48,
      header_height: 48,
      inputFields: {},
      timeout: null
    };
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
    var key = "src_content", asc = this._getSort(key);
    return (<ColumnHeader value={label}
      field={key}
      key={key}
      allowSort={true}
      sort={asc}
      onClickCallback={this._onHeaderClick}/>);
  },

  _renderPosHeader: function (label) {
    var key = "part_of_speech", asc = this._getSort(key);
    return (<ColumnHeader value={label}
      field={key}
      key={key}
      allowSort={true}
      sort={asc}
      onClickCallback={this._onHeaderClick}/>);
  },

  _renderDescHeader: function (label) {
    var key = "desc", asc = this._getSort(key);
    return (<ColumnHeader value={label}
      field={key}
      key={key}
      allowSort={true}
      sort={asc}
      onClickCallback={this._onHeaderClick}/>);
  },

  _renderTransHeader: function (label) {
    var key = "trans_count", asc = this._getSort(key);
    return (<ColumnHeader value={label}
      field={key}
      key={key}
      allowSort={true}
      sort={asc}
      onClickCallback={this._onHeaderClick}/>);
  },

  _onHeaderClick: function (field, ascending) {
    Actions.updateSortOrder(field, ascending);
  },

  _renderSourceCell: function (resId, cellDataKey, rowData, rowIndex,
                              columnData, width) {
    var key = this._generateKey(this.ENTRY.SRC.col, rowIndex, resId)

    if (resId === null) {
      return (<LoadingCell key={key}/>)
    } else {
      var entry = this._getGlossaryEntry(resId)
      var term = entry.srcTerm
      var readOnly = !(rowIndex === 0 && this.props.canAddNewEntry)
      var title = this._generateTitle(term)

      if (readOnly) {
        return (<span title={title} key={key}>{term.content}</span>)
      } else {
        return (<TextInput value={term.content}
          placeholder='enter a new term'
          title={title}
          id={key}
          rowIndex={rowIndex}
          resId={resId}
          key={key}
          field={this.ENTRY.SRC.field}
          onFocusCallback={this._onInputFocus}
          onBlurCallback={this._onInputBlur}
          onChangeCallback={this._onValueChange}/>)
      }
    }
  },

  _renderPosCell: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var key = this._generateKey(this.ENTRY.POS.col, rowIndex, resId);
    if(resId === null) {
      return (<LoadingCell key={key}/>);
    } else {
      var entry = this._getGlossaryEntry(resId),
        readOnly = !this.props.canUpdateEntry;
      if(readOnly) {
        return <span key={key}>{entry.pos}</span>;
      } else {
        return (<TextInput value={entry.pos}
          placeholder="enter part of speech"
          rowIndex={rowIndex}
          title={entry.pos}
          id={key}
          resId={resId}
          key={key}
          field={this.ENTRY.POS.field}
          onFocusCallback={this._onInputFocus}
          onBlurCallback={this._onInputBlur}
          onChangeCallback={this._onValueChange}/>);
      }
    }
  },

  _renderDescCell: function (resId, cellDataKey, rowData, rowIndex,
                             columnData, width) {
    var key = this._generateKey(this.ENTRY.DESC.col, rowIndex, resId);

    if(resId === null) {
      return (<LoadingCell key={key}/>);
    } else {
      var entry = this._getGlossaryEntry(resId),
        readOnly = !this.props.canUpdateEntry;
      if (readOnly) {
        return <span key={key}>{entry.description}</span>;
      } else {
        return (<TextInput value={entry.description}
          placeholder="enter description"
          rowIndex={rowIndex}
          title={entry.description}
          id={key}
          resId={resId}
          key={key}
          field={this.ENTRY.DESC.field}
          onFocusCallback={this._onInputFocus}
          onBlurCallback={this._onInputBlur}
          onChangeCallback={this._onValueChange}/>);
      }
    }
  },

  _renderTransCell: function (resId, cellDataKey, rowData, rowIndex,
                              columnData, width) {
    var key = this._generateKey(this.ENTRY.TRANS.col, rowIndex, resId);

    if(resId === null) {
      return (<LoadingCell key={key}/>);
    } else {
      var entry = this._getGlossaryEntry(resId),
        count = entry.termsCount;

      if (count === null) {
        count = '';
      }
      return (<span key={key}>{count}</span>)
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
    this.setState({focusedRow: -1});
  },

  _renderActions: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var isNewEntryCell = rowIndex === 0;
    if(resId === null) {
      return (<LoadingCell/>);
    } else if(!this.props.canUpdateEntry && !this.props.canAddNewEntry) {
      return (<div></div>);
    } else {
      return (
        <SourceActionCell resId={resId} rowIndex={rowIndex}
          srcLocaleId={this.props.srcLocale.locale.localeId}
          newEntryCell={isNewEntryCell}
          canUpdateEntry={this.props.canUpdateEntry}
          canAddNewEntry={this.props.canAddNewEntry}
          onCancel={this._handleCancel}/>
      );
    }
  },

  _getSourceColumn: function() {
    var srcLocaleName = "";
    if(!_.isUndefined(this.props.srcLocale) && !_.isNull(this.props.srcLocale)) {
      srcLocaleName = this.props.srcLocale.locale.displayName;
    }
    return (<Column
      label={srcLocaleName}
      width={150}
      dataKey={0}
      flexGrow={1}
      cellRenderer={this._renderSourceCell}
      headerRenderer={this._renderSourceHeader}
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
      flexGrow={1}
      dataKey={0}
      cellRenderer={this._renderDescCell}
      headerRenderer={this._renderDescHeader}
    />);
  },

  _getTransColumn: function() {
    return (<Column
      label="Translations"
      width={120}
      cellClassName="tac"
      dataKey={0}
      cellRenderer={this._renderTransCell}
      headerRenderer={this._renderTransHeader}
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

  _onRowMouseEnter: function (event, rowIndex) {
    this.setState({hoveredRow: rowIndex});
  },

  _onRowMouseLeave: function (event, rowIndex) {
    this.setState({hoveredRow: -1});
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

  _rowClassNameGetter: function (rowIndex) {
    if(rowIndex == this.state.focusedRow) {
      return 'bgcsec30a';
    } else if(rowIndex == this.state.hoveredRow) {
      return 'bgcsec20a';
    }
  },

  render: function() {
    var dataTable = (<Table
      onRowClick={this._onRowClick}
      onRowMouseEnter={this._onRowMouseEnter}
      onRowMouseLeave={this._onRowMouseLeave}
      rowClassNameGetter={this._rowClassNameGetter}
      rowHeight={this.CELL_HEIGHT}
      rowGetter={this._rowGetter}
      rowsCount={this.props.totalCount}
      width={this.state.tbl_width}
      height={this.state.tbl_height}
      headerHeight={this.CELL_HEIGHT}>
      {this._getSourceColumn()}
      {this._getPosColumn()}
      {this._getDescColumn()}
      {this._getTransColumn()}
      {this._getActionColumn()}
    </Table>);

    return (<div>{dataTable}</div>);
  }
});

export default GlossarySrcDataTable;

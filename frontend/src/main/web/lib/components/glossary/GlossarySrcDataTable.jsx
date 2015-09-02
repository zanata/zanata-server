import React from 'react';
import {PureRenderMixin} from '../../../node_modules/react/addons';
import Actions from '../../actions/GlossaryActions';
import {Table, Column} from 'fixed-data-table';
import StringUtils from '../../utils/StringUtils'
import { Icon } from 'zanata-ui';
import TextInput from './TextInput';


var GlossarySrcDataTable = React.createClass({
  ENTRY: {
    SRC: {
      col: 1,
      field: 'srcTerm.content'
    },
    POS: {
      col: 2,
      field: 'pos'
    },
    DESC: {
      col: 3,
      field: 'description'
    }
  },
  propTypes: {
    glossaryData: React.PropTypes.object.isRequired,
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
    isAuthenticated: React.PropTypes.bool.isRequired,
    user: React.PropTypes.shape({
      username: React.PropTypes.string.isRequired,
      email: React.PropTypes.string.isRequired,
      name: React.PropTypes.string.isRequired,
      imageUrl: React.PropTypes.string.isRequired,
      languageTeams: React.PropTypes.string.isRequired
    }),
    localeOptions: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        label: React.PropTypes.string.isRequired,
        value: React.PropTypes.string.isRequired
      })
    ),
    srcLocale: React.PropTypes.shape({
      locale: React.PropTypes.shape({
        localeId: React.PropTypes.string.isRequired,
        displayName: React.PropTypes.string.isRequired,
        alias: React.PropTypes.string.isRequired
      }).isRequired,
      count: React.PropTypes.number.isRequired
    }).isRequired,
    totalCount: React.PropTypes.number.isRequired,
    glossaryResId: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string))
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      tbl_width: window.innerWidth - 48,
      tbl_height: window.innerHeight - 166,
      row_height: 50,
      header_height: 50,
      inputFields: {}
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

  _renderHeaderLabel: function (label) {
    return (<span className='csec'>{label}</span>);
  },

  _renderSourceHeader: function (label) {
    return (<span className='csec'>{this.props.srcLocale.locale.displayName}</span>);
  },

  _renderSourceCell: function(resId, cellDataKey, rowData, rowIndex,
                              columnData, width) {
    var entry = this._getGlossaryEntry(resId),
      term = entry.srcTerm,
      readOnly = !(rowIndex == 0 && this.props.canAddNewEntry),
      title = this._generateTitle(term),
      key = this._generateKey(this.ENTRY.SRC.col, rowIndex, resId);

    if(readOnly) {
      return <span title={title} key={key}>{term.content}</span>;
    } else {
      return (<TextInput value={term.content}
        placeholder="enter a term"
        title={title}
        id={key}
        resId={resId}
        key={key}
        field={this.ENTRY.SRC.field}
        onChangeCallback={this._onValueChange}/>);
    }
  },

  _renderPosCell: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var entry = this._getGlossaryEntry(resId),
      readOnly = !this.props.canUpdateEntry,
      key = this._generateKey(this.ENTRY.POS.col, rowIndex, resId);

    if(readOnly) {
      return <span key={key}>{entry.pos}</span>;
    } else {
      return (<TextInput value={entry.pos}
        placeholder="enter part of speech"
        title={entry.pos}
        id={key}
        resId={resId}
        key={key}
        field={this.ENTRY.POS.field}
        onChangeCallback={this._onValueChange}/>);
    }
  },

  _renderDescCell: function (resId, cellDataKey, rowData, rowIndex,
                             columnData, width) {
    var entry = this._getGlossaryEntry(resId),
      readOnly = !this.props.canUpdateEntry,
      key = this._generateKey(this.ENTRY.DESC.col, rowIndex, resId);

    if(readOnly) {
      return <span key={key}>{entry.description}</span>;
    } else {
      return (<TextInput value={entry.description}
        placeholder="enter description"
        title={entry.description}
        id={key}
        resId={resId}
        key={key}
        field={this.ENTRY.DESC.field}
        onChangeCallback={this._onValueChange}/>);
    }
  },

  _renderTransCell: function (resId, cellDataKey, rowData, rowIndex,
                              columnData, width) {
    var entry = this._getGlossaryEntry(resId),
      count = entry.termsCount;

    if(count === null) {
      count = '';
    }
    return (<span>{count}</span>)
  },

  _onValueChange: function(inputField, value) {
    var entry = this._getGlossaryEntry(inputField.props.resId);
    _.set(entry, inputField.props.field, value);
    this.state.inputFields[inputField.props.id] = inputField;
  },

  _handleSave: function(resId) {
    Actions.createGlossary(resId);
  },

  _handleUpdate: function(resId) {
    Actions.updateGlossary(resId);
  },

  _handleDelete: function(resId) {
    Actions.deleteGlossary(resId, this.props.srcLocale.locale.localeId);
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

    var cancelButton = (<button className='cpri' onClick={self._handleCancel.bind(self, resId, rowIndex)}>Cancel</button>);

    if(rowIndex == 0 && self.props.canAddNewEntry) {
      return (<div>
        <button className='cwhite bgcpri bdrs pv1/4 ph1/2 mr1/2' onClick={self._handleSave.bind(self, resId)}>Save</button>
                {cancelButton}
      </div>)
    } else if(this.props.canUpdateEntry) {
      return (<div>
        <button className='cwhite bgcpri bdrs pv1/4 ph1/2 mr1/2' onClick={self._handleDelete.bind(self, resId)}>Delete</button>
        <button className='cwhite bgcpri bdrs pv1/4 ph1/2 mr1/2' onClick={self._handleUpdate.bind(self, resId)}>Update</button>
                {cancelButton}
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

  _getPosColumn: function() {
    return (<Column
      label="Part of Speech"
      width={150}
      dataKey={0}
      cellRenderer={this._renderPosCell}
      headerRenderer={this._renderHeaderLabel}
    />);
  },

  _getDescColumn: function() {
    return (<Column
      label="Description"
      width={150}
      flexGrow={1}
      dataKey={0}
      cellRenderer={this._renderDescCell}
      headerRenderer={this._renderHeaderLabel}
    />);
  },

  _getTransColumn: function() {
    return (<Column
      label="Translations"
      width={120}
      cellClassName="tac"
      dataKey={0}
      cellRenderer={this._renderTransCell}
      headerRenderer={this._renderHeaderLabel}
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
    return this.props.glossaryResId[rowIndex];
  },


  render: function() {
    var srcColumn = this._getSourceColumn(),
      posColumn = this._getPosColumn(),
      descColumn = this._getDescColumn(),
      transColumn = this._getTransColumn(),
      actionColumn = this._getActionColumn();

    var dataTable = (<Table
      rowHeight={this.state.row_height}
      rowGetter={this._rowGetter}
      rowsCount={this.props.totalCount}
      width={this.state.tbl_width}
      height={this.state.tbl_height}
      headerHeight={this.state.header_height} >
      {srcColumn}
      {posColumn}
      {descColumn}
      {transColumn}
      {actionColumn}
    </Table>);

    return (<div>{dataTable}</div>);
  }
});

export default GlossarySrcDataTable;

import React from 'react';
import {PureRenderMixin} from '../../../node_modules/react/addons';
import Actions from '../../actions/GlossaryActions';
import {Table, Column} from 'fixed-data-table';
import StringUtils from '../../utils/StringUtils'
import { Icon } from 'zanata-ui';
import TextInput from './TextInput';


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
    selectedSrcLocale: React.PropTypes.string.isRequired,
    selectedTransLocale: React.PropTypes.string.isRequired,
    totalCount: React.PropTypes.number.isRequired
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    if(!this.props.canAddNewEntry) {
      delete this.props.glossaryData["NEW_ENTRY"];
    }

    return {
      tbl_width: window.innerWidth - 48,
      tbl_height: window.innerHeight - 166,
      row_height: 50,
      header_height: 50,
      data: this.props.glossaryData,
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
    return (<span className='csec'>{this.props.selectedSrcLocale}</span>);
  },

  _renderSourceCell: function(resId, cellDataKey, rowData, rowIndex,
                              columnData, width) {
    var entry = this._getGlossaryEntry(resId),
      term = entry.srcTerm,
      readOnly = !(rowIndex == 0 && this.props.canAddNewEntry),
      title = "",
      key = this._generateKey(this.ENTRY.SRC.col, rowIndex, resId);

    if(!readOnly) {
      title = this._generateTitle(term);
    }

    return (<TextInput value={term.content}
      placeholder="enter a term"
      readOnly={readOnly}
      title={title}
      id={key}
      resId={resId}
      key={key}
      field={this.ENTRY.SRC.field}
      onChangeCallback={this._onValueChange}/>);
  },

  _renderTransCell: function(resId, cellDataKey, rowData, rowIndex,
                              columnData, width) {
    var entry = this._getGlossaryEntry(resId),
        term = entry.transTerm,
        title = this._generateTitle(term),
        readOnly = !this.props.canUpdateEntry,
        key = this._generateKey(this.ENTRY.TRANS.col, rowIndex, resId);

    return (<TextInput value={term.content}
      placeholder="enter a translation"
      readOnly={readOnly}
      title={title}
      id={key}
      resId={resId}
      key={key}
      field={this.ENTRY.TRANS.field}
      onChangeCallback={this._onValueChange}/>);
  },

  _renderPosCell: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var entry = this._getGlossaryEntry(resId),
        readOnly = !this.props.canUpdateEntry,
        key = this._generateKey(this.ENTRY.POS.col, rowIndex, resId);

    return (<TextInput value={entry.pos}
      placeholder="enter part of speech"
      readOnly={readOnly}
      title={entry.pos}
      id={key}
      resId={resId}
      key={key}
      field={this.ENTRY.POS.field}
      onChangeCallback={this._onValueChange}/>);
  },

  _renderDescCell: function (resId, cellDataKey, rowData, rowIndex,
                            columnData, width) {
    var entry = this._getGlossaryEntry(resId),
        readOnly = !this.props.canUpdateEntry,
        key = this._generateKey(this.ENTRY.DESC.col, rowIndex, resId);

    return (<TextInput value={entry.description}
      placeholder="enter description"
      readOnly={readOnly}
      title={entry.description}
      id={key}
      resId={resId}
      key={key}
      field={this.ENTRY.DESC.field}
      onChangeCallback={this._onValueChange}/>);
  },

  _onValueChange: function(inputField, value) {
    var entry = this._getGlossaryEntry(inputField.props.resId);
    _.set(entry, inputField.props.field, value);
    this.state.inputFields[inputField.props.id] = inputField;
  },

  _handleSave: function(resId) {
    var entry = this._getGlossaryEntry(resId);
    Actions.createGlossary(entry);
  },

  _handleUpdate: function(resId) {
    var entry = this._getGlossaryEntry(resId);
    Actions.updateGlossary(entry);
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
                <button className='cpri mr1/2'><Icon name='comment'></Icon></button>
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
      cellRenderer={this._renderPosCell}
      headerRenderer={this._renderHeaderLabel}
      />);
  },

  _getDescColumn: function() {
    return (<Column
      label="Description"
      width={150}
      dataKey={0}
      cellRenderer={this._renderDescCell}
      headerRenderer={this._renderHeaderLabel}
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

  _getGlossaryEntry: function (resId) {
    return this.state.data[resId];
  },

  render: function() {
    var rows = [], self = this;

    _.forOwn(this.state.data, function(entry, key) {
      var rowData = [];
      rowData.push(key);
      rows.push(rowData);
    });

    function rowGetter(rowIndex) {
      if(rowIndex > rows.length) {
        console.info('get next load');
      }
      return rows[rowIndex];
    }

    var srcColumn = this._getSourceColumn(),
      transColumn = this._getTransColumn(),
      posColumn = this._getPosColumn(),
      descColumn = this._getDescColumn(),
      actionColumn = this._getActionColumn();

    var dataTable = (<Table
      rowHeight={this.state.row_height}
      rowGetter={rowGetter}
      rowsCount={this.props.totalCount}
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

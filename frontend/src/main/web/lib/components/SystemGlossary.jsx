import React from 'react';
import Configs from '../constants/Configs';
import GlossaryStore from '../stores/GlossaryStore';
import { PureRenderMixin } from 'react/addons';
import Actions from '../actions/GlossaryActions';
import { Button, Input, Icons, Icon, Select, Modal } from 'zanata-ui'
import DataTable from './glossary/DataTable'
import { Loader } from 'zanata-ui'
import _ from 'lodash';
import StringUtils from '../utils/StringUtils'

var SystemGlossary = React.createClass({
  mixins: [PureRenderMixin],

  _init: function() {
    return GlossaryStore.init();
  },

  getInitialState: function() {
    return this._init();
  },

  componentDidMount: function() {
    GlossaryStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    GlossaryStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(this._init());
  },

  _handleTransChange: function(localeId) {
    Actions.changeTransLocale(localeId)
  },

  _handleFilterKeyDown: function(event) {
    if(event.key == 'Enter') {
      Actions.updateFilter(this.state.filter);
    }
  },

  _handleFilterChange: function(event) {
    this.setState({filter: event.target.value});
  },

  _handleUploadFileTransChange: function (localeId) {
    var uploadFileState = this.state.uploadFile;
    uploadFileState.transLocale = localeId;
    this.setState({uploadFile : uploadFileState});
  },

  _handleFile: function(e) {
    var self = this, reader = new FileReader();
    var file = e.target.files[0];

    reader.onload = function(upload) {
      var uploadFileState = self.state.uploadFile;
      uploadFileState.file = file;
      self.setState({uploadFile: uploadFileState});
    };
    reader.readAsDataURL(file);
  },

  _uploadFile: function() {
    var uploadFileState = this.state.uploadFile;
    uploadFileState.status = 0;
    this.setState({uploadFile: uploadFileState});

    Actions.uploadFile(this.state.uploadFile,
      this.state.srcLocale.locale.localeId);
  },

  _handleSubmit: function(e) {
    e.preventDefault();
  },

  _closeUploadModal : function () {
    var uploadFileState = this.state.uploadFile;
    uploadFileState.transLocale = null;
    uploadFileState.file = null;
    uploadFileState.show = false;
    this.setState({uploadFile: uploadFileState});
  },

  _openUploadModal : function() {
    var uploadFileState = this.state.uploadFile;
    uploadFileState.show = true;
    this.setState({uploadFile: uploadFileState});
  },

  _getUploadFileExtension: function () {
    var extension = '';
    if(this.state.uploadFile.file) {
      extension = this.state.uploadFile.file.name.split(".").pop();
    }
    return extension;
  },

  _isSupportedFile: function (extension) {
    return extension === 'po' || extension === 'csv';
  },

  render: function() {
    var count = 0,
      selectedTransLocale = this.state.selectedTransLocale,
      uploadSection = null;

    var contents = (<DataTable
      glossaryData={this.state.glossary}
      glossaryResId={this.state.glossaryResId}
      focusedRow={this.state.focusedRow}
      hoveredRow={this.state.hoveredRow}
      totalCount={this.state.glossaryResId.length}
      canAddNewEntry={this.state.canAddNewEntry}
      canUpdateEntry={this.state.canUpdateEntry}
      user={Configs.user}
      sort={this.state.sort}
      srcLocale={this.state.srcLocale}
      selectedTransLocale={selectedTransLocale}/>);


    if(!_.isUndefined(this.props.srcLocale) && !_.isNull(this.props.srcLocale)) {
      count = this.state.srcLocale.numberOfTerms;
    }

    var enableUpload = this.state.canAddNewEntry && !_.isUndefined(this.state.srcLocale) && !_.isNull(this.state.srcLocale);

    if(enableUpload === true) {
      var transLanguageDropdown = null,
        fileExtension = this._getUploadFileExtension(),
        disableUpload = true;

      if(this._isSupportedFile(fileExtension)) {
        if(fileExtension === 'po') {
          var localeOptions = [];
          _.forEach(this.state['locales'], function(locale, localeId) {
            localeOptions.push({
              value: localeId,
              label: locale.locale.displayName
            });
          });

          transLanguageDropdown = (<Select
            name='glossary-import-language-selection'
            className='w16'
            placeholder='Select a translation language…'
            value={this.state.uploadFile.transLocale}
            options={localeOptions}
            onChange={this._handleUploadFileTransChange}
          />);

          if(!StringUtils.isEmptyOrNull(this.state.uploadFile.transLocale)) {
            disableUpload = false;
          }
        } else {
          disableUpload = false;
        }
      }

      var isUploading = this.state.uploadFile.status !== -1;

      uploadSection = (
        <div>
          <Button onClick={this._openUploadModal} link>
            <Icon name='import' className='mr1/4' /><span>Import Glossary</span>
          </Button>
          <Modal show={this.state.uploadFile.show} onHide={this._closeUploadModal}>
            <Modal.Header>
              <Modal.Title>Import Glossary</Modal.Title>
            </Modal.Header>
            <Modal.Body className='tal'>
              <form onSubmit={this._handleSubmit} encType="multipart/form-data">
                <input type="file" onChange={this._handleFile} ref="file" multiple={false} />
              </form>
              <p>
                CSV and PO files are supported. The source language should be in {this.state.srcLocale.locale.displayName}. For more details on how to prepare glossary files, see our <a href="http://docs.zanata.org/en/release/user-guide/glossary/upload-glossaries/" className="cpri" target="_blank">glossary import documentation</a>.
              </p>
              <div>
                {transLanguageDropdown}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button className='mr1' link onClick={this._closeUploadModal}>Cancel</Button>
              <Button kind='primary' disabled={disableUpload} onClick={this._uploadFile} loading={isUploading}>Import</Button>
            </Modal.Footer>
          </Modal>
      </div>)
    }

    return (<div>
              <Icons />
              <div className='dfx aic mb1'>
                <div className='fxauto dfx aic'>
                  <h1 className='fz2 dib csec'>System Glossary</h1>
                  <Icon name='chevron-right' className='mh1/2 csec50' size='s1'/>
                  <Select
                    name='language-selection'
                    placeholder='Select a language…'
                    className='w16'
                    value={this.state.selectedTransLocale}
                    options={this.state.localeOptions}
                    onChange={this._handleTransChange}/>
                </div>
                {uploadSection}
              </div>
              <div className='dfx aic mb1'>
                <div className='fxauto'>
                  <div className='w8'>
                    <Input value={this.state.filter}
                      label='Search Glossary'
                      hideLabel
                      className="w100p pr1&1/2"
                      border='outline'
                      reset
                      placeholder='Search Glossary'
                      id="search"
                      onKeyDown={this._handleFilterKeyDown}
                      onChange={this._handleFilterChange}/>
                  </div>
                </div>
                <div className='dfx aic'>
                  <Icon name='glossary' className='csec50 mr1/4' />
                  <span className='csec'>{count}</span>
                </div>
              </div>
              <div>
                {contents}
              </div>
            </div>);
  }
});

export default SystemGlossary;

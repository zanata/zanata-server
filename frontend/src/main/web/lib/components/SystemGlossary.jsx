import React from 'react';
import Configs from '../constants/Configs';
import GlossaryStore from '../stores/GlossaryStore';
import { PureRenderMixin } from 'react/addons';
import Actions from '../actions/GlossaryActions';
import { Input, Icons, Icon, Select, Modal } from 'zanata-ui'
import DataTable from './glossary/DataTable'
import TextInput from './glossary/TextInput'
import { Loader } from 'zanata-ui'
import _ from 'lodash';
import StringUtils from '../utils/StringUtils'

var SystemGlossary = React.createClass({
  mixins: [PureRenderMixin],

  _init: function() {
    return GlossaryStore.init(this.props.params, this.props.query);
  },

  getInitialState: function() {
    var state = this._init();
    state['selectedUploadFileTransLocale'] = null;
    return state;
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

  _handleFilterKeyUp: function(input, event) {
    if(event.key == 'Enter') {
      Actions.updateFilter(input.state.value);
    }
  },

  _handleUploadFileTransChange: function (localeId) {
    this.setState({selectedUploadFileTransLocale : localeId});
  },

  _handleFile: function(e) {
    var self = this, reader = new FileReader();
    var file = e.target.files[0];

    reader.onload = function(upload) {
      self.setState({
        uploadFile: {
          uri: upload.target.result,
          file:file
        }
      });
    };
    reader.readAsDataURL(file);
  },

  _uploadFile: function() {
    Actions.uploadFile(this.state.uploadFile,
      this.state.srcLocale.locale.localeId,
      this.state.selectedUploadFileTransLocale);
  },

  _handleSubmit: function(e) {
    e.preventDefault();
  },

  _closeUploadModal : function () {
    this.setState({ showModal: false, uploadFile: null });
  },

  _openUploadModal : function() {
    this.setState({ showModal: true })
  },

  _getUploadFileExtension: function () {
    var extension = '';
    if(this.state.uploadFile) {
      extension = this.state.uploadFile.file.name.split(".").pop();
    }
    return extension;
  },

  _isSupportedFile: function (extension) {
    return extension === 'po' || extension === 'csv';
  },

  render: function() {
    var count = 0,
      selectedTransLocale = this.state.selectedTransLocale;

    var contents = (<DataTable
      glossaryData={this.state.glossary}
      glossaryResId={this.state.glossaryResId}
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

    var uploadSection = "";
    if(this.state.canAddNewEntry
      && !_.isUndefined(this.state.srcLocale) && !_.isNull(this.state.srcLocale)) {

      var transLanguageDropdown = null,
        fileExtension = this._getUploadFileExtension(),
        footer = null;

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
            value={this.state.selectedUploadFileTransLocale}
            options={localeOptions}
            onChange={this._handleUploadFileTransChange}
          />);

          if(!StringUtils.isEmptyOrNull(this.state.selectedUploadFileTransLocale)) {
            footer = (
              <Modal.Footer>
                <button className='mr1 cpri' onClick={this._closeUploadModal}>Cancel</button>
                <button className='bgcpri cwhite bdrs ph3/4 pv1/4' onClick={this._uploadFile}>Submit</button>
              </Modal.Footer>
            );
          }
        } else {
          footer = (
            <Modal.Footer>
              <button className='mr1 cpri' onClick={this._closeUploadModal}>Cancel</button>
              <button className='bgcpri cwhite bdrs ph3/4 pv1/4' onClick={this._uploadFile}>Submit</button>
            </Modal.Footer>
          );
        }
      }

      uploadSection = (
        <div>
          <button className='cpri' onClick={this._openUploadModal}>
            <Icon name='import' className='mr1/4' /><span>Import Glossary</span>
          </button>
          <Modal show={this.state.showModal} onHide={this._closeUploadModal}>
            <Modal.Header>
              <Modal.Title>Import Glossary</Modal.Title>
            </Modal.Header>
            <Modal.Body className='tal'>
              <form onSubmit={this._handleSubmit} encType="multipart/form-data">
                <input type="file" onChange={this._handleFile} ref="file" multiple={false} />
              </form>
              <p>
                <a href="http://docs.zanata.org/en/release/user-guide/glossary/upload-glossaries/" target="_blank">
                  <Icon name="info"/> For more information
                </a>
              </p>
              <div className='mv1/4'>Source language: {this.state.srcLocale.locale.displayName}</div>
              <div>
                {transLanguageDropdown}
              </div>
            </Modal.Body>
            {footer}
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
                    onChange={this._handleTransChange}
                  />
                </div>
                {uploadSection}
              </div>
              <div className='dfx aic mb1'>
                <div className='fxauto'>
                  <div className='w8'>
                    <TextInput value={this.state.filter}
                      className="w100p pr1&1/2"
                      placeholder='Search Glossary'
                      id="search"
                      onKeydownCallback={this._handleFilterKeyUp}/>
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

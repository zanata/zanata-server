import React from 'react';
import {PureRenderMixin} from 'react/addons';
import {Icon, Button, Input, Modal, Select} from 'zanata-ui';
import Actions from '../../actions/GlossaryActions';
import StringUtils from '../../utils/StringUtils'
import _ from 'lodash';
import GlossaryStore from '../../stores/GlossaryStore';

var ImportModal = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
    transLocales: React.PropTypes.object,
    srcLocale: React.PropTypes.shape({
      locale: React.PropTypes.shape({
        localeId: React.PropTypes.string.isRequired,
        displayName: React.PropTypes.string.isRequired,
        alias: React.PropTypes.string.isRequired
      }).isRequired,
      numberOfTerms: React.PropTypes.number.isRequired
    })
  },

  mixins: [PureRenderMixin],

  getInitialState: function() {
    return this._getState();
  },

  _getState: function() {
    return GlossaryStore.getUploadFileState();
  },

  componentDidMount: function() {
    GlossaryStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    GlossaryStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(this._getState());
  },

  _showModal: function () {
    this.setState({show: true})
  },

  _closeModal: function () {
    this.setState(this.getInitialState());
  },

  _onSubmit: function(e) {
    e.preventDefault();
  },

  _onFileChange: function(e) {
    var self = this, file = e.target.files[0],
      reader = new FileReader();

    reader.onload = function(upload) {
      self.setState({file: file});
    };
    reader.readAsDataURL(file);
  },

  _uploadFile: function() {
    this.setState({status: 0});
    Actions.uploadFile(this.state, this.props.srcLocale.locale.localeId);
  },

  _getUploadFileExtension: function () {
    var extension = '';
    if(this.state.file) {
      extension = this.state.file.name.split(".").pop();
    }
    return extension;
  },

  _isSupportedFile: function (extension) {
    return extension === 'po' || extension === 'csv';
  },

  _onTransChange: function (localeId) {
    this.setState({transLocale : localeId});
  },

  render: function () {
    var transLanguageDropdown = null,
      fileExtension = this._getUploadFileExtension(),
      disableUpload = true,
      isUploading = this.state.status !== -1;

    if(this._isSupportedFile(fileExtension)) {
      if(fileExtension === 'po') {
        var localeOptions = [];
        _.forEach(this.props.transLocales, function(locale, localeId) {
          localeOptions.push({
            value: localeId,
            label: locale.locale.displayName
          });
        });

        transLanguageDropdown = (<Select
          name='glossary-import-language-selection'
          className='w16'
          placeholder='Select a translation language…'
          value={this.state.transLocale}
          options={localeOptions}
          onChange={this._onTransChange}
          />);

        if(!StringUtils.isEmptyOrNull(this.state.transLocale)) {
          disableUpload = false;
        }
      } else {
        disableUpload = false;
      }
    }

    return (
      <div className={this.props.className}>
        <Button onClick={this._showModal} link>
          <Icon name='import' className='mr1/4' /><span>Import Glossary</span>
        </Button>
        <Modal show={this.state.show} onHide={this._closeModal}>
          <Modal.Header>
            <Modal.Title>Import Glossary</Modal.Title>
          </Modal.Header>
          <Modal.Body className='tal'>
            <form onSubmit={this._onSubmit} encType="multipart/form-data">
              <input type="file" onChange={this._onFileChange} ref="file" multiple={false} />
            </form>
            <p>
              CSV and PO files are supported. The source language should be in {this.props.srcLocale.locale.displayName}. For more details on how to prepare glossary files, see our <a href="http://docs.zanata.org/en/release/user-guide/glossary/upload-glossaries/" className="cpri" target="_blank">glossary import documentation</a>.
            </p>
            <div>
              {transLanguageDropdown}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button className='mr1' disabled={isUploading} link onClick={this._closeModal}>Cancel</Button>
            <Button kind='primary' disabled={disableUpload} onClick={this._uploadFile} loading={isUploading}>Import</Button>
          </Modal.Footer>
        </Modal>
      </div>)
  }
});

export default ImportModal;
import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {
  ButtonLink,
  ButtonRound,
  Icon,
  LoaderText,
  Modal,
  Select
} from 'zanata-ui'
import StringUtils from '../../utils/StringUtils'
import { forEach } from 'lodash'

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
      numberOfTerms: React.PropTypes.number.isRequired,
      onImport: React.PropTypes.func.isRequired
    })
  },

  mixins: [PureRenderMixin],

  getInitialState: function () {
    return this._getState()
  },

  _getState: function () {
    return GlossaryStore.getUploadFileState()
  },

  componentDidMount: function () {
    GlossaryStore.addChangeListener(this._onChange)
  },

  componentWillUnmount: function () {
    GlossaryStore.removeChangeListener(this._onChange)
  },

  _onChange: function () {
    this.setState(this._getState())
  },

  _showModal: function () {
    this.setState({show: true})
  },

  _closeModal: function () {
    this.setState(this.getInitialState())
  },

  _onFileChange: function (e) {
    var file = e.target.files[0]
    this.setState({file: file})
  },

  _uploadFile: function () {
    this.setState({status: 0})
    this.props.onImport(this.state, this.props.srcLocale.locale.localeId)
    //Actions.uploadFile(this.state, this.props.srcLocale.locale.localeId)
  },

  _getUploadFileExtension: function () {
    var extension = ''
    if (this.state.file) {
      extension = this.state.file.name.split('.').pop()
    }
    return extension
  },

  _isSupportedFile: function (extension) {
    return extension === 'po' || extension === 'csv'
  },

  _onTransLocaleChange: function (localeId) {
    this.setState({transLocale: localeId})
  },

  render: function () {
    let fileExtension = this._getUploadFileExtension(),
      disableUpload = true,
      isUploading = this.state.status !== -1

    if (this._isSupportedFile(fileExtension)) {
      if (fileExtension === 'po') {
        var localeOptions = []
        forEach(this.props.transLocales, function (locale, localeId) {
          localeOptions.push({
            value: localeId,
            label: locale.locale.displayName
          })
        })
        if (!StringUtils.isEmptyOrNull(this.state.transLocale)) {
          disableUpload = false
        }
      } else {
        disableUpload = false
      }
    }

    return (
      <div className={this.props.className}>
        <ButtonLink type='default' onClick={this._showModal}>
          <Icon name='import' className='Mend(rq)'
            theme={{ base: { m: 'Mend(rq)' } }} />
          <span className='Hidden--lesm'>Import Glossary</span>
        </ButtonLink>
        <Modal show={this.state.show} onHide={this._closeModal}>
          <Modal.Header>
            <Modal.Title>Import Glossary</Modal.Title>
          </Modal.Header>
          <Modal.Body className='tal' scrollable={false}>
            <input
              type="file"
              onChange={this._onFileChange}
              ref="file"
              multiple={false}
              disabled={isUploading}
              className="mb1"
            />
            { this.state.file
              ? (<div className='cdanger mv1/4'>
                  File {this.state.file.name} is not supported.
                </div>)
              : ''
            }
            { isUploading
              ? (<span className='csec fz2'>
                  {this.state.transLocale.label}</span>)
              : (<Select
                name='glossary-import-language-selection'
                className='W(r16) Mb(r1)'
                placeholder='Select a translation language…'
                value={this.state.transLocale}
                options={localeOptions}
                onChange={this._onTransLocaleChange}
                />)
              }
            <p>
              CSV and PO files are supported. <strong>The source language should be in {this.props.srcLocale.locale.displayName}</strong>.
              For more details on how to prepare glossary files, see our <a
              href="http://docs.zanata.org/en/release/user-guide/glossary/upload-glossaries/"
              className="cpri" target="_blank">glossary import documentation</a>.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <ButtonLink
              theme={{base: {m: 'Mend(r1)'}}}
              disabled={isUploading}
              onClick={this._closeModal}>
                Cancel
              </ButtonLink>
            <ButtonRound
              type='primary'
              disabled={disableUpload}
              onClick={this._uploadFile}>
              <LoaderText loading={isUploading} loadingText='Importing'>
                Import
              </LoaderText>
            </ButtonRound>
          </Modal.Footer>
        </Modal>
      </div>)
  }
})

export default ImportModal

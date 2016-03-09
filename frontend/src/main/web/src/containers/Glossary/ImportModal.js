import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  ButtonLink,
  ButtonRound,
  Icon,
  LoaderText,
  Modal,
  Select
} from 'zanata-ui'

import {
  Row
} from '../../components'

import {
  glossaryImportFile,
  glossaryUpdateImportFile,
  glossaryToggleImportFileDisplay,
  glossaryUpdateImportFileLocale
} from '../../actions/glossary'

import StringUtils from '../../utils/StringUtils'

class ImportModal extends Component {
  getUploadFileExtension (file) {
    var extension = ''
    if (file) {
      extension = file.name.split('.').pop()
    }
    return extension
  }

  isSupportedFile (extension) {
    return extension === 'po' || extension === 'csv'
  }

  render () {
    const {
      transLocales,
      srcLocale,
      file,
      show,
      status,
      transLocale,
      handleImportFile,
      handleImportFileChange,
      handleImportFileDisplay,
      handleImportFileLocaleChange
      } = this.props

    const fileExtension = this.getUploadFileExtension(file)
    const isUploading = status !== -1
    const locale = srcLocale.locale ? srcLocale.locale.displayName : ''
    let messageSection
    let disableUpload = true

    if (this.isSupportedFile(fileExtension) && !isUploading) {
      if (fileExtension === 'po') {
        if (!StringUtils.isEmptyOrNull(transLocale)) {
          disableUpload = false
        }
      } else {
        disableUpload = false
      }
    }

    if (file && !this.isSupportedFile(fileExtension)) {
      messageSection = (<div className='cdanger mv1/4'>
        File {file.name} is not supported.
      </div>)
    }

    return (
      <Modal show={show} onHide={() => handleImportFileDisplay(false)}>
        <Modal.Header>
          <Modal.Title>Import Glossary</Modal.Title>
        </Modal.Header>
        <Modal.Body className='tal' scrollable={false}>
          <input
            type="file"
            onChange={handleImportFileChange}
            ref="file"
            multiple={false}
            disabled={isUploading}
            className="mb1"/>
          {messageSection}
          { isUploading
            ? (<span className='csec fz2'>
                {transLocale.label}</span>)
            : (<Select
            name='glossary-import-language-selection'
            className='W(r16) Mb(r1)'
            placeholder='Select a translation language…'
            value={transLocale}
            options={transLocales}
            onChange={handleImportFileLocaleChange}
          />)
          }
          <p>
            CSV and PO files are supported. <strong>The source language should be in {locale}</strong>.
            For more details on how to prepare glossary files, see our <a
            href="http://docs.zanata.org/en/release/user-guide/glossary/upload-glossaries/"
            className="cpri" target="_blank">glossary import documentation</a>.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <ButtonLink
            theme={{base: {m: 'Mend(r1)'}}}
            disabled={isUploading}
            onClick={() => handleImportFileDisplay(false)}>
            Cancel
          </ButtonLink>
          <ButtonRound
            type='primary'
            disabled={disableUpload}
            onClick={handleImportFile}>
            <LoaderText loading={isUploading} loadingText='Importing'>
              Import
            </LoaderText>
          </ButtonRound>
        </Modal.Footer>
      </Modal>)
  }
}

ImportModal.propType = {
  className: React.PropTypes.string,
  transLocales: React.PropTypes.array,
  srcLocale: React.PropTypes.object,
  file: React.PropTypes.object,
  show: React.PropTypes.bool,
  status: React.PropTypes.number,
  transLocale: React.PropTypes.string,
  onImport: React.PropTypes.func,
  onFileSelected: React.PropTypes.func,
  onToggleDisplay: React.PropTypes.func,
  onTransLocaleChanged: React.PropTypes.func
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    handleImportFile: () => dispatch(glossaryImportFile()),
    handleImportFileChange: (event) =>
      dispatch(glossaryUpdateImportFile(event.target.files[0])),
    handleImportFileDisplay: (display) =>
      dispatch(glossaryToggleImportFileDisplay(display)),
    handleImportFileLocaleChange: (localeId) =>
      dispatch(glossaryUpdateImportFileLocale(localeId))
  }
}

export default connect(null, mapDispatchToProps)(ImportModal)

import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  ButtonLink,
  ButtonRound,
  LoaderText,
  Modal,
  Select
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

    /* eslint-disable max-len */
    return (
      <Modal
        show={show}
        onHide={() => handleImportFileDisplay(false)}
        rootClose>
        <Modal.Header>
          <Modal.Title>Import Glossary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="file"
            onChange={handleImportFileChange}
            ref="file"
            multiple={false}
            disabled={isUploading}
            className="Mb(r1)"/>
          {messageSection}
          { isUploading
            ? (<span className='Fz(ms2)'>
                {transLocale.label}</span>)
            : (<Select
            name='glossary-import-language-selection'
            className='Maw(r16) Mb(r1)'
            placeholder='Select a translation language…'
            value={transLocale}
            options={transLocales}
            onChange={handleImportFileLocaleChange}
          />)
          }
          <p>
            CSV and PO files are supported. <strong>The source language should
            be in {locale}</strong>. For more details on how to prepare glossary
            files, see our <a href="http://docs.zanata.org/en/release/user-guide/glossary/upload-glossaries/"
            className="C(pri)" target="_blank">glossary import documentation</a>.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <ButtonLink
            atomic={{m: 'Mend(r1)'}}
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
/* eslint-enable max-len */

const mapStateToProps = (state) => {
  const {
    stats,
    importFile
    } = state.glossary
  return {
    srcLocale: stats.srcLocale,
    transLocales: stats.transLocales,
    file: importFile.file,
    show: importFile.show,
    status: importFile.status,
    transLocale: importFile.transLocale
  }
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

export default connect(mapStateToProps, mapDispatchToProps)(ImportModal)

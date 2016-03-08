import React, { Component, PropTypes } from 'react'
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
      className,
      transLocales,
      srcLocale,
      file,
      show,
      status,
      transLocale,
      onImport,
      onFileSelected,
      onToggleDisplay,
      onTransLocaleChanged
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
      <div className={className}>
        <ButtonLink type='default' onClick={() => onToggleDisplay(true)} theme={{ base: { m: 'Mstart(rh)' } }}>
          <Row>
            <Icon name='import' className='Mend(rq)'
              theme={{ base: { m: 'Mend(rq)' } }}/>
            <span className='Hidden--lesm'>Import Glossary</span>
          </Row>
        </ButtonLink>
        <Modal show={show} onHide={() => onToggleDisplay(false)}>
          <Modal.Header>
            <Modal.Title>Import Glossary</Modal.Title>
          </Modal.Header>
          <Modal.Body className='tal' scrollable={false}>
            <input
              type="file"
              onChange={onFileSelected}
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
              onChange={onTransLocaleChanged}
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
              onClick={() => onToggleDisplay(false)}>
              Cancel
            </ButtonLink>
            <ButtonRound
              type='primary'
              disabled={disableUpload}
              onClick={onImport}>
              <LoaderText loading={isUploading} loadingText='Importing'>
                Import
              </LoaderText>
            </ButtonRound>
          </Modal.Footer>
        </Modal>
      </div>)
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

export default ImportModal

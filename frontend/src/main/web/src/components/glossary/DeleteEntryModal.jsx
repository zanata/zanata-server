import React from 'react'
import ReactDOM from 'react-dom'
import {
  ButtonLink,
  ButtonRound,
  LoaderText,
  Icon,
  Tooltip,
  Overlay
} from 'zanata-ui'

var DeleteEntryModal = React.createClass({
  propTypes: {
    id: React.PropTypes.number.isRequired,
    className: React.PropTypes.string,
    entry: React.PropTypes.object,
    onDelete: React.PropTypes.func
  },

  deleteTimeout: null,

  getInitialState: function () {
    return {
      show: false,
      deleting: false
    }
  },

  componentWillUnmount: function () {
    if (this.deleteTimeout !== null) {
      clearTimeout(this.deleteTimeout)
    }
  },

  handleDeleteEntry: function () {
    this.setState({deleting: true})

    if (this.deleteTimeout !== null) {
      clearTimeout(this.deleteTimeout)
    }

    this.deleteTimeout = setTimeout(() => {
      this.props.onDelete(this.props.id)
      this._closeDialog()
    }, 100)
  },

  _toggleDialog: function () {
    this.setState({show: !this.state.show})
  },

  _closeDialog: function () {
    this.setState(this.getInitialState())
  },

  render: function () {
    var isDeleting = this.state.deleting
    var info = null
    const {
      entry,
      className
    } = this.props

    if (entry.termsCount > 0) {
      info = (
        <p>
          Are you sure you want to delete this term and&nbsp;
          <strong>{entry.termsCount}</strong>
          {entry.termsCount > 1 ? 'translations' : 'translation'} ?
        </p>
      )
    } else {
      info = (
        <p>
          Are you sure you want to delete this term?
        </p>
      )
    }

    const tooltip = (
      <Tooltip id="delete-glossary" title="Delete term and translations">
        {info}
        <div className="mt1/4">
          <ButtonLink
            theme={{base: { m: 'Mend(rh)' }}}
            onClick={this._closeDialog}>
            Cancel
          </ButtonLink>
          <ButtonRound type='danger' size='-1' onClick={this.handleDeleteEntry}>
            <LoaderText loading={isDeleting} loadingText='Deleting'>
              Delete all
            </LoaderText>
          </ButtonRound>
        </div>
      </Tooltip>
    )

    return (
      <div className={className + ' dib'}>
        <Overlay
          placement='top'
          target={() => ReactDOM.findDOMNode(this)}
          onHide={this._closeDialog}
          rootClose
          show={this.state.show}>
          {tooltip}
        </Overlay>
        <ButtonLink type='danger'
          onClick={this._toggleDialog}>
          <LoaderText loading={isDeleting} loadingText='Deleting'>
            <Icon name="trash" className='mr1/8' /><span>Delete</span>
          </LoaderText>
        </ButtonLink>
      </div>
    )
  }
})

export default DeleteEntryModal

import React from 'react'
import ReactDOM from 'react-dom'
import {
  ButtonLink,
  ButtonRound,
  LoaderText,
  Icon,
  Tooltip,
  Overlay
} from '../../components'

var DeleteEntryModal = React.createClass({
  propTypes: {
    id: React.PropTypes.number.isRequired,
    className: React.PropTypes.string,
    entry: React.PropTypes.object,
    onDelete: React.PropTypes.func.isRequired
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
    const {
      entry,
      className
    } = this.props
    const info = entry.termsCount > 0 ? (
      <p>
        Are you sure you want to delete this term and&nbsp;
        <strong>{entry.termsCount}</strong>&nbsp;
        {entry.termsCount > 1 ? 'translations' : 'translation'} ?
      </p>
    ) : (<p>Are you sure you want to delete this term?</p>)

    return (
      <div className={className + ' dib'}>
        <Overlay
          placement='top'
          target={() => ReactDOM.findDOMNode(this)}
          onHide={this._closeDialog}
          rootClose
          show={this.state.show}>
          <Tooltip id='delete-glossary' title='Delete term and translations'>
            {info}
            <div className='Mt(rq)'>
              <ButtonLink
                atomic={{m: 'Mend(rh)'}}
                onClick={this._closeDialog}>
                Cancel
              </ButtonLink>
              <ButtonRound type='danger' size='n1'
                           onClick={this.handleDeleteEntry}>
                <LoaderText loading={this.state.deleting}
                            loadingText='Deleting'>
                  Delete all
                </LoaderText>
              </ButtonRound>
            </div>
          </Tooltip>
        </Overlay>
        <ButtonLink type='danger' onClick={this._toggleDialog}>
          <LoaderText loading={this.state.deleting} loadingText='Deleting'>
            <Icon name="trash" atomic={{m: 'Mend(re)'}} /><span>Delete</span>
          </LoaderText>
        </ButtonLink>
      </div>
    )
  }
})

export default DeleteEntryModal

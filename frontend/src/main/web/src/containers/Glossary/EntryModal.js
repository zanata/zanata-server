import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom'
import {
  ButtonLink,
  ButtonRound,
  Icon,
  LoaderText,
  OverlayTrigger,
  Overlay,
  Tooltip } from 'zanata-ui'
import StringUtils from '../../utils/StringUtils'

import {
  glossaryUpdateComment
} from '../../actions/glossary'

class EntryModal extends Component {

  constructor (props) {
    super(props)
    this.state = {
      comment: props.term.transTerm
        ? props.term.transTerm.comment : '',
      show: false
    }
  }

  onCancelComment () {
    this.setState({
      comment: this.props.term.transTerm
        ? this.props.term.transTerm.comment : '',
      show: false
    })
  }

  onCommentKeyUp (event) {
    if (event.key === 'Escape') {
      this.onCancelComment()
    }
  }

  onCommentChange (event) {
    this.setState({
      comment: event.target.value
    })
  }

  toggleDisplay () {
    this.setState({
      show: !this.state.show
    })
  }

  render () {
    const {
      term,
      canUpdateEntry,
      handleUpdateComment
      } = this.props

    let tooltip
    const isSaving = term.status && term.status.isSaving
    const canUpdateComment = term.status && term.status.canUpdateComment
    const readOnlyComment =
      !canUpdateEntry || !canUpdateComment || isSaving

    if (!readOnlyComment) {
      tooltip = (
        <Tooltip id="comment">
          {StringUtils.isEmptyOrNull(this.state.comment)
            ? (<i>No comment</i>)
            : (<span>{this.state.comment}</span>)
          }
        </Tooltip>)
    } else {
      tooltip = (
        <Tooltip id="comment" title="Comment">
          <textarea
            className="p1/4 w100p bd2 bdcsec30 bdrs1/4"
            onChange={::this.onCommentChange}
            value={this.state.comment}
            onKeyUp={::this.onCommentKeyUp} />
          <div className="mt1/4">
            <ButtonLink
              theme={{base: { m: 'Mend(rh)' }}}
              onClick={::this.onCancelComment}>
              Cancel
            </ButtonLink>
            <ButtonRound
              type='primary'
              size='-1'
              disabled={isSaving || StringUtils.isEmptyOrNull(this.state.comment)}
              onClick={() => handleUpdateComment(term.id, this.state.comment)}>
              <LoaderText loading={isSaving} loadingText='Updating'>
                Update Comment
              </LoaderText>
            </ButtonRound>
          </div>
        </Tooltip>)
    }

    return (
        <div className="D(ib) MStart(re)">
          <Overlay
            placement='top'
            target={() => ReactDOM.findDOMNode(this.refs.commentButton)}
            onHide={::this.onCancelComment}
            rootClose
            show={this.state.show}>
            {tooltip}
          </Overlay>
          <div ref='commentButton'>
            <ButtonLink theme={{base: {m: 'Mstart(re)'}}}
              type={StringUtils.isEmptyOrNull(this.state.comment)
                  ? 'muted' : 'primary'}
              theme={{base: { m: 'Mend(rh)' }}}
              onClick={::this.toggleDisplay}>
              <Icon name='comment' />
            </ButtonLink>
          </div>
        </div>
    )
  }
}

EntryModal.propTypes = {
  term: React.PropTypes.object,
  canUpdateEntry: React.PropTypes.bool,
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    handleUpdateComment: (termId, comment) =>
      dispatch(glossaryUpdateComment(termId, comment))
  }
}

export default connect(null, mapDispatchToProps)(EntryModal)

import React from 'react'
import ReactDOM from 'react-dom'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {
  ButtonRound,
  ButtonLink,
  Icon,
  LoaderText,
  OverlayTrigger,
  Overlay,
  Tooltip
} from 'zanata-ui'
import Actions from '../../actions/GlossaryActions'
import LoadingCell from './LoadingCell'
import GlossaryStore from '../../stores/GlossaryStore'
import StringUtils from '../../utils/StringUtils'
import _ from 'lodash'
import defined from 'defined'

var ActionCell = React.createClass({
  propTypes: {
    id: React.PropTypes.number.isRequired,
    info: React.PropTypes.string.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    canUpdateEntry: React.PropTypes.bool
  },

  mixins: [PureRenderMixin],

  getInitialState: function () {
    return this._getState()
  },

  _getState: function () {
    var entry = GlossaryStore.getEntry(this.props.id)
    return {
      entry: entry,
      saving: false,
      comment: _.cloneDeep(entry.transTerm.comment),
      savingComment: false,
      showComment: false
    }
  },

  componentDidMount: function () {
    GlossaryStore.addChangeListener(this._onChange)
  },

  componentWillUnmount: function () {
    GlossaryStore.removeChangeListener(this._onChange)
  },

  _onChange: function () {
    // TODO: isMounted() is a code smell
    // It needs to be removed
    if (this.isMounted()) {
      this.setState(this._getState())
    }
  },

  _handleUpdate: function () {
    this.setState({saving: true})
    Actions.updateGlossary(this.props.id)
  },

  _handleCancel: function () {
    Actions.resetEntry(this.props.id)
  },

  _onUpdateComment: function () {
    this.setState({savingComment: true})
    Actions.updateComment(this.props.id, this.state.comment)
  },

  _hasCommentChanged: function () {
    var initialValue = defined(this.state.entry.transTerm.comment, '')
    var newValue = defined(this.state.comment, '')
    return initialValue !== newValue
  },

  _toggleComment: function () {
    this.setState({showComment: !this.state.showComment})
  },

  _onCommentChange: function (event) {
    this.setState({comment: event.target.value})
  },

  _onCancelComment: function () {
    var value = defined(this.state.entry.transTerm.comment, '')
    this.setState({comment: value, showComment: false})
  },

  _handleCommentKeyUp: function (event) {
    if (event.key === 'Escape') {
      this._onCancelComment()
    }
  },

  render: function () {
    var tooltip
    if (this.props.id === null || this.state.entry === null) {
      return <LoadingCell/>
    } else {
      var isTransModified = this.state.entry.status.isTransModified
      var canUpdateComment = this.state.entry.status.canUpdateTransComment
      var isSaving = this.state.entry.status.isSaving || this.state.saving

      var infoTooltip = <Tooltip id="info">
                          {this.props.info}
                        </Tooltip>
      var info = (
      <OverlayTrigger placement='top' rootClose overlay={infoTooltip}>
        <Icon className="cpri" name="info" />
      </OverlayTrigger>)

      var updateButton
      var cancelButton
      var readOnlyComment =
        !this.props.canUpdateEntry || !canUpdateComment || isSaving
      var disableCommentUpdate = !this._hasCommentChanged()
      var saveCommentButton = (
        <ButtonRound
          type='primary'
          size='-1'
          disabled={disableCommentUpdate}
          onClick={this._onUpdateComment}>
          <LoaderText loading={this.state.savingComment} loadingText='Updating'>
            Update Comment
          </LoaderText>
        </ButtonRound>
      )

      if (!readOnlyComment) {
        tooltip = (
          <Tooltip id="comment" title="Comment">
            <textarea
              className="p1/4 w100p bd2 bdcsec30 bdrs1/4"
              onChange={this._onCommentChange}
              value={this.state.comment}
              onKeyUp={this._handleCommentKeyUp} />
            <div className="mt1/4">
              <ButtonLink
                theme={{base: { m: 'Mend(rh)' }}}
                onClick={this._onCancelComment}>
                Cancel
              </ButtonLink>
              {saveCommentButton}
            </div>
          </Tooltip>
        )
      } else {
        var commentSpan = StringUtils.isEmptyOrNull(this.state.comment)
          ? (<i>No comment</i>) : (<span>{this.state.comment}</span>)
        tooltip = (<Tooltip id="comment">
                     {commentSpan}
                   </Tooltip>)
      }

      var comment = (
      <div className="D(ib)">
        <Overlay
          placement='top'
          target={() => ReactDOM.findDOMNode(this.refs.commentButton)}
          onHide={this._onCancelComment}
          rootClose
          show={this.state.showComment}>
          {tooltip}
        </Overlay>
        <div ref='commentButton'>
          <ButtonLink
            type={StringUtils.isEmptyOrNull(this.state.comment)
              ? 'muted' : 'primary'}
            theme={{base: { m: 'Mend(rh)' }}}
            onClick={this._toggleComment}>
            <Icon name='comment' />
          </ButtonLink>
        </div>
      </div>
      )

      if (isSaving) {
        return (
        <div>
          {info}
          {comment}
          <ButtonRound
            type='primary'
            theme={{base: { m: 'Mstart(rq)' }}}>
            <LoaderText loading loadingText='Updating'>
              Update
            </LoaderText>
          </ButtonRound>
        </div>
        )
      }

      if (isTransModified) {
        updateButton = (
          <ButtonRound type='primary'
            theme={{base: { m: 'Mstart(rq)' }}}
            onClick={this._handleUpdate}>
            Update
          </ButtonRound>
        )
        cancelButton = (
          <ButtonLink
            theme={{base: {m: 'Mstart(rq)'}}}
            onClick={this._handleCancel}>
            Cancel
          </ButtonLink>
        )
      }

      return (
      <div>
        {info}
        {comment}
        <div className='cdtargetib'>
          {updateButton}
          {cancelButton}
        </div>
      </div>)
    }
  }
})

export default ActionCell

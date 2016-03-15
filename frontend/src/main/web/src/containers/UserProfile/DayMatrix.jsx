import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {ContentStates, ContentStateStyles} from '../../constants/Options'
import Actions from '../../actions/userMatrix'
import dateUtil from '../../utils/DateHelper'

var DayMatrix = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    dateLabel: React.PropTypes.string.isRequired,
    date: React.PropTypes.string.isRequired,
    wordCount: React.PropTypes.number.isRequired,
    selectedDay: React.PropTypes.string
  },


  handleDayClick: function(event) {
    var dayChosen = this.props.date;
    if (this.props.selectedDay === dayChosen) {
      // click the same day again will cancel selection
      Actions.clearSelectedDay();
    } else {
      Actions.onDaySelected(dayChosen);
    }
  },

  render: function () {
    const selectedContentState = this.props.selectedContentState
    // Note: this will make this component impure. But it will only become
    // impure when you render it between midnight, e.g. two re-render attempt
    // happen across two days with same props, which I think it's ok.
    const dateIsInFuture = dateUtil.isInFuture(this.props.date)
    const wordCount = dateIsInFuture ? '' : this.props.wordCount

    let rowClass = 'cal__day ' + (dateIsInFuture ? 'is-disabled ' : '') +
      (this.props.date === this.props.selectedDay ? 'is-active ' : '')

    ContentStates.forEach(function (option, index) {
      if (selectedContentState === option) {
        rowClass += ContentStateStyles[index] + ' '
      }
    })

    return (
      <td className={rowClass}
        onClick={this.handleDayClick}
        title={this.props.wordCount + ' words'}>
        <div className="cal__date">{this.props.dateLabel}</div>
        <div className="cal__date-info">{wordCount}</div>
      </td>
    )
  }
})

export default DayMatrix;

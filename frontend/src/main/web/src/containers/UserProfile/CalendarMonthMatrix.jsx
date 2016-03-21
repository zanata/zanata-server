import React from 'react'
import moment from 'moment'
import DayMatrix from './DayMatrix'
import Actions from '../../actions/userMatrix'
import {ContentStates} from '../../constants/Options'
import {DateRanges} from '../../constants/Options'

var CalendarMonthMatrix = React.createClass({
  propTypes: {
    matrixData: React.PropTypes.arrayOf(
      React.PropTypes.shape(
        {
          date: React.PropTypes.string.isRequired,
          wordCount: React.PropTypes.number.isRequired
        })
    ).isRequired,
    selectedDay: React.PropTypes.string,
    selectedContentState: React.PropTypes.oneOf(ContentStates).isRequired,
    dateRangeOption: React.PropTypes.oneOf(DateRanges).isRequired
  },

  getDefaultProps: function () {
    // this is to make week days locale aware and making sure it align with
    // below display
    var now = moment()
    var weekDays = []
    var weekDay
    for (var i = 0; i < 7; i++) {
      weekDay = now.weekday(i).format('ddd')
      weekDays.push(<th className="cal__heading" key={weekDay}>{weekDay}</th>)
    }
    return {
      weekDays: weekDays
    }
  },

  handleClearSelection: function () {
    Actions.clearSelectedDay()
  },

  getTableClass: function (contentState) {
    if (contentState === ContentStates[1]) {
      return 'cal--highlight'
    } else if (contentState === ContentStates[2]) {
      return 'cal--success'
    } else if (contentState === ContentStates[3]) {
      return 'cal--unsure'
    }
  },

  render: function () {
    const selectedDay = this.props.selectedDay
    const clearClass = this.props.selectedDay ? '' : 'is-hidden'
    const tableClasses = 'l--push-bottom-1 cal ' +
      this.getTableClass(this.props.selectedContentState)
    const matrixData = this.props.matrixData

    let days = []
    let result = []
    let dayColumns
    let firstDay
    let heading

    if (matrixData.length === 0) {
      return <table><tr><td>Loading</td></tr></table>
    }

    firstDay = moment(matrixData[0]['date'])
    for (var i = firstDay.weekday() - 1; i >= 0; i--) {
      // for the first week, we pre-fill missing week days
      days.push(
        <td className="cal__day" key={firstDay.weekday(i).format()}></td>
      )
    }

    matrixData.forEach(function (entry) {
      var date = entry['date']
      days.push(
        <DayMatrix key={date}
          dateLabel={moment(date).format('Do')}
          date={date}
          wordCount={entry['wordCount']}
          selectedDay={selectedDay} />
      )
    })

    while (days.length) {
      dayColumns = days.splice(0, 7)
      result.push(
        <tr className="cal__week"
          key={this.props.dateRangeOption + '-week' + result.length}>
          {dayColumns}
        </tr>
      )
    }

    heading = (
      <div className="l--push-bottom-half g">
        <div className="g__item w--1-2">
          <h3 className="epsilon txt--uppercase">
            {this.props.dateRangeOption}'s Activity
          </h3>
        </div>
        <div className="g__item w--1-2 txt--align-right">
          <p className={clearClass}>
            <button className="button--link"
              onClick={this.handleClearSelection}>
              Clear selection
            </button>
          </p>
        </div>
      </div>
    )

    return (
      <div>
        {heading}
        <table className={tableClasses}>
          <thead className="cal__head">
            <tr>{this.props.weekDays}</tr>
          </thead>
          <tbody>
            {result}
          </tbody>
        </table>
      </div>
    )
  }
})

export default CalendarMonthMatrix

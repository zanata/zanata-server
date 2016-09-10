import React, { PropTypes } from 'react'
import moment from 'moment'
import dateUtils from '../../utils/DateHelper'

const CalendarPeriodHeading = ({
  selectedDay,
  dateRange,
  ...props
}) => {
  const stdFmt = dateUtils['dateFormat']
  const dateDisplayFmt = 'DD MMM, YYYY (dddd)'
  const dateRangeDisplayFmt = 'DD MMM, YYYY'

  const period = selectedDay
    ? moment(selectedDay, stdFmt).format(dateDisplayFmt)
    : moment(dateRange.startDate, stdFmt).format(dateRangeDisplayFmt) +
      ' … ' +
      moment(dateRange.endDate, stdFmt).format(dateRangeDisplayFmt)

  return (
    <div className='Mb(rh)'>
      <h3 className='Fw(600) Tt(u)'>Activity Details</h3>
      <p className='C(muted)'>{period}</p>
    </div>
  )
}

CalendarPeriodHeading.propTypes = {
  selectedDay: PropTypes.string,
  dateRange: PropTypes.object
}

export default CalendarPeriodHeading

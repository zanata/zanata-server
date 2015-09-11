import React from 'react';
import ContributionChart from './ContributionChart';
import DropDown from './DropDown';
import FilterableMatrixTable from './FilterableMatrixTable';
import {DateRanges} from '../constants/Options';
import Actions from '../actions/UserMatrixActions';

var RecentContributions = React.createClass(
  {
    render: function() {
      var dateRange = this.props.dateRange;

      return (
        <div className="l__wrapper">
          <div className="l--push-bottom-1">
            <div className="l--float-right txt--uppercase">
              <DropDown options={DateRanges} selectedOption={this.props.dateRangeOption} onClick={Actions.changeDateRange}/>
            </div>
            <h2 className='delta txt--uppercase'>Recent Contributions</h2>
          </div>
          <div className="l--push-bottom-1">
            <ContributionChart wordCountForEachDay={this.props.matrixForAllDays} dateRangeOption={this.props.dateRangeOption} />
          </div>
          <FilterableMatrixTable
            wordCountForSelectedDay={this.props.wordCountsForSelectedDayFilteredByContentState}
            wordCountForEachDay={this.props.wordCountsForEachDayFilteredByContentState}
            fromDate={dateRange['fromDate']} toDate={dateRange['toDate']}
            dateRangeOption={this.props.dateRangeOption}
            selectedContentState={this.props.contentStateOption}
            selectedDay={this.props.selectedDay}
          />
        </div>
      )
    }
  }
);

export default RecentContributions;

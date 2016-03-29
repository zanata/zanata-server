import React from 'react'
import ContributionChart from './ContributionChart'
import FilterableMatrixTable from './FilterableMatrixTable'
import Actions from '../../actions/userMatrix'
import { DateRanges } from '../../constants/Options'
import {
  Base,
  Flex,
  LoaderText,
  Select
} from '../../components'

const classes = {
  root: {
    flxg: 'Flxg(1)',
    flxs: 'Flxg(0)',
    m: 'Mstart(r2)--md',
    maw: 'Maw(100%)',
    miw: 'Miw(100%) Miw(0)--md'
  },
  heading: {
    fz: 'Fz(ms1)',
    fw: 'Fw(600)',
    tt: 'Tt(u)'
  },
  dropDownContainer: {
    m: 'Mstart(a)',
    miw: 'Miw(r6)'
  },
  chartContainer: {
    m: 'Mb(r1)',
    mih: 'Mih(r4)'
  }
}

const RecentContributions = ({
  dateRange,
  loading,
  matrixForAllDays,
  dateRangeOption,
  wordCountsForSelectedDayFilteredByContentState,
  wordCountsForEachDayFilteredByContentState,
  contentStateOption,
  selectedDay,
  ...props
}) => {
  const chart = loading
    ? <LoaderText loading />
    : (<ContributionChart
      wordCountForEachDay={matrixForAllDays}
      dateRangeOption={dateRangeOption} />)
  const matrix = (
    <FilterableMatrixTable
      wordCountForSelectedDay={wordCountsForSelectedDayFilteredByContentState}
      wordCountForEachDay={wordCountsForEachDayFilteredByContentState}
      fromDate={dateRange.fromDate} toDate={dateRange.toDate}
      dateRangeOption={dateRangeOption}
      selectedContentState={contentStateOption}
      selectedDay={selectedDay}
      />)
  return (
    <Base atomic={classes.root}>
      <Flex align='c'>
        <Base tagName='h2' atomic={classes.heading}>Recent Contributions</Base>
        <Base atomic={classes.dropDownContainer}>
          <Select
            name='dateRange'
            placeholder={loading ? 'Loading…' : false}
            className='Flx(flx1)'
            isLoading={loading}
            searchable={false}
            clearable={false}
            value={dateRangeOption}
            options={DateRanges}
            onChange={Actions.changeDateRange} />
        </Base>
      </Flex>
      <Flex dir='c' align='c' justify='c' atomic={classes.chartContainer}>
        {chart}
      </Flex>
      {matrix}
    </Base>
  )
}

export default RecentContributions

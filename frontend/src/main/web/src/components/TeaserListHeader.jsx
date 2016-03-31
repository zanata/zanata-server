import React from 'react' // eslint-disable-line
import View from '../components/View'
import Heading from '../components/Heading'
import {Icon, ButtonLink} from '../components'

const TeaserListHeader = ({
  children,
  title,
  type,
  totalCount,
  sizePerPage,
  page,
  updatePage,
  ...props
}) => {
  const viewTheme = {
    base: {
      fld: ''
    }
  }

  const icons = {
    Project: 'project',
    LanguageTeam: 'language',
    Person: 'user',
    Group: 'folder'
  }
  const totalPage = Math.floor(totalCount / sizePerPage) +
    (totalCount % sizePerPage > 0 ? 1 : 0)
  const headerIcon = type
    ? <Icon name={icons[type]} theme={{ base: { m: 'Mend(rq)' } }}/> : null
  const currentPage = page ? parseInt(page) : 1
  return (
    <View theme={viewTheme}>
      {headerIcon}
      <Heading
        level='2'
        theme={{ base: { c: 'C(dark)', tt: 'Tt(u)' } }}>
        {title}
        <span className='C(muted) Mstart(rq)' title='Total records'>
          {totalCount}
        </span>
      </Heading>
      {totalPage > 1 && (
        <div className='Lh(1) Mstart(rh) C(pri) D(f) Ai(c)'>
          <ButtonLink disabled={currentPage === 1}
            onClick={() => { updatePage(type, currentPage, totalPage, false) }}>
            <Icon name='chevron-left' size='1' />
          </ButtonLink>
          <span className='C(muted) Mx(re)'>{currentPage} of {totalPage}</span>
          <ButtonLink disabled={currentPage === totalPage}
            onClick={() => { updatePage(type, currentPage, totalPage, true)}}>
            <Icon name='chevron-right' size='1' />
          </ButtonLink>
        </div>
      )}
    </View>
  )
}

export default TeaserListHeader

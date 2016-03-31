import React from 'react'
import NavItem from './NavItem'
import { flattenThemeClasses } from '../utils/styleUtils'

const dswid = window.dswh && window.dswh.windowId
  ? '?dswid=' + window.dswh.windowId
  : ''

const items = [
  {
    icon: 'zanata',
    link: '/',
    href: '/',
    title: 'Zanata',
    auth: 'public',
    id: 'nav_home'
  },
  {
    icon: 'search',
    link: '/a/' + dswid + '#explore',
    internalLink: '/explore',
    title: 'Explore',
    auth: 'public',
    id: 'nav_search'
  },
  {
    small: true,
    icon: 'import',
    link: '/login',
    title: 'Log In',
    auth: 'loggedout',
    id: 'nav_login'
  },
  {
    small: true,
    icon: 'upload',
    link: '/signup',
    title: 'Sign Up',
    auth: 'loggedout',
    id: 'nav_sign_up'
  },
  {
    small: true,
    icon: 'dashboard',
    link: '/dashboard',
    title: 'Dashboard',
    auth: 'loggedin',
    id: 'nav_dashboard'
  },
  {
    small: true,
    icon: 'user',
    link: '/a/' + dswid + '#profile',
    internalLink: '/profile',
    title: 'Profile',
    auth: 'loggedin',
    id: 'nav_profile'
  },
  {
    icon: 'glossary',
    link: '/a/' + dswid + '#glossary',
    internalLink: '/glossary',
    title: 'Glossary',
    auth: 'loggedin',
    id: 'nav_glossary'
  },
  {
    icon: 'language',
    link: '/language/list',
    title: 'Languages',
    auth: 'loggedin',
    id: 'nav_language'
  },
  {
    icon: 'settings',
    link: '/dashboard/settings',
    title: 'Settings',
    auth: 'loggedin',
    id: 'nav_settings'
  },
  {
    icon: 'admin',
    link: '/admin/home',
    title: 'Admin',
    auth: 'admin',
    id: 'nav_admin'
  },
  {
    icon: 'logout',
    link: '/account/sign_out',
    title: 'Log Out',
    auth: 'loggedin',
    id: 'nav_logout'
  },
  {
    small: true,
    icon: 'ellipsis',
    link: '/a/more',
    title: 'More',
    auth: 'public',
    id: 'nav_more'
  }
]
const classes = {
  base: {
    bgc: 'Bgc(pri)',
    bxsh: 'Bxsh(ish1)',
    d: 'D(f)',
    fld: 'Fld(c)--sm',
    flxs: 'Flxs(0)',
    h: 'H(100%)--sm',
    or: 'Or(1) Or(0)--sm',
    ov: 'Ov(h)',
    w: 'W(r3)--sm'
  }
}

const Nav = ({
  active,
  links,
  legacy,
  ...props
}) => {
  let auth = 'loggedout'
  if (window.config.permission.isLoggedIn === true) {
    auth = window.config.permission.isAdmin === true ? 'admin' : 'loggedin'
  }
  const authState = auth || 'loggedin'
  const admin = (auth === 'admin')

  return (
    <nav
      {...props}
      className={flattenThemeClasses(classes)}>
      {items.map((item, itemId) => {
        if (((item.auth === 'public') || (item.auth === authState) ||
          (item.auth === 'loggedin' && admin)) && !item.more) {

          let link = null
          if (legacy) {
            //jsf pages
            link = links[item.link]
              ? (links.context + links[item.link])
              : (links.context + item.link)
          } else {
            //react pages, /a/index.xhtml
            link = item.internalLink
              ? item.internalLink
              : (links[item.link]
                    ? (links.context + links[item.link])
                    : (links.context + item.link))
          }

          const useHref = legacy ? true : (item.internalLink ? false : true)
          return (<NavItem key={itemId}
            id={item.id}
            small={item.small}
            active={active.indexOf(link) >= 0}
            link={link}
            useHref={useHref}
            icon={item.icon}
            title={item.title}/>)
        }
        return null
      })}
    </nav>
  )
}

export default Nav

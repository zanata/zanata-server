import React from 'react'
import NavItem from './NavItem'
import { flattenThemeClasses } from '../utils/styleUtils'

const items = [
  {
    icon: 'zanata',
    link: '/',
    href: '/',
    title: 'Zanata',
    auth: 'public'
  },
  {
    icon: 'search',
    link: '/a/#explore',
    internalLink: '/explore',
    title: 'Explore',
    auth: 'public'
  },
  {
    small: true,
    icon: 'import',
    link: '/login',
    title: 'Log In',
    auth: 'loggedout'
  },
  {
    small: true,
    icon: 'upload',
    link: '/signup',
    title: 'Sign Up',
    auth: 'loggedout'
  },
  {
    small: true,
    icon: 'statistics',
    link: '/dashboard/activity',
    title: 'Activity',
    auth: 'loggedin'
  },
  {
    small: true,
    icon: 'project',
    link: '/dashboard/projects',
    title: 'Projects',
    auth: 'loggedin'
  },
  {
    small: true,
    icon: 'folder',
    link: '/dashboard/groups',
    title: 'Groups',
    auth: 'loggedin'
  },
  {
    small: true,
    icon: 'user',
    link: '/a/#profile',
    internalLink: '/profile',
    title: 'Profile',
    auth: 'loggedin'
  },
  {
    icon: 'settings',
    link: '/dashboard/settings',
    title: 'Settings',
    auth: 'loggedin'
  },
  {
    icon: 'admin',
    link: '/admin/home',
    title: 'Admin',
    auth: 'admin'
  },
  {
    icon: 'glossary',
    link: '/a/#glossary',
    internalLink: '/glossary',
    title: 'Glossary',
    auth: 'loggedin'
  },
  {
    icon: 'logout',
    link: '/logout',
    title: 'Log Out',
    auth: 'loggedin'
  },
  {
    small: true,
    icon: 'ellipsis',
    link: '/a/#more',
    internalLink: '/more',
    title: 'More',
    auth: 'public'
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

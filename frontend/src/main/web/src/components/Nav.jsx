import React from 'react'
import NavItem from './NavItem'
import { flattenClasses } from 'zanata-ui'

const items = [
  {
    icon: 'zanata',
    link: '/',
    title: 'Zanata',
    auth: 'public'
  },
  {
    icon: 'search',
    link: '/search',
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
    link: '/activity',
    title: 'Activity',
    auth: 'loggedin'
  },
  {
    small: true,
    icon: 'project',
    link: '/projects',
    title: 'Projects',
    auth: 'loggedin'
  },
  {
    small: true,
    icon: 'folder',
    link: '/groups',
    title: 'Groups',
    auth: 'loggedin'
  },
  {
    small: true,
    icon: 'user',
    link: '/user/:uid',
    title: 'Profile',
    auth: 'loggedin'
  },
  {
    icon: 'settings',
    link: '/settings',
    title: 'Settings',
    auth: 'loggedin'
  },
  {
    icon: 'admin',
    link: '/admin',
    title: 'Admin',
    auth: 'admin'
  },
  {
    icon: 'glossary',
    link: '/glossary',
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
    link: '',
    title: 'More',
    auth: 'public'
  },
  {
    icon: 'help',
    link: '/help',
    title: 'Help',
    auth: 'public',
    more: true
  },
  {
    icon: 'info',
    link: '/about',
    title: 'About',
    auth: 'public',
    more: true
  }
]

const classes = {
  base: {
    bgc: 'Bgc(pri)',
    bxsh: 'Bxsh(ish1)',
    d: 'D(f)',
    fld: 'Fld(c)--sm',
    flxs: 'Flxs(0)',
    or: 'Or(1) Or(0)--sm',
    ov: 'Ov(h)',
    w: 'W(r3)--sm'
  }
}

const Nav = ({
  auth,
  active,
  ...props
}) => {
  // const filteredItems = [
  //   logo: [...items.logo],
  //   ...items.loggedin
  // ]
  const authState = auth || 'loggedin'
  const admin = (auth === 'admin')
  return (
    <nav
      {...props}
      className={flattenClasses(classes)}
    >
      {items.map((item, itemId) =>
        (((item.auth === 'public') || (item.auth === authState) ||
          (item.auth === 'loggedin' && admin)) && !item.more) ? (
          <NavItem key={itemId}
            small={item.small}
            active={active === item.link}
            link={item.link}
            icon={item.icon}
            title={item.title}
          />
        ) : null)
      }
    </nav>
  )
}

export default Nav

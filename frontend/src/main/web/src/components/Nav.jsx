import React from 'react'
import NavItem from './NavItem'
import { flattenClasses } from 'zanata-ui'

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
    link: '/search',
    href: '/search',
    title: 'Explore',
    auth: 'public'
  },
  {
    small: true,
    icon: 'import',
    link: '/login',
    href: '/account/sign_in',
    title: 'Log In',
    auth: 'loggedout'
  },
  {
    small: true,
    icon: 'upload',
    link: '/signup',
    href: '/account/register',
    title: 'Sign Up',
    auth: 'loggedout'
  },
  {
    small: true,
    icon: 'statistics',
    link: '/activity',
    href: '/dashboard/activity',
    title: 'Activity',
    auth: 'loggedin'
  },
  {
    small: true,
    icon: 'project',
    link: '/projects',
    href: '/project/list',
    title: 'Projects',
    auth: 'loggedin'
  },
  {
    small: true,
    icon: 'folder',
    link: '/groups',
    href: '/version-group/list',
    title: 'Groups',
    auth: 'loggedin'
  },
  {
    small: true,
    icon: 'user',
    link: '/user/:uid',
    href: '/profile/view/:uid',
    title: 'Profile',
    auth: 'loggedin'
  },
  {
    icon: 'settings',
    link: '/settings',
    href: '/dashboard/settings',
    title: 'Settings',
    auth: 'loggedin'
  },
  {
    icon: 'admin',
    link: '/admin',
    href: '/admin/home',
    title: 'Admin',
    auth: 'admin'
  },
  {
    icon: 'glossary',
    link: '/glossary',
    href: '/glossary',
    title: 'Glossary',
    auth: 'loggedin'
  },
  {
    icon: 'logout',
    link: '/logout',
    href: '/?actionMethod=home.xhtml%3Aidentity.logout',
    title: 'Log Out',
    auth: 'loggedin'
  },
  {
    small: true,
    icon: 'ellipsis',
    link: '',
    href: '',
    title: 'More',
    auth: 'public'
  },
  {
    icon: 'help',
    link: '/help',
    href: '',
    title: 'Help',
    auth: 'public',
    more: true
  },
  {
    icon: 'info',
    link: '/about',
    href: '',
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
    h: 'H(100%)',
    or: 'Or(1) Or(0)--sm',
    ov: 'Ov(h)'
  }
}

const Nav = ({
  auth,
  active,
  legacy,
  context,
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
            link={legacy ? context + item.href : item.link}
            useHref={legacy}
            icon={item.icon}
            title={item.title}
          />
        ) : null)
      }
    </nav>
  )
}

export default Nav

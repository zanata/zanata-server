import React from 'react'
import NavItem from './NavItem'
import { flattenClasses } from 'zanata-ui'
import Configs from '../constants/Configs'

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
    href: '/search.seam',
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
    href: '/dashboard/projects',
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
    link: '/a/index.seam#user/:username',
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
    link: '/a/index.seam#glossary',
    title: 'Glossary',
    auth: 'loggedin'
  },
  {
    icon: 'logout',
    link: '/logout',
    href: '/logout',
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
    ov: 'Ov(h)',
    w: 'W(r3)--sm'
  }
}

const Nav = ({
  active,
  legacy,
  links,
  context,
  ...props
}) => {

  let auth = 'loggedout';
  if(Configs.data.loggedIn === true) {
    auth = Configs.data.permission.isAdmin === true ? 'admin' : 'loggedin';
  }

  const username = (Configs.user && Configs.user.username) ? Configs.user.username : '';
  const authState = auth || 'loggedin'
  const admin = (auth === 'admin')

  return (
    <nav
      {...props}
      className={flattenClasses(classes)}>
      {items.map((item, itemId) => {
        if(((item.auth === 'public') || (item.auth === authState) ||
          (item.auth === 'loggedin' && admin)) && !item.more) {

          let link = item.link;

          if(legacy) {
            if(links[item.link]) {
              link = links.context + links[item.link];
            } else {
              link = links.context + (item.href ? item.href : item.link);
            }
          }

          if(link.endsWith(':username')) {
            link = link.replace(':username', username);
          }

          return (<NavItem key={itemId}
            small={item.small}
            active={active === link}
            link={link}
            useHref={legacy}
            icon={item.icon}
            title={item.title}/>)
        }
        return null;
        })
      }
    </nav>
  )
}

export default Nav

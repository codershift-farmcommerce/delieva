import styles from './menu.module.css'
import React, { useEffect, useRef, useState } from 'react'
import { getMenuItems, Menu } from './menuItems'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import { UserRole, UserWithRoles } from 'codershift-farmcommerce-api/entities/user'
import { logout } from 'src/components/functions/session'

const Menu = () => {
  const [menuSelected, setMenuSelected] = useState('')
  const [user, setUser] = useState({} as UserWithRoles)
  const [menuItems, setMenuItems] = useState({} as Menu)
  const menuRef = useRef(null as unknown as HTMLDivElement)
  const router = useRouter()

  useEffect(() => {
    const user: UserWithRoles = JSON.parse(
      sessionStorage.getItem('user') ||
        JSON.stringify({
          name: '',
          email: '',
          roles: [],
        }),
    )
    setUser(user)
    setMenuItems(getMenuItems(user.roles))
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === 'Escape') {
        setMenuSelected('')
      }
    }
    function handleClick(e: any) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuSelected('')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  const onMenuSelection = (menuKey: string) => {
    if (menuSelected === menuKey) {
      setMenuSelected('')
    } else {
      setMenuSelected(menuKey)
    }
  }

  const onOptionSelection = async (href: string) => {
    if (href === router.pathname) {
      setMenuSelected('')
    } else {
      await router.push(href)
    }
  }

  const onMyProfileSelection = async (e: any) => {
    e.preventDefault()
    await Router.push('/user/profile')
  }

  const onLogout = async (e: any) => {
    e.preventDefault()
    await logout()
  }

  const isUserMenuSelected = menuSelected === 'user'

  return (
    <div id={'menu'} className={styles.menu} ref={menuRef}>
      <img className={styles.client_logo} src={'/logo.png'} alt={'logo'} />
      <Link legacyBehavior href={'/'}>
        <a className={styles.app_name}>Farm Commerce</a>
      </Link>
      {Object.keys(menuItems).map(key => {
        const isSelected = menuSelected === key
        const menuItem = menuItems[key]
        return (
          <div className={styles.menu_item} key={key}>
            <div
              key={key}
              className={isSelected ? styles.selected_menu_key : styles.menu_key}
              onClick={() => onMenuSelection(key)}
            >
              {`${menuItem.text} \u25BC`}
            </div>
            <div className={isSelected ? styles.selected_option_list : styles.hidden}>
              {menuItem.options.map((option, index) => {
                return (
                  <div className={styles.option_list_item} key={index}>
                    <a
                      className={
                        option.href === '/'
                          ? styles.option_list_item_link +
                            ' ' +
                            styles.option_list_item_link_disabled
                          : styles.option_list_item_link
                      }
                      onClick={async () => await onOptionSelection(option.href)}
                    >
                      {`\u00B7 ${option.text}`}
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      <div className={styles.menu_item_user_email}>
        <div
          className={isUserMenuSelected ? styles.selected_menu_key : styles.menu_key}
          onClick={() => onMenuSelection('user')}
        >
          <span>{`${user.name} \u25BC`}</span>
        </div>
        <div className={isUserMenuSelected ? styles.selected_option_list_user_link : styles.hidden}>
          {(user?.roles ?? []).includes(UserRole.ADMIN) && (
            <div className={styles.option_list_item}>
              <a className={styles.user_link} onClick={onMyProfileSelection}>
                Mi Perfil
              </a>
            </div>
          )}
          <div className={styles.option_list_item}>
            <a className={styles.user_link} onClick={onLogout}>
              Cerrar sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Menu

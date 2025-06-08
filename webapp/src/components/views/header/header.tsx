import React, { FC, ReactNode } from 'react'
import styles from './header.module.css'

type ViewHeaderProps = {
  children?: ReactNode
  flexDirection?: 'column' | 'row' | null
}

const ViewHeader: FC<ViewHeaderProps> = ({ children, flexDirection }) => {
  const directionStyle = flexDirection ? styles[flexDirection] : null
  return (
    <div className={styles.container + ' ' + directionStyle}>
        {children}
    </div>
  )
}

ViewHeader.displayName = 'ViewHeader'

export default ViewHeader

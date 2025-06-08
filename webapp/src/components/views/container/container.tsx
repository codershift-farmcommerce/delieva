import React, { FC, ReactNode } from 'react'
import styles from './container.module.css'

type ViewContainerProps = {
  children: ReactNode
  title: string
}

const ViewContainer: FC<ViewContainerProps> = ({ children, title }) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      {children}
    </div>
  )
}

ViewContainer.displayName = 'ViewContainer'

export default ViewContainer

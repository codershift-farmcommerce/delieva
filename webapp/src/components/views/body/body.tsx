import styles from './body.module.css'

type ViewBodyProps = {
  children?: JSX.Element | JSX.Element[] | boolean
  flexDirection?: 'column' | 'row' | null
}

const ViewBody = ({ children, flexDirection }: ViewBodyProps) => {
  const directionStyle = flexDirection ? styles[flexDirection] : null
  return <div className={styles.container + ' ' + directionStyle}>{children}</div>
}

export default ViewBody

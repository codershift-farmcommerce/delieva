import styles from './home.module.css'
import React from 'react'

const Home = () => {
  return (
    <div className={styles.container}>
      <div className={styles.app_description_container}>
        <img className={styles.home_image} src={'/home.jpg'} alt={'Bienvenido a FarmCommerce'} />
      </div>

      <footer className={styles.app_description_container}>
        <img className={styles.footer_image} src={'/footer.jpg'} alt={'Footer'} />
      </footer>
    </div>
  )
}

export default Home

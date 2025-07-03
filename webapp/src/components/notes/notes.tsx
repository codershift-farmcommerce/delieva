import React from 'react'
import styles from './notes.module.css'

interface NotesProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  label?: string
}

export const Notes = ({
  value,
  onChange,
  maxLength = 50,
  label = 'Comentario:',
}: NotesProps): JSX.Element => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    // Only allow a-z A-Z 0-9 ñ Ñ
    if (newValue.match(/^[a-zA-Z0-9ñÑ\s]*$/) && newValue.length <= maxLength) {
      onChange(newValue)
    }
  }

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.textarea}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
      />
      <div className={styles.hint_container}>
        <div className={styles.hint}>Solo se permiten letras y números</div>
        <div className={styles.counter}>
          {value.length}/{maxLength} caracteres
        </div>
      </div>
    </div>
  )
}

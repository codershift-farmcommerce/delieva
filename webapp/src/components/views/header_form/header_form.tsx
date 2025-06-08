import styles from './header_form.module.css'
import { ChangeEventHandler, MouseEventHandler, ReactNode, Ref } from 'react'

type Field = {
  label: string
  value: number | string
  onChange: ChangeEventHandler<HTMLInputElement> | undefined
  ref?: Ref<any>
  type?: string
}

type ViewHeaderFormProps = {
  fields: Array<Field | JSX.Element>
  submitAction: {
    text?: string | null
    action: Function
    disabled?: boolean
  }
  cancelAction: {
    text?: string | null
    action: MouseEventHandler<HTMLButtonElement>
  }
}

const ViewHeaderForm = ({ fields, submitAction, cancelAction }: ViewHeaderFormProps) => {
  const onInternalSubmit = (e: any) => {
    e.preventDefault()
    submitAction.action()
  }
  return (
    <form autoComplete={'off'} onSubmit={onInternalSubmit}>
      <input autoComplete="false" name="hidden" type="text" style={{ display: 'none' }} />
      <div className={styles.container}>
        <div className={styles.fields_container}>
          <>
            {!!fields?.length &&
              fields.map((field, index) => {
                // @ts-ignore
                if (field.label) {
                  const inputField = field as Field
                  return (
                    <div key={index} className={styles.field}>
                      <label htmlFor={inputField.label}>{`${inputField.label}: `}</label>
                      <input
                        type={inputField.type || 'input'}
                        id={inputField.label}
                        className={styles.input}
                        value={inputField.value}
                        onChange={inputField.onChange}
                        ref={inputField.ref}
                        autoComplete={'new-password'}
                      />
                    </div>
                  )
                } else {
                  return (
                    <div key={index} className={styles.field}>
                      {field as ReactNode}
                    </div>
                  )
                }
              })}

            <div className={styles.button_container}>
              <input
                type={'submit'}
                className={styles.button}
                value={submitAction.text || 'Guardar'}
                disabled={submitAction.disabled}
              />
              <button className={styles.button} onClick={cancelAction.action}>
                {cancelAction.text || 'Cancelar'}
              </button>
            </div>
          </>
        </div>
      </div>
    </form>
  )
}

export default ViewHeaderForm

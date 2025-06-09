import styles from './search_box.module.css'
import React, { useEffect, useRef, useState } from 'react'
import useDebounce from '../debounce/debounce'
import { SearchResultItem, SearchRQ, SearchRS } from 'interface/entities/common'

export type SearchBoxProps<RQ, RS> = {
  searchEndpoint: (req: SearchRQ<RQ>) => Promise<SearchRS<RS>>
  filters?: RQ
  onItemSelected: (item: SearchResultItem<RS>) => void
  label: string | undefined
  placeholderText?: string | null
  defaultValue?: string | null
  onQueryChanged?: (value?: string) => void
  disabled?: boolean
  leaveDefaultValueOnBlur?: boolean
  clearAfterSelection?: boolean
}

export function SearchBox<RQ, RS>(props: SearchBoxProps<RQ, RS>) {
  const {
    searchEndpoint,
    filters,
    onItemSelected,
    label,
    placeholderText,
    defaultValue,
    onQueryChanged,
    disabled,
    leaveDefaultValueOnBlur,
    clearAfterSelection,
  } = props
  const [searchResult, setSearchResult] = useState([] as SearchResultItem<RS>[])
  const [queryInput, setQueryInput] = useState<string | undefined>('')
  const [query, setQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<string | undefined>()

  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedSearch = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedSearch) {
      const fetchData = async () => {
        const response = await searchEndpoint({ query: debouncedSearch, filters })
        setSearchResult(response.data)
      }
      fetchData().catch(console.error)
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (disabled) {
      setSearchResult([])
    }
  }, [disabled])

  useEffect(() => {
    if (defaultValue !== null) {
      setQueryInput(defaultValue)
    }
  }, [defaultValue])

  const onChange = (e: any) => {
    const value = e.target.value
    onQueryChanged && onQueryChanged(value)
    setQueryInput(value)
    setQuery(value)
    if (!value || !value.length) {
      setSearchResult([])
      return
    }
  }

  const handleBlur = () => {
    if (leaveDefaultValueOnBlur) {
      setQueryInput(defaultValue || selectedItem)
    } else {
      setQueryInput(selectedItem)
    }
  }

  const handleClick = () => {
    inputRef?.current?.select()
  }

  useEffect(() => {
    if (selectedItem) {
      setQueryInput(selectedItem)
    }
  }, [selectedItem])

  const onInternalItemSelected = (index: number) => {
    const selectedItem = searchResult[index]
    if (clearAfterSelection) {
      setQueryInput('')
      setSelectedItem('')
    } else {
      setSelectedItem(selectedItem.name)
    }
    setSearchResult([])
    onItemSelected(selectedItem)
  }

  return (
    <div className={styles.container}>
      <label className={styles.input_field_label} htmlFor={'queryInput'}>
        {`${label}`}
      </label>
      <input
        ref={inputRef}
        id={'queryInput'}
        className={styles.input_field}
        type="text"
        onChange={e => onChange(e)}
        value={queryInput}
        autoComplete={'off'}
        placeholder={placeholderText || ''}
        disabled={disabled}
        onBlur={handleBlur}
        onClick={handleClick}
      ></input>
      {!disabled && !!searchResult.length && (
        <ul className={styles.search_list}>
          {searchResult.map((searchResult, index) => (
            <li
              key={searchResult.id}
              className={styles.search_list_item}
              onClick={() => onInternalItemSelected(index)}
            >
              <a> {searchResult.name}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

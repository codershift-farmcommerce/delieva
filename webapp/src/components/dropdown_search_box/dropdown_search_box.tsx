import styles from './dropdown_search_box.module.css'
import React, { useEffect, useRef, useState } from 'react'
import { sendRequest } from 'webapp/src/api/request'
import keyBy from 'lodash.keyby'

export type DropdownSearchBoxProps = {
  fixedItems?: SearchResult[]
  listEndpoint?: string | null
  listMapper?: (obj: any[]) => SearchResult[]
  searchEndpoint?: string | null
  onItemSelected: (item: string) => void
  label: string
  placeholderText?: string | null
  defaultValue?: SearchResult | null
  onQueryChanged?: () => void
  disabled?: boolean
}

type ItemById = {
  [id: number]: SearchResult
}

export type SearchResult = {
  id: string
  name: string
} | null

type SearchResults = Array<SearchResult>

enum SearchTypes {
  ONLY_DROPDOWN,
  DROPDOWN_AND_SEARCH,
  ONLY_SEARCH,
}

const DropdownSearchBox = (props: DropdownSearchBoxProps) => {
  const {
    fixedItems,
    listEndpoint,
    listMapper,
    searchEndpoint,
    onItemSelected,
    label,
    placeholderText,
    defaultValue,
    onQueryChanged,
    disabled,
  } = props
  const [items, setItems] = useState([] as SearchResults)
  const [itemsById, setItemsById] = useState({} as ItemById)
  const [searchResults, setSearchResults] = useState([] as SearchResults)
  const [searchType, setSearchType] = useState(SearchTypes.DROPDOWN_AND_SEARCH)
  const [queryInput, setQueryInput] = useState('')
  const [defaultItemId, setDefaultItemId] = useState('')
  const containerRef = useRef(null as unknown as HTMLDivElement)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (fixedItems?.length) {
        setSearchType(SearchTypes.ONLY_DROPDOWN)
        setItems(fixedItems)
        setItemsById(keyBy(fixedItems, 'id'))
        return
      }
      const response = listEndpoint && (await sendRequest(listEndpoint))
      if (response?.data?.length ?? -1 < 20) {
        setSearchType(SearchTypes.ONLY_DROPDOWN)
        const items = listMapper
          ? listMapper(response.data ? ['-', ...response.data] : [])
          : response.data
        setItems(items)
        setItemsById(keyBy(items, 'id'))
      } else if (response.data.length > 1000) {
        setSearchType(SearchTypes.ONLY_SEARCH)
      } else {
        setSearchType(SearchTypes.DROPDOWN_AND_SEARCH)
        const items = listMapper ? listMapper(response.data || []) : []
        setItems(items)
        setItemsById(keyBy(items, 'id'))
      }
    }
    fetchData().catch(console.error)
  }, [])

  useEffect(() => {
    if (disabled) {
      setSearchResults([])
    }
  }, [disabled])

  useEffect(() => {
    if (defaultValue) {
      setQueryInput(defaultValue.name)
      setDefaultItemId(defaultValue.id)
    }
  }, [defaultValue])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === 'Escape') {
        setSearchResults([])
      }
    }
    function handleClick(e: any) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSearchResults([])
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  const onChange = (e: any) => {
    const value = e.target.value
    setSearchResults([])
    onItemSelected('')
    onQueryChanged && onQueryChanged()
    setQueryInput(value)
    if (!value || !value.length) {
      setSearchResults([])
      return
    }
    if (searchType === SearchTypes.DROPDOWN_AND_SEARCH) {
      setSearchResults(
        items.filter(item => item?.name?.toLowerCase().includes(value.toLowerCase())),
      )
    } else {
      const fetchData = async () => {
        const response = searchEndpoint && (await sendRequest(searchEndpoint, { query: value }))
        setSearchResults(response?.data ?? [])
      }
      fetchData().catch(console.error)
    }
  }

  const onInternalItemSelected = (index: number) => {
    const selectedItem = searchResults[index]
    if (!selectedItem) {
      onItemSelected('')
      return
    }
    setQueryInput(selectedItem.name)
    setSearchResults([])
    onItemSelected(selectedItem.id)
  }

  const onDropdownItemSelected = (e: any) => {
    const id = e.target.value
    const selectedItem = itemsById[id]
    if (!selectedItem) {
      onItemSelected('')
      return
    }
    setQueryInput(selectedItem.name)
    setSearchResults([])
    onItemSelected(selectedItem.id)
  }

  const toggleDropdown = () => {
    if (!!searchResults.length) {
      setSearchResults([])
    } else {
      setSearchResults(items)
      inputRef?.current?.focus()
    }
  }

  return (
    <div className={styles.container}>
      <label className={styles.input_field_label} htmlFor={'queryInput'}>
        {`${label}:`}
      </label>
      {searchType === SearchTypes.ONLY_DROPDOWN ? (
        <select
          className={styles.select_field}
          defaultValue={defaultItemId}
          onChange={onDropdownItemSelected}
          disabled={disabled}
        >
          {items.map(item => {
            if (!item) {
              return null
            }
            return (
              <option key={item.id} value={item.id} selected={defaultItemId === item.id}>
                {item.name}
              </option>
            )
          })}
        </select>
      ) : (
        <div ref={containerRef}>
          <div className={styles.input_select_container}>
            <input
              id={'queryInput'}
              ref={inputRef}
              list="items"
              className={styles.input_field}
              type="text"
              onChange={e => onChange(e)}
              value={queryInput}
              autoComplete={'off'}
              placeholder={placeholderText || ''}
              disabled={disabled}
            />
            <div className={styles.input_dropdown_button} onClick={() => toggleDropdown()}>
              {'\u2304'}
            </div>
          </div>
          {!disabled && !!searchResults.length && (
            <ul className={styles.search_list}>
              {searchResults.map((result, index) => {
                if (!result) {
                  return null
                }
                return (
                  <li
                    key={result.id}
                    className={styles.search_list_item}
                    onClick={() => onInternalItemSelected(index)}
                  >
                    <a> {result.name}</a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default DropdownSearchBox

import styles from './table.module.css'
import { Property } from 'csstype'

export type TableCell = {
  value?: string | number
  element?: JSX.Element
  fontSize?: number | null
  textAlign?: Property.TextAlign | null
  background?: string | null
  color?: string | null
  fontWeight?: Property.FontWeight | null
}

export type TableRow = {
  id: string
  cells: TableCell[]
}

export type TableProps = {
  tableTitle?: string | null
  selectedRowId: string
  columnNames: string[]
  rows: TableRow[]
  onSelectedRow: (id: string) => void
}
const Table = (props: TableProps) => {
  const { tableTitle, columnNames, rows, selectedRowId, onSelectedRow } = props
  const shouldRender = true

  return shouldRender ? (
    <div className={styles.container}>
      {tableTitle && <div className={styles.table_title}>{tableTitle}</div>}
      <table className={styles.table_container}>
        <thead className={styles.thead}>
          <tr className={styles.table_column_name_row}>
            {columnNames.map((columnName, index) => {
              return (
                <th key={index} className={styles.table_column_name}>
                  {columnName}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {rows.map((row: TableRow) => {
            return (
              <tr
                key={row.id}
                className={
                  selectedRowId === row.id
                    ? styles.table_row + ' ' + styles.table_row_selected
                    : styles.table_row
                }
                onClick={() => onSelectedRow(row.id)}
                onMouseOver={() => {}}
              >
                {row.cells.map((cell, index) => {
                  return (
                    <td
                      key={index}
                      className={styles.table_cell}
                      style={{
                        fontSize: cell.fontSize || 16,
                        background: cell.background || 'none',
                        color: cell.color || 'black',
                        textAlign: cell.textAlign || 'left',
                        fontWeight: cell.fontWeight || 'normal'
                      }}
                    >
                      {cell.value ?? cell.element}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <></>
  )
}

export default Table

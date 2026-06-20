import { useMemo } from 'react'

interface IMatrixTableColumn {
  id: string
  type: 'default' | 'wyz' | 'image'
  name: string
  nowrap?: boolean
  size?: string
}

interface IMatrixTableCell {
  id: string
  value: string
  image: string
}

interface IMatrixTableRow {
  id: string
  fields: IMatrixTableCell[]
}

interface IMatrixTableValue {
  tableHead?: IMatrixTableColumn[]
  tableBody?: IMatrixTableRow[]
}

interface ITableBlockProps {
  title?: string
  showTableHead?: boolean
  gapSize?: string
  tableMatrix?: IMatrixTableValue
}

export default function TableBlock({
  title = '',
  showTableHead = true,
  gapSize = 'small',
  tableMatrix = { tableHead: [], tableBody: [] },
}: ITableBlockProps) {
  const tableHead = useMemo(
    () => (Array.isArray(tableMatrix?.tableHead) ? tableMatrix.tableHead : []),
    [tableMatrix]
  )
  const tableBody = useMemo(
    () => (Array.isArray(tableMatrix?.tableBody) ? tableMatrix.tableBody : []),
    [tableMatrix]
  )

  const rootClass = [
    'table-block',
    `table-block--gap-${gapSize || 'small'}`,
    showTableHead ? 'table-block--with-head' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      <div className="container">
        {title ? <h2 className="table-block__title">{title}</h2> : null}

        <div className="table-block__wrapper">
          <table className="table-block__table">
            {showTableHead && tableHead.length > 0 ? (
              <thead>
                <tr>
                  {tableHead.map(column => (
                    <th
                      key={column.id}
                      className={[
                        'table-block__th',
                        column.size ? `table-block__th--size-${column.size}` : '',
                        column.nowrap ? 'table-block__th--nowrap' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {column.name}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {tableBody.map(row => (
                <tr key={row.id}>
                  {row.fields.map((cell, cellIndex) => {
                    const column = tableHead[cellIndex]
                    const cellClass = [
                      'table-block__td',
                      column?.size ? `table-block__td--size-${column.size}` : '',
                      column?.nowrap ? 'table-block__td--nowrap' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')

                    if (column?.type === 'image' && cell.image) {
                      return (
                        <td key={cell.id} className={cellClass}>
                          <img src={cell.image} alt="" className="table-block__img" />
                        </td>
                      )
                    }

                    if (column?.type === 'wyz') {
                      return (
                        <td key={cell.id} className={cellClass}>
                          <div
                            className="table-block__html"
                            dangerouslySetInnerHTML={{ __html: cell.value }}
                          />
                        </td>
                      )
                    }

                    return (
                      <td key={cell.id} className={cellClass}>
                        {cell.value}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .table-block { padding: 16px 0; }
        .table-block__title { margin: 0 0 16px; font-size: 22px; font-weight: 700; }
        .table-block__wrapper { overflow-x: auto; }
        .table-block__table { width: 100%; border-collapse: collapse; min-width: 480px; }
        .table-block--with-head .table-block__table thead { background: #f1f3f5; }
        .table-block__th, .table-block__td {
          padding: 10px 8px;
          border-bottom: 1px solid #dee2e6;
          text-align: left;
          vertical-align: top;
        }
        .table-block--gap-big .table-block__th,
        .table-block--gap-big .table-block__td {
          padding-left: 20px;
          padding-right: 20px;
        }
        .table-block__th--nowrap, .table-block__td--nowrap { white-space: nowrap; }
        .table-block__th--size-small, .table-block__td--size-small { width: 140px; }
        .table-block__th--size-normal, .table-block__td--size-normal { width: 240px; }
        .table-block__th--size-large, .table-block__td--size-large { width: 360px; }
        .table-block__html p { margin: 0 0 8px; }
        .table-block__html p:last-child { margin-bottom: 0; }
        .table-block__img { display: block; max-width: 200px; height: auto; border-radius: 8px; }
      `}</style>
    </div>
  )
}

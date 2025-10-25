import type { ReactNode } from 'react'

type AdminTableColumn = {
  id: string
  label: string
  align?: 'left' | 'center' | 'right'
}

type AdminTableAction = {
  id: string
  label: string
  icon?: ReactNode
  tone?: 'default' | 'primary' | 'danger'
}

type AdminTableRow = {
  id: string
  cells: Record<string, ReactNode>
  status?: {
    label: string
    tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  }
  actions?: AdminTableAction[]
}

type AdminTableProps = {
  columns: AdminTableColumn[]
  rows: AdminTableRow[]
}

function AdminTable({ columns, rows }: AdminTableProps) {
  return (
    <div className="admin-table__container">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id} scope="col" style={{ textAlign: column.align ?? 'left' }}>
                {column.label}
              </th>
            ))}
            <th scope="col" className="admin-table__actions-heading" aria-label="Ações" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.id} style={{ textAlign: column.align ?? 'left' }}>
                  {row.cells[column.id]}
                </td>
              ))}
              <td className="admin-table__actions">
                {row.status ? (
                  <span className={`admin-status admin-status--${row.status.tone ?? 'info'}`}>
                    {row.status.label}
                  </span>
                ) : null}
                {row.actions?.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={`admin-table__action-button${
                      action.tone ? ` is-${action.tone}` : ''
                    }`}
                    aria-label={action.label}
                    title={action.label}
                  >
                    {action.icon ? action.icon : <span>{action.label}</span>}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export type { AdminTableColumn, AdminTableRow, AdminTableAction }
export default AdminTable

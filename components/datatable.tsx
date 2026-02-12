

"use client"

import { useState, useMemo } from "react"
import { Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"


interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
}
export type Column<T> = {
  key: keyof T | "sno" | "actions"
  label: string
  align?: "left" | "center" | "right"
  width?: string
  sortable?: boolean
  className?: string
  render?: (
    value: any,
    row: T,
    index: number,
    startIndex: number
  ) => React.ReactNode
   sticky?: boolean
  left?: number
}

export default function DataTable<T extends { id: string | number; isActive?: boolean }>({
  data,
  columns,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<"All" | "Active" | "Inactive">("All")
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  /* FILTER */
  const filteredData = useMemo(() => {
    const s = search.toLowerCase()

    return data.filter((row: any) => {
      const matchesSearch = Object.values(row).some((v) =>
        String(v).toLowerCase().includes(s)
      )

      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Active"
          ? row.isActive === true
          : row.isActive === false

      return matchesSearch && matchesStatus
    })
  }, [data, search, statusFilter])

  /* SORT */
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData
    return [...filteredData].sort((a: any, b: any) => {
      if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1
      if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortKey, sortOrder])

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  /* PAGINATION */
  const totalPages = Math.ceil(sortedData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const visibleData = sortedData.slice(startIndex, startIndex + rowsPerPage)

  /* EXPORT */
  const handleExport = () => {
    const headers = columns
      .filter(c => !["sno", "actions"].includes(c.key as string))
      .map(c => c.label)

    const rows = sortedData.map((row: any) =>
      columns
        .filter(c => !["sno", "actions"].includes(c.key as string))
        .map(c => row[c.key as keyof T])
        .join(",")
    )

    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "employees.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ column }: { column: keyof T }) => {
    if (sortKey !== column)
      return <ArrowUpDown className="inline ml-1 w-4 h-4 text-gray-400" />
    return sortOrder === "asc"
      ? <ArrowUp className="inline ml-1 w-4 h-4" />
      : <ArrowDown className="inline ml-1 w-4 h-4" />
  }

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] border border-slate-200 p-6">

      {/* TOP BAR */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
          className="border border-slate-200 px-4 py-2.5 rounded-xl w-64 text-sm bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any)
              setCurrentPage(1)
            }}
            className="border border-slate-200 px-4 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-xl text-sm bg-white hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-auto border border-slate-200 rounded-xl">
        <table className="min-w-full table-fixed">
          <thead className="bg-slate-100/90 sticky top-0 backdrop-blur">
            <tr className="border-b border-slate-200">
         {columns.map(col => (
  <th
    key={String(col.key)}
    onClick={() =>
      col.sortable &&
      col.key !== "sno" &&
      col.key !== "actions" &&
      handleSort(col.key as keyof T)
    }
    style={
      col.sticky
        ? { left: `${col.left}px` }
        : undefined
    }
    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap
      ${col.sortable ? "cursor-pointer" : ""}
      ${col.sticky ? "sticky top-0 bg-gray-100 z-30" : ""}
      text-${col.align ?? "left"}
    `}
  >
    {col.label}
    {col.sortable &&
      col.key !== "sno" &&
      col.key !== "actions" && (
        <SortIcon column={col.key as keyof T} />
      )}
  </th>
))}

            </tr>
          </thead>

         <tbody>
  {visibleData.map((row, index) => (
    <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
      {columns.map(col => {
        const isVirtual =
          col.key === "sno" || col.key === "actions"

        const value = isVirtual
          ? undefined
          : (row as any)[col.key]

        return (
          <td
            key={String(col.key)}
            style={
              col.sticky
                ? { left: `${col.left}px` }
                : undefined
            }
            className={`px-4 py-2 text-sm whitespace-nowrap
              ${col.sticky ? "sticky bg-white z-20" : ""}
              ${col.className ?? ""}
            `}
          >
            {col.render
              ? col.render(value, row, index, startIndex)
              : typeof value === "object"
              ? "-"
              : String(value ?? "")}
          </td>
        )
      })}
    </tr>
  ))}
</tbody>

        </table>
      </div>

      {/* FOOTER */}
      <div className="flex flex-wrap gap-3 justify-between items-center mt-5 text-sm">
        <div>
          Rows per page:
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="ml-2 border border-slate-200 px-2 py-1 rounded-lg bg-white"
          >
            {[5, 10, 20, 50].map(n => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

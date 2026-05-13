"use client"

import { useEffect, useMemo, useState } from "react"
import { CornerDownLeft, Search } from "lucide-react"
import { useRouter } from "next/navigation"

type CommandItem = {
  id: string
  label: string
  href: string
}

const COMMANDS: CommandItem[] = [
  { id: "dashboard", label: "Go to Dashboard", href: "/admin" },
  { id: "calendar", label: "Open Calendar", href: "/admin/calendar" },
  { id: "clients", label: "Open Clients", href: "/admin/clients" },
  { id: "projects", label: "Open Projects", href: "/admin/projects" },
  { id: "team", label: "Open Team", href: "/admin/team" },
  { id: "leads", label: "Open Leads", href: "/admin/leads" },
  // { id: "messages", label: "Open Chat", href: "/admin/messages" },
 
]

export default function GlobalCommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((prev) => !prev)
      }

      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return COMMANDS
    }

    const q = query.toLowerCase()
    return COMMANDS.filter(
      (item) => item.label.toLowerCase().includes(q) || item.href.toLowerCase().includes(q),
    )
  }, [query])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-16 top-4 z-40 hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3.5 text-xs text-slate-700 shadow-sm hover:bg-white xl:flex"
      >
        <Search size={14} />
        Quick Search
        <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500">
          Ctrl+K
        </span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close command palette"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div className="relative mx-auto mt-20 w-[92%] max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Search</p>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={16} className="text-slate-500" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pages or commands"
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 text-[11px] text-slate-500">
          <span>{filtered.length} results</span>
          <span className="inline-flex items-center gap-1">
            <CornerDownLeft size={12} />
            press Enter
          </span>
        </div>

        <div className="max-h-80 overflow-auto p-2">
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center">
              <p className="text-sm font-medium text-slate-700">No results found</p>
              <p className="text-xs text-slate-500 mt-1">Try a page name like Projects or Clients.</p>
            </div>
          )}

          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setOpen(false)
                setQuery("")
                router.push(item.href)
              }}
              className="w-full rounded-xl border border-transparent px-3 py-2.5 text-left hover:bg-slate-50 hover:border-slate-200 transition"
            >
              <p className="text-sm font-medium text-slate-800">{item.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{item.href.replace("/admin", "Admin")}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

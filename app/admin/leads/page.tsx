"use client"

import { useEffect, useMemo, useState } from "react"
import DataTable, { Column } from "@/components/datatable"
import { Mail, Phone, UserCheck, Briefcase } from "lucide-react"

type LeadRow = {
  id: number
  name: string
  email: string
  mobile: string
  service?: string
  consent: boolean
  submitted_at: string
  isActive?: boolean
}

type LeadsResponse = {
  data: LeadRow[]
  error?: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/leads", { cache: "no-store" })
        const json = (await res.json()) as LeadsResponse
        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch leads.")
        }
        if (!active) return
        const rows = (json.data || []).map((row) => ({
          ...row,
          isActive: row.consent,
        }))
        setLeads(rows)
        setError(null)
      } catch (err: any) {
        if (!active) return
        setError(err?.message ?? "Failed to load leads.")
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const total = leads.length
    const consented = leads.filter((l) => l.consent).length
    const unconsented = total - consented
    return { total, consented, unconsented }
  }, [leads])

  const columns: Column<LeadRow>[] = [
    {
      key: "sno",
      label: "S.No",
      render: (_v, _row, index, startIndex) => (
        <span className="font-semibold">{startIndex + index + 1}</span>
      ),
      sticky: true,
      left: 0,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-900">{value}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700">{value}</span>
        </div>
      ),
    },
    {
      key: "mobile",
      label: "Mobile",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700">{value}</span>
        </div>
      ),
    },
    {
      key: "service",
      label: "Service",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700">{value}</span>
        </div>
      ),
    },
    {
      key: "consent",
      label: "Consent",
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            value ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {value ? "Consented" : "Not Consented"}
        </span>
      ),
    },
    {
      key: "submitted_at",
      label: "Submitted",
      sortable: true,
      render: (value) => new Date(value).toLocaleString("en-GB"),
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Leads</h1>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          Loading leads...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Leads</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-600 mt-2">
            Leads captured from the marketing site.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Leads</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Consented</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.consented}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Not Consented</p>
          <p className="text-2xl font-bold text-slate-700">{stats.unconsented}</p>
        </div>
      </div>

      <DataTable data={leads} columns={columns} exportFilename="leads.csv" />
    </div>
  )
}

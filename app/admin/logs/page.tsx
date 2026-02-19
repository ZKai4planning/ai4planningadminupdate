"use client"

import { JSX, Suspense, useMemo, useState } from "react"
import { User, Bot, CheckCircle, FileText, Download, Calendar } from "lucide-react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

type ActivityType = "completed" | "triggered" | "auto-resolved" | "system"

type ActivityItem = {
  id: string
  projectId: string
  timestamp: Date
  agent: "Agent X" | "Agent Y" | "System"
  role: string
  type: ActivityType
  title: string
  description: string
  progress?: number
  attachment?: string
  tag?: string
}

const activityData: ActivityItem[] = [
  {
    id: "1",
    projectId: "aB3$k!",
    timestamp: new Date("2026-02-17T09:05:00"),
    agent: "Agent X",
    role: "Strategist",
    type: "completed",
    title: "Intake Blueprint Finalized",
    description:
      "Prepared and validated the intake blueprint for Project Orion. Risk controls and dependencies confirmed.",
    attachment: "Orion_Intake_Blueprint.pdf",
  },
  {
    id: "2",
    projectId: "aB3$k!",
    timestamp: new Date("2026-02-17T10:12:00"),
    agent: "Agent Y",
    role: "Executor",
    type: "triggered",
    title: "Execution Batch Started",
    description:
      "Triggered execution pipeline for permit validation tasks and distributed subtasks to worker queues.",
    progress: 32,
  },
  {
    id: "3",
    projectId: "aB3$k!",
    timestamp: new Date("2026-02-17T11:25:00"),
    agent: "Agent X",
    role: "Strategist",
    type: "triggered",
    title: "Compliance Review Initiated",
    description:
      "Initiated compliance review after receiving updated zoning inputs from council data stream.",
    progress: 48,
  },
  {
    id: "4",
    projectId: "aB3$k!",
    timestamp: new Date("2026-02-17T12:40:00"),
    agent: "Agent Y",
    role: "Executor",
    type: "completed",
    title: "Validation Pack Delivered",
    description:
      "Completed validation checks and delivered package to case workspace for final approval.",
    attachment: "Validation_Pack_v3.pdf",
  },
  {
    id: "5",
    projectId: "proj003",
    timestamp: new Date("2026-02-18T08:10:00"),
    agent: "System",
    role: "Event Engine",
    type: "auto-resolved",
    title: "Queue Backpressure Resolved",
    description:
      "Detected queue backpressure and auto-routed traffic to standby workers with no user action required.",
    tag: "SYSTEM OPTIMIZATION APPLIED",
  },
  {
    id: "6",
    projectId: "proj003",
    timestamp: new Date("2026-02-18T09:18:00"),
    agent: "Agent X",
    role: "Strategist",
    type: "completed",
    title: "CIL Scope Confirmed",
    description:
      "Confirmed CIL scope and cross-linked project constraints to active council requirements.",
    attachment: "CIL_Scope_Confirmed.pdf",
  },
  {
    id: "7",
    projectId: "A1uia-1hY$u",
    timestamp: new Date("2026-02-18T10:45:00"),
    agent: "Agent Y",
    role: "Executor",
    type: "triggered",
    title: "Document Merge Running",
    description:
      "Started merge process for technical drawings and legal annexures before submission packaging.",
    progress: 71,
  },
  {
    id: "8",
    projectId: "A1uia-1hY$u",
    timestamp: new Date("2026-02-18T11:30:00"),
    agent: "System",
    role: "Event Engine",
    type: "system",
    title: "Milestone Reached: Phase 1 Finalized",
    description: "All validation tasks completed and the deployment gate is now approved.",
  },
]

function LogsPageContent() {
  const searchParams = useSearchParams()
  const projectFilter = searchParams.get("projectId")
  const [selectedAgent, setSelectedAgent] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [automatedOnly, setAutomatedOnly] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filteredData = useMemo(() => {
    return activityData.filter((item) => {
      if (projectFilter && item.projectId !== projectFilter) {
        return false
      }

      if (selectedAgent !== "All" && item.agent !== selectedAgent) {
        return false
      }

      if (selectedStatus !== "All" && item.type !== selectedStatus) {
        return false
      }

      if (automatedOnly && item.type !== "auto-resolved") {
        return false
      }

      if (startDate) {
        const from = new Date(`${startDate}T00:00:00`)
        if (item.timestamp < from) {
          return false
        }
      }

      if (endDate) {
        const to = new Date(`${endDate}T23:59:59.999`)
        if (item.timestamp > to) {
          return false
        }
      }

      return true
    })
  }, [selectedAgent, selectedStatus, automatedOnly, startDate, endDate, projectFilter])

  const sortedData = useMemo(() => {
    return [...filteredData].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    )
  }, [filteredData])

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(sortedData, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "activity-logs-history.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearDateFilter = () => {
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-4">
        {projectFilter && (
          <Link
            href={`/admin/projects?projectId=${projectFilter}`}
            className="mb-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            Back to Project
          </Link>
        )}
        <h1 className="text-2xl font-semibold text-slate-900">Logs</h1>
       
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All Agents</option>
            <option value="Agent X">Agent X</option>
            <option value="Agent Y">Agent Y</option>
            <option value="System">System</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="completed">completed</option>
            <option value="triggered">triggered</option>
            <option value="auto-resolved">auto-resolved</option>
            <option value="system">system</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={automatedOnly}
              onChange={() => setAutomatedOnly(!automatedOnly)}
            />
            Automated Only
          </label>

          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm bg-white">
            <Calendar size={15} className="text-slate-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="outline-none text-sm"
              aria-label="Start date"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="outline-none text-sm"
              aria-label="End date"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={clearDateFilter}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{sortedData.length} entries</span>
          <button
            onClick={exportLogs}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Download size={16} />
            Export Logs
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gray-300" />

        <div className="space-y-10">
          {sortedData.map((item) => (
            <TimelineItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LogsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading logs...</div>}>
      <LogsPageContent />
    </Suspense>
  )
}

function TimelineItem({ item }: { item: ActivityItem }) {
  const iconMap: Record<ActivityType, JSX.Element> = {
    completed: <User size={16} />,
    triggered: <User size={16} />,
    "auto-resolved": <Bot size={16} />,
    system: <CheckCircle size={16} />,
  }

  const colorMap: Record<ActivityType, string> = {
    completed: "bg-blue-600",
    triggered: "bg-purple-600",
    "auto-resolved": "bg-green-600",
    system: "bg-gray-500",
  }

  const badgeMap: Record<ActivityType, string> = {
    completed: "bg-blue-100 text-blue-600",
    triggered: "bg-purple-100 text-purple-600",
    "auto-resolved": "bg-green-100 text-green-600",
    system: "bg-gray-200 text-gray-600",
  }

  return (
    <div className="relative flex gap-6">
      <div
        className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-white ${
          colorMap[item.type]
        }`}
      >
        {iconMap[item.type]}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-xs text-gray-500">{item.timestamp.toLocaleString()}</span>

          <span className="font-medium text-blue-600">
            {item.agent} ({item.role})
          </span>

          <span
            className={`ml-auto text-xs px-3 py-1 rounded-full ${
              badgeMap[item.type]
            }`}
          >
            {item.type}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-1">{item.title}</h3>

          <p className="text-sm text-gray-600 mb-4">{item.description}</p>

          {item.progress !== undefined && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <div className="text-right text-xs text-gray-500 mt-1">{item.progress}%</div>
            </>
          )}

          {item.attachment && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
              <FileText size={14} />
              {item.attachment}
            </div>
          )}

          {item.tag && (
            <span className="text-xs px-3 py-1 bg-green-100 text-green-600 rounded-full mt-3 inline-block">
              {item.tag}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

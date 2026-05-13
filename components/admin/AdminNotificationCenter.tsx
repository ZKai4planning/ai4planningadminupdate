"use client"

import { useMemo, useState } from "react"
import { Bell } from "lucide-react"
import { mockFeedbackQueue, mockSystemAlerts } from "@/app/lib/mock-data"

type NotificationItem = {
  id: string
  title: string
  subtitle: string
  level: "high" | "medium" | "low"
}

const levelClass: Record<NotificationItem["level"], string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-700",
}

export default function AdminNotificationCenter() {
  const [open, setOpen] = useState(false)

  const notifications = useMemo<NotificationItem[]>(() => {
    const alerts: NotificationItem[] = mockSystemAlerts.map((alert) => ({
      id: `alert-${alert.id}`,
      title: alert.title,
      subtitle: `${alert.service} - ${alert.status}`,
      level: alert.severity as NotificationItem["level"],
    }))

    const feedback: NotificationItem[] = mockFeedbackQueue.map((item) => ({
      id: `feedback-${item.id}`,
      title: `Feedback (${item.category})`,
      subtitle: item.message,
      level: item.priority as NotificationItem["level"],
    }))

    return [...alerts, ...feedback].slice(0, 8)
  }, [])

  return (
    <div className="fixed right-3 top-[4.25rem] z-40 flex flex-col items-end sm:right-4 md:top-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
        aria-label="Toggle notifications"
      >
        <Bell size={18} className="text-slate-700" />
        <span className="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white ring-2 ring-white">
          {notifications.length}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white shadow-xl sm:w-96 sm:max-w-[92vw]">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notification Center</p>
            <p className="text-xs text-slate-500">Critical alerts and admin feedback queue</p>
          </div>
          <div className="max-h-96 overflow-auto p-2">
            {notifications.map((item) => (
              <div key={item.id} className="mb-2 rounded-lg border border-slate-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <span className={`rounded px-2 py-0.5 text-[10px] ${levelClass[item.level]}`}>
                    {item.level}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { JSX, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import {
  mockCouncilApplications,
  mockMessages,
  mockPayments,
  mockProjects,
} from "@/app/lib/mock-data"

type EventCategory = "project" | "council" | "payment" | "meeting"
type EventPriority = "high" | "medium" | "low"

type AdminCalendarEvent = {
  id: string
  date: string
  title: string
  subtitle: string
  detail: string
  category: EventCategory
  priority: EventPriority
}

const categoryMeta: Record<
  EventCategory,
  { label: string; chipClass: string; dotClass: string }
> = {
  project: {
    label: "Project",
    chipClass: "bg-blue-100 text-blue-700",
    dotClass: "bg-blue-500",
  },
  council: {
    label: "Council",
    chipClass: "bg-indigo-100 text-indigo-700",
    dotClass: "bg-indigo-500",
  },
  payment: {
    label: "Payment",
    chipClass: "bg-amber-100 text-amber-700",
    dotClass: "bg-amber-500",
  },
  meeting: {
    label: "Meeting",
    chipClass: "bg-emerald-100 text-emerald-700",
    dotClass: "bg-emerald-500",
  },
}

const priorityClass: Record<EventPriority, string> = {
  high: "ring-1 ring-red-200",
  medium: "ring-1 ring-amber-200",
  low: "ring-1 ring-slate-200",
}

const toIsoDate = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`
}

const priorityFromDays = (isoDate: string): EventPriority => {
  const now = new Date()
  const target = new Date(`${isoDate}T00:00:00`)
  const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (days <= 3) return "high"
  if (days <= 10) return "medium"
  return "low"
}

const allEventDates = [
  ...mockProjects.map((p) => p.estimatedCompletionDate),
  ...mockCouncilApplications.map((c) => c.targetDecisionDate),
  ...mockPayments.filter((p) => p.status === "pending").map((p) => p.dueDate),
  ...mockMessages.map((m) => toIsoDate(m.timestamp)),
].sort()

const getDefaultDate = () => {
  const todayIso = toIsoDate(new Date())
  const upcoming = allEventDates.find((date) => date >= todayIso)
  return upcoming ? new Date(`${upcoming}T00:00:00`) : new Date()
}

export default function AdminCalendarPage() {
  const initialDate = getDefaultDate()
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [selectedDate, setSelectedDate] = useState(toIsoDate(initialDate))
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [activeCategories, setActiveCategories] = useState<EventCategory[]>([
    "project",
    "council",
    "payment",
    "meeting",
  ])

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1

  const allEvents = useMemo<AdminCalendarEvent[]>(() => {
    const projectEvents: AdminCalendarEvent[] = mockProjects.map((project) => ({
      id: `project-${project.id}`,
      date: project.estimatedCompletionDate,
      title: `Delivery target: ${project.title}`,
      subtitle: `${project.clientName} (${project.progress}% complete)`,
      detail: `Assigned: ${project.agentX ?? "N/A"} / ${project.agentY ?? "N/A"}. Council ref: ${project.councilReference}.`,
      category: "project",
      priority: priorityFromDays(project.estimatedCompletionDate),
    }))

    const councilEvents: AdminCalendarEvent[] = mockCouncilApplications.map((item) => ({
      id: `council-${item.id}`,
      date: item.targetDecisionDate,
      title: `Council decision window (${item.councilRef})`,
      subtitle: `${item.council} - ${item.clientName}`,
      detail: item.comments,
      category: "council",
      priority: priorityFromDays(item.targetDecisionDate),
    }))

    const paymentEvents: AdminCalendarEvent[] = mockPayments
      .filter((payment) => payment.status === "pending")
      .map((payment) => ({
        id: `payment-${payment.id}`,
        date: payment.dueDate,
        title: `Payment due: GBP ${payment.amount}`,
        subtitle: `${payment.clientName} (${payment.package})`,
        detail: payment.description,
        category: "payment",
        priority: priorityFromDays(payment.dueDate),
      }))

    const meetingEvents: AdminCalendarEvent[] = mockMessages.map((message) => {
      const date = toIsoDate(message.timestamp)
      const meetingType = message.isGroupMessage ? "Team sync" : "Follow-up"

      return {
        id: `meeting-${message.id}`,
        date,
        title: `${meetingType}: ${message.subject}`,
        subtitle: `${message.from}${message.to ? ` -> ${message.to}` : ""}`,
        detail: message.body,
        category: "meeting",
        priority: message.priority === "high" ? "high" : "medium",
      }
    })

    return [...projectEvents, ...councilEvents, ...paymentEvents, ...meetingEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
  }, [])

  const filteredEvents = useMemo(
    () => allEvents.filter((event) => activeCategories.includes(event.category)),
    [allEvents, activeCategories],
  )

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, AdminCalendarEvent[]>()

    filteredEvents.forEach((event) => {
      const existing = grouped.get(event.date) ?? []
      existing.push(event)
      grouped.set(event.date, existing)
    })

    return grouped
  }, [filteredEvents])

  const selectedDayEvents = eventsByDate.get(selectedDate) ?? []
  const selectedEvent =
    selectedDayEvents.find((event) => event.id === selectedEventId) ?? selectedDayEvents[0] ?? null

  const upcomingEvents = useMemo(() => {
    const todayIso = toIsoDate(new Date())
    return filteredEvents.filter((event) => event.date >= todayIso).slice(0, 6)
  }, [filteredEvents])

  const monthCounts = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`
    return filteredEvents.reduce(
      (acc, event) => {
        if (!event.date.startsWith(prefix)) return acc
        acc.total += 1
        acc[event.category] += 1
        return acc
      },
      {
        total: 0,
        project: 0,
        council: 0,
        payment: 0,
        meeting: 0,
      },
    )
  }, [filteredEvents, year, month])

  const selectDate = (isoDate: string) => {
    setSelectedDate(isoDate)
    const events = eventsByDate.get(isoDate) ?? []
    setSelectedEventId(events[0]?.id ?? null)
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToToday = () => {
    const now = new Date()
    const iso = toIsoDate(now)
    setCurrentDate(now)
    selectDate(iso)
  }

  const toggleCategory = (category: EventCategory) => {
    setActiveCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    )
  }

  const generateCalendarCells = () => {
    const cells: JSX.Element[] = []

    for (let i = 0; i < startOffset; i++) {
      cells.push(
        <div key={`empty-${i}`} className="border border-slate-200 bg-white min-h-[130px]" />,
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isoDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayEvents = eventsByDate.get(isoDate) ?? []
      const isToday =
        today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
      const isSelected = selectedDate === isoDate

      cells.push(
        <div
          key={day}
          onClick={() => selectDate(isoDate)}
          className={`border border-slate-200 p-2 min-h-[130px] bg-white text-left transition hover:bg-slate-50 cursor-pointer ${
            isToday ? "bg-blue-50" : ""
          } ${isSelected ? "ring-2 ring-blue-500 ring-inset" : ""}`}
        >
          <div
            className={`text-xs mb-2 flex items-center justify-between ${
              isToday ? "text-blue-700 font-semibold" : "text-slate-500"
            }`}
          >
            <span>{day}</span>
            <span className="text-[11px] text-slate-400">{dayEvents.length || ""}</span>
          </div>

          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedDate(isoDate)
                  setSelectedEventId(event.id)
                }}
                className={`w-full text-[11px] px-2 py-1 rounded-md truncate text-left ${categoryMeta[event.category].chipClass} ${priorityClass[event.priority]} ${
                  selectedEvent?.id === event.id ? "ring-2 ring-slate-500" : ""
                }`}
                title={event.title}
              >
                {event.title}
              </button>
            ))}

            {dayEvents.length > 3 && (
              <div className="text-[11px] text-slate-500 px-1">+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>,
      )
    }

    return cells
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold text-slate-900">{monthLabel}</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} className="text-slate-700" />
            </button>

            <button
              onClick={nextMonth}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              aria-label="Next month"
            >
              <ChevronRight size={18} className="text-slate-700" />
            </button>

            <button
              onClick={goToToday}
              className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
            >
              Today
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <Filter size={15} className="text-slate-500" />
          {(["project", "council", "payment", "meeting"] as EventCategory[]).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`text-xs px-2 py-1 rounded-md ${
                activeCategories.includes(category)
                  ? `${categoryMeta[category].chipClass} font-medium`
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {categoryMeta[category].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div>
          <div className="grid grid-cols-7 text-sm text-slate-500 mb-2">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
              <div key={day} className="p-2 font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 border border-slate-200 rounded-lg overflow-hidden">
            {generateCalendarCells()}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-900">Month summary</p>
            <p className="text-xs text-slate-500 mt-1">{monthCounts.total} tracked items</p>

            <div className="mt-3 space-y-2">
              {(["project", "council", "payment", "meeting"] as EventCategory[]).map((category) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${categoryMeta[category].dotClass}`} />
                    <span className="text-slate-600">{categoryMeta[category].label}</span>
                  </div>
                  <span className="font-medium text-slate-900">{monthCounts[category]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-900">Event details</p>
            <p className="text-xs text-slate-500 mt-1">{selectedDate}</p>

            {!selectedEvent && (
              <p className="text-sm text-slate-500 mt-3">Select a date or event chip to view details.</p>
            )}

            {selectedEvent && (
              <div className="mt-3 border border-slate-200 rounded-lg p-3">
                <p className={`inline-flex text-[11px] px-2 py-0.5 rounded ${categoryMeta[selectedEvent.category].chipClass}`}>
                  {categoryMeta[selectedEvent.category].label}
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-2">{selectedEvent.title}</p>
                <p className="text-xs text-slate-500 mt-1">{selectedEvent.subtitle}</p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedEvent.detail}</p>
              </div>
            )}

            <div className="mt-3 space-y-2 max-h-56 overflow-auto pr-1">
              {selectedDayEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEventId(event.id)}
                  className={`w-full border rounded-lg p-2 text-left ${
                    selectedEvent?.id === event.id ? "border-slate-500 bg-slate-50" : "border-slate-200"
                  }`}
                >
                  <p className="text-xs text-slate-800 truncate">{event.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{event.category}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-900">Upcoming</p>
            <div className="mt-3 space-y-2">
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-slate-500">No upcoming events in selected filters.</p>
              )}

              {upcomingEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => {
                    setCurrentDate(new Date(`${event.date}T00:00:00`))
                    setSelectedDate(event.date)
                    setSelectedEventId(event.id)
                  }}
                  className="w-full text-left flex items-start gap-2 text-sm hover:bg-slate-50 rounded-md p-1"
                >
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ${categoryMeta[event.category].dotClass}`} />
                  <div>
                    <p className="text-slate-800 leading-tight">{event.title}</p>
                    <p className="text-xs text-slate-500">{event.date}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

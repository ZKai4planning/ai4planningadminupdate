"use client"

import Link from "next/link"
import { useState } from "react"
import {
  FiAlertCircle,
  FiBook,
  FiMessageCircle,
  FiShield,
  FiX,
} from "react-icons/fi"

export default function HelpWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Help Card */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50">
          <div className="w-72 rounded-2xl bg-neutral-900 text-white shadow-2xl p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Superadmin Console</p>
                <h3 className="text-base font-semibold">Help and feedback</h3>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Items */}
            <ul className="space-y-1">
              <HelpItem
                icon={<FiAlertCircle />}
                label="Review system alerts"
                href="/admin/system-alerts"
                onClick={() => setOpen(false)}
              />
              <HelpItem
                icon={<FiShield />}
                label="Manage admin access"
                href="/admin/admin-access"
                onClick={() => setOpen(false)}
              />
              <HelpItem
                icon={<FiBook />}
                label="Operations docs"
                href="/admin/operations-docs"
                onClick={() => setOpen(false)}
              />
              <HelpItem
                icon={<FiMessageCircle />}
                label="Got feedback?"
                href="/admin/feedback"
                onClick={() => setOpen(false)}
              />
            </ul>
          </div>
        </div>
      )}

      {/* HELP BUTTON */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-15 right-6 z-50
        bg-white text-black text-sm px-4 py-2
        rounded-full shadow-lg hover:bg-gray-100"
      >
        Help and feedback
      </button>
    </>
  )
}

function HelpItem({
  icon,
  label,
  href,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  href: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="w-full flex items-center justify-between
      px-3 py-2 rounded-lg
      hover:bg-neutral-800 transition"
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-300">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-gray-500">{">"}</span>
    </Link>
  )
}

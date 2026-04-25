"use client"

export function DashboardFooter() {
  return (
    <footer className="flex w-full flex-col gap-2 border-t border-[#dbdfe6] bg-white px-4 py-4 text-xs text-[#616f89] dark:border-gray-800 dark:bg-[#101622] dark:text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
      <div className="flex flex-wrap gap-3 sm:gap-6">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          System Ready
        </span>
        <span>Region: EU-East-1</span>
      </div>
      <div className="text-left sm:text-right">© 2026 Ai4Planning</div>
    </footer>
  )
}

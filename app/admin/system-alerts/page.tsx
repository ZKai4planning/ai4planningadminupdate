import { AlertTriangle, Clock3 } from "lucide-react";
import { mockSystemAlerts } from "@/app/lib/mock-data";

const severityStyles = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-blue-50 text-blue-700 border-blue-200",
} as const;

const statusStyles = {
  open: "bg-red-100 text-red-700",
  investigating: "bg-amber-100 text-amber-700",
  monitoring: "bg-blue-100 text-blue-700",
} as const;

export default function SystemAlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Alerts</h1>
        <p className="text-slate-600 mt-2">
          Operational alerts requiring superadmin visibility and follow-up.
        </p>
      </div>

      <div className="grid gap-4">
        {mockSystemAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-slate-100 p-2 mt-1">
                  <AlertTriangle className="h-4 w-4 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold">
                    {alert.service}
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {alert.title}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Owner: {alert.owner}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${severityStyles[alert.severity as keyof typeof severityStyles]}`}
                >
                  {alert.severity.toUpperCase()}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[alert.status as keyof typeof statusStyles]}`}
                >
                  {alert.status}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <Clock3 className="h-4 w-4" />
              {new Date(alert.createdAt).toLocaleString("en-GB")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

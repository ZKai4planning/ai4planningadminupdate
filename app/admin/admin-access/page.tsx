import { ShieldCheck } from "lucide-react";
import { mockAdminAccessLogs } from "@/app/lib/mock-data";

const resultStyles = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blocked: "bg-red-50 text-red-700 border-red-200",
} as const;

export default function AdminAccessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Access</h1>
        <p className="text-slate-600 mt-2">
          Track privileged actions and blocked attempts across admin users.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <p className="font-semibold text-slate-900">Recent Access Activity</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-5 py-3 font-semibold">Admin</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">IP</th>
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody>
              {mockAdminAccessLogs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    {log.adminName}
                  </td>
                  <td className="px-5 py-3 text-slate-700">{log.role}</td>
                  <td className="px-5 py-3 text-slate-700">{log.action}</td>
                  <td className="px-5 py-3 text-slate-700">{log.sourceIp}</td>
                  <td className="px-5 py-3 text-slate-700">
                    {new Date(log.timestamp).toLocaleString("en-GB")}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${resultStyles[log.result as keyof typeof resultStyles]}`}
                    >
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

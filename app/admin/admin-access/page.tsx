import { ShieldCheck } from "lucide-react";
import { mockAdminAccessLogs } from "@/app/lib/mock-data";

const resultStyles = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blocked: "bg-red-50 text-red-700 border-red-200",
} as const;

export default function AdminAccessPage() {
  const roleMatrix = [
    { role: "admin", view: true, edit: true, export: true, delete: true },
    { role: "agent_x", view: true, edit: true, export: true, delete: false },
    { role: "agent_y", view: true, edit: true, export: false, delete: false },
    { role: "architect", view: true, edit: false, export: false, delete: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Access</h1>
        <p className="text-slate-600 mt-2">
          Role-based access control and immutable privileged action trail.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <p className="font-semibold text-slate-900">Role Permission Matrix</p>
          <p className="text-xs text-slate-500 mt-1">Current operational policy for sensitive actions.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">View</th>
                <th className="px-5 py-3 font-semibold">Edit</th>
                <th className="px-5 py-3 font-semibold">Export</th>
                <th className="px-5 py-3 font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody>
              {roleMatrix.map((row) => (
                <tr key={row.role} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-semibold text-slate-900">{row.role}</td>
                  <td className="px-5 py-3">{row.view ? "Yes" : "No"}</td>
                  <td className="px-5 py-3">{row.edit ? "Yes" : "No"}</td>
                  <td className="px-5 py-3">{row.export ? "Yes" : "No"}</td>
                  <td className="px-5 py-3">{row.delete ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

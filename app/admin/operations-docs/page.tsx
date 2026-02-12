import { FileText } from "lucide-react";
import { mockOperationsDocs } from "@/app/lib/mock-data";

export default function OperationsDocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Operations Docs</h1>
        <p className="text-slate-600 mt-2">
          Quick access to runbooks and process documentation for superadmins.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockOperationsDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-2 mt-1">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase font-semibold text-slate-500">
                  {doc.category}
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  {doc.title}
                </h2>
                <p className="text-sm text-slate-600">Owner: {doc.owner}</p>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>Updated: {new Date(doc.updatedAt).toLocaleDateString("en-GB")}</span>
                  <span>Read time: {doc.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { BarChart3, Eye, EyeOff, ExternalLink, Mail, Phone } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import type { Client, Project } from "@/types";

type ProjectOverviewStats = {
  assigned: number;
  daysOpen: number;
  documents: number;
  completedSteps: number;
};

const formatDateLabel = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "Not available";

export default function ProjectOverview({
  project,
  selectedClient,
  selectedStats,
  initialPaymentDate,
  currentJourneyStage,
  lastUpdateSummary,
  progress,
}: {
  project: Project;
  selectedClient: Client | null;
  selectedStats: ProjectOverviewStats | null;
  initialPaymentDate: string | null;
  currentJourneyStage: string;
  lastUpdateSummary: string;
  progress: number;
}) {
  const [revealContact, setRevealContact] = useState({
    email: false,
    phone: false,
  });

  useEffect(() => {
    setRevealContact({ email: false, phone: false });
  }, [project.id]);

  return (
    <section className="mb-8 rounded-2xl border border-slate-200/80 bg-slate-50/40 p-5">
            {selectedStats && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Days Open</p>
            <div className="flex items-center gap-4">
              <div
                className="relative w-20 h-20 rounded-full"
                style={{
                  background: `conic-gradient(#10b981 ${Math.min(
                    100,
                    Math.round((selectedStats.daysOpen / 90) * 100),
                  )}%, #e2e8f0 0)`,
                }}
              >
                <div className="absolute inset-[6px] rounded-full bg-white flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">
                    {selectedStats.daysOpen}d
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Target 90 days</p>
                <p className="text-xs text-slate-500">Open duration</p>
              </div>
            </div>
          </div>

          <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Documents</p>
            <div className="flex items-center gap-4">
              <div
                className="relative w-20 h-20 rounded-full"
                style={{
                  background: `conic-gradient(#3b82f6 ${Math.min(
                    100,
                    Math.round((selectedStats.documents / 8) * 100),
                  )}%, #e2e8f0 0)`,
                }}
              >
                <div className="absolute inset-[6px] rounded-full bg-white flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">
                    {selectedStats.documents}
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Files shared</p>
                <p className="text-xs text-slate-500">Up to 8+ docs typical</p>
              </div>
            </div>
          </div>

          <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <p className="text-sm font-semibold text-slate-700">Payment Breakdown</p>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden bg-slate-200">
              <div className="h-full bg-blue-500" style={{ width: "70%" }} />
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-2">
              <span>Paid 70%</span>
              <span>Remaining 30%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Initial payment captured at project kickoff.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">

        
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">
            Client Information
          </p>
          <p className="text-lg font-semibold text-slate-900 mt-2">
            {project.clientName}
          </p>
          <p className="text-xs text-slate-500 mt-1">Client ID: {project.clientId}</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-900">
                {revealContact.email && selectedClient
                  ? selectedClient.email
                  : ".........."}
              </span>
              <button
                type="button"
                onClick={() =>
                  setRevealContact((prev) => ({
                    ...prev,
                    email: !prev.email,
                  }))
                }
                className="text-slate-400 hover:text-slate-600"
                aria-label="Toggle email visibility"
              >
                {revealContact.email ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-900">
                {revealContact.phone && selectedClient
                  ? selectedClient.phone
                  : ".........."}
              </span>
              <button
                type="button"
                onClick={() =>
                  setRevealContact((prev) => ({
                    ...prev,
                    phone: !prev.phone,
                  }))
                }
                className="text-slate-400 hover:text-slate-600"
                aria-label="Toggle phone visibility"
              >
                {revealContact.phone ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p>
              Address:{" "}
              <span className="font-semibold text-slate-900">{project.location}</span>
            </p>
            <p>
              Postcode:{" "}
              <span className="font-semibold text-slate-900">{project.postcode}</span>
            </p>
          </div>
        </div>

        <div className="border border-slate-200/80 rounded-2xl p-5 bg-white">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Project Information
            </p>
            <StatusBadge status={project.status} type="project" />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Project ID</p>
              <p className="font-semibold text-slate-900 mt-1">{project.id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Tenant ID</p>
              <p className="font-semibold text-slate-900 mt-1">{project.id2 || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Service / Sub Service
              </p>
              <p className="font-semibold text-slate-900 mt-1">
                {(project.selectedService || project.serviceType) +
                  " / " +
                  (project.selectedSubService || "Not specified")}
              </p>
            </div>
        
          </div>
        </div>

        <div className="border border-slate-200/80 rounded-2xl p-5 bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Last Update</p>
          <p className="text-lg font-semibold text-slate-900 mt-2 capitalize">
            {project.status.replace(/_/g, " ")}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Updated on {formatDateLabel(project.updatedDate)}
          </p>
          <p className="text-sm text-slate-700 mt-3 leading-relaxed">
            {lastUpdateSummary}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <p>
              Current stage:{" "}
              <span className="font-semibold text-slate-900">{currentJourneyStage}</span>
            </p>
            {/* <p>
              Documents:{" "}
              <span className="font-semibold text-slate-900">
                {project.documents.length}
              </span>
            </p> */}
          </div>
        </div>
      </div>


      <div className="mb-6 border border-slate-200/80 rounded-2xl p-5 bg-white">
        <p className="text-sm font-semibold text-slate-900 mb-4">Key Milestones</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Created</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {formatDateLabel(project.createdDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Initial Payment</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {formatDateLabel(initialPaymentDate || undefined)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Agent X Assigned</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {formatDateLabel(project.agentXAssignedDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Agent Y Assigned</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {formatDateLabel(project.agentYAssignedDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Last Updated</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {formatDateLabel(project.updatedDate)}
            </p>
          </div>
        </div>
      </div>

      {/* <div id="documents" className="border border-slate-200/80 rounded-2xl p-5 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Documents Center</p>
            <p className="text-xs text-slate-500 mt-1">
              {project.documents.length} files available
            </p>
          </div>
        </div>

        {project.documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No documents uploaded yet. Share files to start internal review.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-slate-200/80 rounded-xl p-4 bg-slate-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{doc.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      v{doc.version} -{" "}
                      {new Date(doc.uploadedDate).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <StatusBadge status={doc.status} type="document" />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div> */}
    </section>
  );
}

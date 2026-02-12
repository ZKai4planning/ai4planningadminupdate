"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import DataTable, { Column } from "@/components/datatable";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Users,
} from "lucide-react";
import { mockProjects } from "@/app/lib/mock-data";
import { useSearchParams } from "next/navigation";

const journeySteps = [
  "User logged in",
  "Selected service",
  "Made initial payment",
  "Project created between client and Agent X",
  "Consultant assigned",
  "70% payment made",
  "Project creation between Agent X and Agent Y",
  "Documents shared with Agent X",
  "30% remaining payment",
  "Submitted to council",
];

const getCompletedSteps = (progress: number) =>
  Math.min(
    journeySteps.length,
    Math.floor((progress / 100) * journeySteps.length),
  );

type ProjectTableRow = {
  id: string;
  clientName: string;
  clientId: string;
  agentX: string;
  agentY: string;
  projectId1: string;
  projectId2: string;
  isActive: boolean;
  statusLabel: "Open" | "Closed";
};

function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const [searchTerm] = useState("");
  const [filterStatus] = useState("");
  const [selectedProject, setSelectedProject] = useState<
    (typeof mockProjects)[0] | null
  >(null);
  const [activeStep, setActiveStep] = useState(0);

  const [projects] = useState(mockProjects);

  const projectStats = useMemo(() => {
    const totalProjects = projects.length;
    const closedProjects = projects.filter((project) =>
      ["approved", "rejected"].includes(project.status),
    ).length;
    const openProjects = totalProjects - closedProjects;
    const avgProgress = totalProjects
      ? Math.round(
          projects.reduce((sum, project) => sum + project.progress, 0) /
            totalProjects,
        )
      : 0;

    return {
      totalProjects,
      openProjects,
      closedProjects,
      avgProgress,
    };
  }, [projects]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const projectTableRows = useMemo<ProjectTableRow[]>(() => {
    return filteredProjects.map((project) => {
      const clientProjects = filteredProjects.filter(
        (p) => p.clientId === project.clientId,
      );
      const isClosed = ["approved", "rejected"].includes(project.status);

      return {
        id: project.id,
        clientName: project.clientName,
        clientId: project.clientId,
        agentX: project.agentX || "Unassigned",
        agentY: project.agentY || "Unassigned",
        projectId1: clientProjects[0]?.id || project.id,
        projectId2: clientProjects[1]?.id || "-",
        isActive: !isClosed,
        statusLabel: isClosed ? "Closed" : "Open",
      };
    });
  }, [filteredProjects]);

  const projectColumns = useMemo<Column<ProjectTableRow>[]>(
    () => [
      {
        key: "sno",
        label: "S.No",
        render: (_value, _row, index, startIndex) => (
          <span className="font-semibold">{startIndex + index + 1}</span>
        ),
        sticky: true,
        left: 0,
      },
      {
        key: "clientName",
        label: "Client Name",
        sortable: true,
        render: (value) => (
          <span className="font-semibold text-slate-900">{value}</span>
        ),
      },
      {
        key: "clientId",
        label: "Client ID",
        sortable: true,
      },
      {
        key: "agentX",
        label: "Agent X",
        sortable: true,
      },
      {
        key: "agentY",
        label: "Agent Y",
        sortable: true,
      },
      {
        key: "projectId1",
        label: "Project ID 1",
        sortable: true,
      },
      {
        key: "projectId2",
        label: "Project ID 2",
        sortable: true,
      },
      {
        key: "statusLabel",
        label: "Status",
        sortable: true,
        render: (value) => (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              value === "Closed"
                ? "bg-blue-50 text-blue-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {value}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Action",
        render: (_value, row) => (
          <button
            type="button"
            onClick={() =>
              setSelectedProject(
                projects.find((project) => project.id === row.id) ?? null,
              )
            }
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        ),
      },
    ],
    [projects],
  );

  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return;
    }
    const match = projects.find((project) => project.id === projectId);
    if (match) {
      setSelectedProject(match);
      const completed = getCompletedSteps(match.progress);
      setActiveStep(Math.max(0, completed - 1));
    }
  }, [projects, searchParams]);

  const selectedStats = useMemo(() => {
    if (!selectedProject) {
      return null;
    }
    const assigned = [
      selectedProject.agentX,
      selectedProject.agentY,
      selectedProject.architect,
    ].filter(Boolean).length;
    const created = new Date(selectedProject.createdDate);
    const daysOpen = Math.max(
      0,
      Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const completedSteps = getCompletedSteps(selectedProject.progress);
    return {
      assigned,
      daysOpen,
      documents: selectedProject.documents.length,
      completedSteps,
    };
  }, [selectedProject]);

  const stepInsights = useMemo(() => {
    if (!selectedProject) {
      return [];
    }
    const agentX = selectedProject.agentX || "Unassigned";
    const agentY = selectedProject.agentY || "Unassigned";
    const architect = selectedProject.architect || "Unassigned";
    return [
      {
        title: "User logged in",
        stage: "Onboarding",
        owner: "Client",
        summary:
          "Client authentication completed and the session is verified for the project workflow.",
        kpis: [
          { label: "Client", value: selectedProject.clientName },
          { label: "Project ID", value: selectedProject.id },
          {
            label: "Created",
            value: new Date(selectedProject.createdDate).toLocaleDateString(
              "en-GB",
            ),
          },
        ],
        notes: ["Login verified", "Profile synced", "Initial session created"],
      },
      {
        title: "Selected service",
        stage: "Service Intake",
        owner: "Client",
        summary:
          "Service selection captured and validated for feasibility review.",
        kpis: [
          { label: "Service", value: selectedProject.serviceType },
          { label: "Location", value: selectedProject.location },
          { label: "Postcode", value: selectedProject.postcode },
        ],
        notes: ["Service option confirmed", "Scope locked for assessment"],
      },
      {
        title: "Made initial payment",
        stage: "Billing",
        owner: "Finance",
        summary: "Initial payment captured to kick off the project lifecycle.",
        kpis: [
          { label: "Paid", value: "70%" },
          { label: "Remaining", value: "30%" },
          { label: "Status", value: "On track" },
        ],
        notes: ["Payment received", "Invoice issued"],
      },
      {
        title: "Project created between client and Agent X",
        stage: "Assignment",
        owner: "Agent X",
        summary:
          "Project workspace created and assigned to Agent X for initial setup.",
        kpis: [
          { label: "Agent X", value: agentX },
          { label: "Status", value: selectedProject.status.replace(/_/g, " ") },
          {
            label: "Start",
            value: new Date(selectedProject.createdDate).toLocaleDateString(
              "en-GB",
            ),
          },
        ],
        notes: ["Workspace created", "Client onboarding completed"],
      },
      {
        title: "Consultant assigned",
        stage: "Consultation",
        owner: "Consultant",
        summary:
          "Consultant assigned to review scope and coordinate next steps.",
        kpis: [
          { label: "Consultant", value: architect },
          { label: "Team", value: `${agentX} / ${agentY}` },
          { label: "Handoff", value: "Completed" },
        ],
        notes: ["Internal handoff done", "Kickoff completed"],
      },
      {
        title: "70% payment made",
        stage: "Billing",
        owner: "Finance",
        summary: "Payment milestone reached, enabling cross-team execution.",
        kpis: [
          { label: "Payment", value: "70% paid" },
          { label: "Phase", value: "Collaboration" },
          { label: "Risk", value: "Low" },
        ],
        notes: ["Milestone achieved", "Execution phase started"],
      },
      {
        title: "Project creation between Agent X and Agent Y",
        stage: "Cross-team",
        owner: "Agent X + Agent Y",
        summary: "Cross-team coordination established for delivery alignment.",
        kpis: [
          { label: "Agent X", value: agentX },
          { label: "Agent Y", value: agentY },
          { label: "Collaboration", value: "Active" },
        ],
        notes: ["Cross-team setup completed", "Dependencies aligned"],
      },
      {
        title: "Documents shared with Agent X",
        stage: "Documents",
        owner: "Agent X",
        summary: "Key documents shared and initial work completed.",
        kpis: [
          { label: "Documents", value: `${selectedProject.documents.length}` },
          {
            label: "Updated",
            value: new Date(selectedProject.updatedDate).toLocaleDateString(
              "en-GB",
            ),
          },
          { label: "Progress", value: `${selectedProject.progress}%` },
        ],
        notes: ["Documents verified", "Work in progress"],
      },
      {
        title: "30% remaining payment",
        stage: "Billing",
        owner: "Finance",
        summary: "Final payment pending prior to council submission.",
        kpis: [
          { label: "Pending", value: "30%" },
          { label: "Council", value: selectedProject.councilName },
          { label: "Reference", value: selectedProject.councilReference },
        ],
        notes: ["Payment reminder sent", "Awaiting settlement"],
      },
      {
        title: "Submitted to council",
        stage: "Submission",
        owner: "Consultant",
        summary:
          "Project submitted for approval and awaiting council decision.",
        kpis: [
          { label: "Council", value: selectedProject.councilName },
          { label: "Reference", value: selectedProject.councilReference },
          {
            label: "Updated",
            value: new Date(selectedProject.updatedDate).toLocaleDateString(
              "en-GB",
            ),
          },
        ],
        notes: ["Submission completed", "Decision pending"],
      },
    ];
  }, [selectedProject]);

  const activeInsight = stepInsights[activeStep];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        {selectedProject && (
          <>
            <button
              onClick={() => setSelectedProject(null)}
              className="mb-1 text-sm text-blue-600 hover:underline"
            >
              ← Back to projects
            </button>

            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              {selectedProject.title}
            </h2>

            {/* Top-right corner */}
            <div className="absolute top-0 right-0 text-right text-sm text-slate-600">
              <p>Project ID: {selectedProject.id}</p>
              <p>{selectedProject.clientName}</p>
            </div>
          </>
        )}
      </div>

      {/* Projects List or Selected Detail */}
      {selectedProject ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Project Overview
            </h2>
            <span className="text-xs text-slate-500">
              Internal summary & stats
            </span>
          </div>

          <section className="mb-8 rounded-2xl border border-slate-200/80 bg-slate-50/40 p-5">
            {selectedStats && (
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Assigned Team
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {selectedStats.assigned}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Documents
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {selectedStats.documents}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Days Open
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {selectedStats.daysOpen}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Flow Steps Done
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {selectedStats.completedSteps}/{journeySteps.length}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                      Days Open
                    </p>
                    <div className="flex items-center gap-4">
                      <div
                        className="relative w-20 h-20 rounded-full"
                        style={{
                          background: `conic-gradient(#10b981 ${Math.min(100, Math.round((selectedStats.daysOpen / 90) * 100))}%, #e2e8f0 0)`,
                        }}
                      >
                        <div className="absolute inset-[6px] rounded-full bg-white flex items-center justify-center">
                          <span className="text-sm font-bold text-slate-900">
                            {selectedStats.daysOpen}d
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">
                          Target 90 days
                        </p>
                        <p className="text-xs text-slate-500">Open duration</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                      Documents
                    </p>
                    <div className="flex items-center gap-4">
                      <div
                        className="relative w-20 h-20 rounded-full"
                        style={{
                          background: `conic-gradient(#3b82f6 ${Math.min(100, Math.round((selectedStats.documents / 8) * 100))}%, #e2e8f0 0)`,
                        }}
                      >
                        <div className="absolute inset-[6px] rounded-full bg-white flex items-center justify-center">
                          <span className="text-sm font-bold text-slate-900">
                            {selectedStats.documents}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">
                          Files shared
                        </p>
                        <p className="text-xs text-slate-500">
                          Up to 8+ docs typical
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-700">
                        Payment Breakdown
                      </p>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden bg-slate-200">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: "70%" }}
                      />
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
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="border border-slate-200/80 rounded-2xl p-5 bg-white">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Client Overview
                </p>
                <p className="text-lg font-semibold text-slate-900 mt-2">
                  {selectedProject.clientName}
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>
                    Service:{" "}
                    <span className="font-semibold text-slate-900 capitalize">
                      {selectedProject.serviceType}
                    </span>
                  </p>
                  <p>
                    Location:{" "}
                    <span className="font-semibold text-slate-900">
                      {selectedProject.location}
                    </span>
                  </p>
                  <p>
                    Postcode:{" "}
                    <span className="font-semibold text-slate-900">
                      {selectedProject.postcode}
                    </span>
                  </p>
                </div>
              </div>
              <div className="border border-slate-200/80 rounded-2xl p-5 bg-white">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Agent X Team
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                    {selectedProject.agentX
                      ? selectedProject.agentX.charAt(0)
                      : "X"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedProject.agentX || "Unassigned"}
                    </p>
                    <p className="text-xs text-slate-500">
                      London • Lead Agent
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                  <Users className="w-4 h-4 text-blue-600" />
                  Assigned team members synced
                </div>
              </div>
              <div className="border border-slate-200/80 rounded-2xl p-5 bg-white">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Agent Y Team
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                    {selectedProject.agentY
                      ? selectedProject.agentY.charAt(0)
                      : "Y"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedProject.agentY || "Unassigned"}
                    </p>
                    <p className="text-xs text-slate-500">
                      India • Execution Team
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Cross-team workflow active
                </div>
              </div>
            </div>

            <div className="mb-6 border border-slate-200/80 rounded-2xl p-5 bg-white">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-900">
                  Project Details
                </p>
                <StatusBadge status={selectedProject.status} type="project" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Client
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {selectedProject.clientName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Service
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 capitalize">
                    {selectedProject.serviceType}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Location
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {selectedProject.location}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Postcode
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {selectedProject.postcode}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Council
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {selectedProject.councilName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Council Ref
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {selectedProject.councilReference}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Agent X
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {selectedProject.agentX || "Unassigned"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Agent Y
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {selectedProject.agentY || "Unassigned"}
                  </p>
                </div>
              </div>
            </div>

            <div
              id="documents"
              className="border border-slate-200/80 rounded-2xl p-5 bg-white"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Documents Center
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedProject.documents.length} files available
                  </p>
                </div>
              </div>

              {selectedProject.documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No documents uploaded yet. Share files to start internal
                  review.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProject.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-slate-200/80 rounded-xl p-4 bg-slate-50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {doc.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            v{doc.version} •{" "}
                            {new Date(doc.uploadedDate).toLocaleDateString(
                              "en-GB",
                            )}
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
            </div>
          </section>

          <section className="mb-6 border border-slate-200/80 rounded-2xl p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-900">
                Client Journey
              </p>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Step {activeStep + 1} of {journeySteps.length}
              </span>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex items-start min-w-max">
                {journeySteps.map((step, index) => {
                  const done = selectedStats
                    ? index < selectedStats.completedSteps
                    : false;
                  const isActive = activeStep === index;
                  const connectorClass = done
                    ? "bg-blue-200"
                    : isActive
                      ? "bg-blue-200"
                      : "bg-slate-200";
                  return (
                    <div key={step} className="flex items-start">
                      <button
                        type="button"
                        onClick={() => setActiveStep(index)}
                        className="flex flex-col items-center gap-2 px-3"
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors shadow-sm ${
                            done
                              ? "bg-blue-600 border-blue-600 text-white"
                              : isActive
                                ? "bg-white border-2 border-blue-500 text-blue-600"
                                : "bg-slate-100 border-slate-200 text-slate-500"
                          }`}
                        >
                          {done ? (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full text-white text-blue-600">
                              <CheckCircle2 className="w-5 h-5" />
                            </span>
                          ) : isActive ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                          )}
                        </span>
                        <span
                          className={`text-[11px] font-semibold text-center max-w-[120px] ${
                            isActive
                              ? "text-blue-600"
                              : done
                                ? "text-blue-700"
                                : "text-slate-500"
                          }`}
                        >
                          {step}
                        </span>
                      </button>
                      {index < journeySteps.length - 1 && (
                        <div
                          className={`w-10 md:w-14 h-px mt-5 ${connectorClass}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {activeInsight && (
            <section className="mb-6 border border-slate-200/80 rounded-2xl p-5 bg-slate-50/40">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-900">
               Step Details
                </p>
              
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 border border-slate-200/80 rounded-2xl p-5 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">
                        Step Details
                      </p>
                      <h3 className="text-lg font-semibold text-slate-900 mt-1">
                        {activeInsight.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-2">
                        {activeInsight.summary}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase">Stage</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {activeInsight.stage}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Owner: {activeInsight.owner}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeInsight.kpis.map((kpi) => (
                      <div
                        key={kpi.label}
                        className="border border-slate-200/80 rounded-xl p-3 bg-slate-50"
                      >
                        <p className="text-xs font-semibold text-slate-500 uppercase">
                          {kpi.label}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">
                          {kpi.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-slate-200/80 rounded-2xl p-5 bg-white">
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Internal Notes
                  </p>
                  <div className="mt-3 space-y-2">
                    {activeInsight.notes.map((note) => (
                      <div key={note} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                        <p className="text-sm text-slate-700">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Total Projects
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {projectStats.totalProjects}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Open Projects
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {projectStats.openProjects}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Closed Projects
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {projectStats.closedProjects}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Avg Progress
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {projectStats.avgProgress}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {filteredProjects.length} Project
                {filteredProjects.length !== 1 ? "s" : ""}
              </h2>
              <span className="text-xs text-slate-500">
                Search, filter, sort and open project details
              </span>
            </div>
            <DataTable data={projectTableRows} columns={projectColumns} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-slate-500">Loading projects...</div>
      }
    >
      <ProjectsPageContent />
    </Suspense>
  );
}

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import DataTable, { Column } from "@/components/datatable";
import { mockClients, mockPayments, mockProjects } from "@/app/lib/mock-data";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProjectOverview from "@/components/projects/ProjectOverview";
import ProjectRoadmap, {
  type RoadmapInsight,
} from "@/components/projects/ProjectRoadmap";

const journeySteps = [
  "Service Selection",
  "Initial payment",
  "Eligibility Check",
  "Consultant Assignment",
  "Project Assigned to Agent Y",
   "Briefcase Creation",
  "70% Advance Payment",
  "Documents shared with Agent X",
  "30% remaining payment",
  "Council Submission",
];

const projectAssignedToAgentYStepIndex = journeySteps.findIndex(
  (step) => step === "Project Assigned to Agent Y",
);

const completedStepsByStatus: Record<string, number> = {
  pending: 0,
  registered: 1,
  docs_received: 2,
  in_review: 2,
  architect_assigned: 4,
  measurements_done: 5,
  drawings_in_progress: 6,
  drawings_received: 7,
  submitted_to_council: 10,
  approved: 10,
  rejected: 10,
};

const getCompletedStepsForProject = (project: (typeof mockProjects)[0]) =>
  completedStepsByStatus[project.status] ??
  Math.min(
    journeySteps.length,
    Math.floor((project.progress / 100) * journeySteps.length),
  );

const getProgressForProject = (project: (typeof mockProjects)[0]) =>
  Math.round(
    (getCompletedStepsForProject(project) / journeySteps.length) * 100,
  );

const getProjectUpdateSummary = (status: string) => {
  const summaryByStatus: Record<string, string> = {
    pending: "Project has been created and is waiting for intake validation.",
    registered: "Client registration is complete and onboarding has started.",
    docs_received: "Initial documents were received and queued for review.",
    in_review: "Project is currently under internal planning review.",
    architect_assigned:
      "Architect is assigned and design activities are in progress.",
    measurements_done: "Site measurements are complete and verified.",
    drawings_in_progress: "Draft drawings are being prepared by the team.",
    drawings_received: "Drawings have been received and are being validated.",
    submitted_to_council:
      "Application has been submitted to council and is awaiting response.",
    approved: "Council decision received: approved.",
    rejected: "Council decision received: rejected.",
  };

  return (
    summaryByStatus[status] ||
    "Project was updated and is moving through workflow."
  );
};

type ProjectTableRow = {
  id: string;
  clientName: string;
  clientId: string;
  agentX: string;
  agentY: string;
  projectId: string;
  tenantId: string;
  isActive: boolean;
  statusLabel: "Open" | "Closed";
};

function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const referenceNow = new Date("2026-02-19T00:00:00Z").getTime();
  const [searchTerm] = useState("");
  const [filterStatus] = useState("");
  const [selectedProject, setSelectedProject] = useState<
    (typeof mockProjects)[0] | null
  >(null);
  const [activeProjectTab, setActiveProjectTab] = useState<
    "overview" | "journey"
  >("overview");
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
          projects.reduce(
            (sum, project) => sum + getProgressForProject(project),
            0,
          ) / totalProjects,
        )
      : 0;

    return {
      totalProjects,
      openProjects,
      closedProjects,
      avgProgress,
    };
  }, [projects]);

  const statsCards = useMemo(
    () => [
      {
        label: "Total Projects",
        value: `${projectStats.totalProjects}`,
        tone: "text-slate-900",
      },
      {
        label: "Open Projects",
        value: `${projectStats.openProjects}`,
        tone: "text-blue-600",
      },
      {
        label: "Closed Projects",
        value: `${projectStats.closedProjects}`,
        tone: "text-blue-600",
      },
      {
        label: "Avg Progress",
        value: `${projectStats.avgProgress}%`,
        tone: "text-slate-900",
      },
    ],
    [projectStats],
  );

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
        projectId: clientProjects[0]?.id || project.id,
        tenantId: clientProjects[1]?.id2 || project.id2 || "N/A",
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
        key: "projectId",
        label: "Project ID",
        sortable: true,
      },
      {
        key: "tenantId",
        label: "Tenant ID",
        sortable: true,
      },
      {
        key: "statusLabel",
        label: "Status",
        sortable: true,
        render: (value) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
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
            onClick={() => {
              setSelectedProject(
                projects.find((project) => project.id === row.id) ?? null,
              );
              setActiveProjectTab("overview");
            }}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
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
      setActiveProjectTab("overview");
      const completed = getCompletedStepsForProject(match);
      setActiveStep(Math.max(0, completed - 1));
    }
  }, [projects, searchParams]);

  useEffect(() => {
    if (!selectedProject || activeProjectTab !== "journey") {
      return;
    }

    if (projectAssignedToAgentYStepIndex >= 0) {
      setActiveStep(projectAssignedToAgentYStepIndex);
    }
  }, [selectedProject, activeProjectTab]);

  const selectedClient = useMemo(() => {
    if (!selectedProject) {
      return null;
    }
    return (
      mockClients.find((client) => client.id === selectedProject.clientId) ??
      null
    );
  }, [selectedProject, referenceNow]);

  const initialPaymentDate = useMemo(() => {
    if (!selectedProject) {
      return null;
    }
    if (selectedProject.initialPaymentDate) {
      return selectedProject.initialPaymentDate;
    }
    const payment = mockPayments.find(
      (item) =>
        item.projectId === selectedProject.id && item.status === "completed",
    );
    return payment?.paymentDate ?? null;
  }, [selectedProject]);

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
      Math.floor((referenceNow - created.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const completedSteps = getCompletedStepsForProject(selectedProject);
    return {
      assigned,
      daysOpen,
      documents: selectedProject.documents.length,
      completedSteps,
    };
  }, [selectedProject]);

  const stepInsights = useMemo<RoadmapInsight[]>(() => {
    if (!selectedProject) {
      return [];
    }
    const agentX = selectedProject.agentX || "Unassigned";
    const agentY = selectedProject.agentY || "Unassigned";
    const architect = selectedProject.architect || "Unassigned";
    const normalizedServiceType =
      selectedProject.serviceType.charAt(0).toUpperCase() +
      selectedProject.serviceType.slice(1);
    const selectedServiceLabel =
      selectedProject.selectedService || normalizedServiceType;
    const selectedSubServiceLabel =
      selectedProject.selectedSubService || "Not specified";

    return [
      {
        title: "Service selection",
        stage: "Service Intake",
       
        summary:
          "Client session validated and selected service preferences captured.",
        kpis: [
          { label: "Service", value: selectedServiceLabel },
          { label: "Sub Service", value: selectedSubServiceLabel },
          { label: "Location", value: selectedProject.location },
          { label: "Service Id", value: selectedProject.serviceId },
        ],
        notes: [
          "Service selected by client",
          "Sub-service option captured",
          "Ready for eligibility checks",
        ],
      },
      {
        title: "Initial payment",
        stage: "Billing",
       
        summary: "Initial payment captured to kick off the project lifecycle.",
        kpis: [
          { label: "Paid", value: "39.99" },
          { label: "Status", value: "On track" },
        ],
        notes: ["Payment received"],
      },
      {
        title: "Eligibility check",
        stage: "Screening",
       
        summary:
          "Initial property details and planning constraints captured for eligibility screening.",
        kpis: [],
        notes: [
          "Questionnaire responses captured",
          "Constraints recorded for validation",
          "Ready for consultant review",
        ],
      },
      {
        title: "Consultant assigned",
        stage: "Consultation",
  
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
        title: "Project Assigned to Agent Y",
        stage: "Cross-team",
   
        summary: "Cross-team coordination established for delivery alignment.",
        kpis: [
          { label: "Agent X", value: agentX },
          { label: "Agent Y", value: agentY },
          { label: "Collaboration", value: "Active" },
        ],
        notes: ["Cross-team setup completed", "Dependencies aligned"],
      },
      {
        title: "Briefcase creation",
        stage: "Handover Package",

        summary:
          "Execution briefcase is created with all scoped documents, constraints, and handoff notes.",
        kpis: [
          { label: "Package", value: "Created" },
          { label: "Owner", value: agentX },
          { label: "Shared With", value: agentY },
        ],
        notes: [
          "Handoff brief prepared and versioned",
          "Supporting documents attached to execution package",
          "Ready for 70% payment milestone and downstream tasks",
        ],
      },
      {
        title: "70% payment made",
        stage: "Billing",
   
        summary: "Payment milestone reached, enabling cross-team execution.",
        kpis: [
          { label: "Payment", value: "70% paid" },
          { label: "Phase", value: "Collaboration" },
          { label: "Risk", value: "Low" },
        ],
        notes: ["Milestone achieved", "Execution phase started"],
      },
      {
        title: "Documents shared with Agent X",
        stage: "Documents",

        summary: "Key documents shared and initial work completed.",
        kpis: [
          { label: "Documents", value: `${selectedProject.documents.length}` },
          {
            label: "Updated",
            value: new Date(selectedProject.updatedDate).toLocaleDateString(
              "en-GB",
            ),
          },
          {
            label: "Progress",
            value: `${getProgressForProject(selectedProject)}%`,
          },
        ],
        notes: ["Documents verified", "Work in progress"],
      },
      {
        title: "30% remaining payment",
        stage: "Billing",
  
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
  const completedStepsCount = selectedStats?.completedSteps ?? 0;
  const nextDueStepIndex =
    completedStepsCount < journeySteps.length ? completedStepsCount : null;
  const selectedProjectProgress = selectedProject
    ? getProgressForProject(selectedProject)
    : 0;
  const currentJourneyStage =
    journeySteps[
      Math.min(completedStepsCount, Math.max(0, journeySteps.length - 1))
    ];
  const lastUpdateSummary = getProjectUpdateSummary(
    selectedProject?.status || "",
  );

  return (
    <div className="space-y-6 animate-enter">
      <div className="relative">
        {selectedProject && (
          <>
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedProject(null)}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                Back to projects
              </button>
            </div>

            <div className="rounded-2xl bg-white/90 p-4 ring-1 ring-slate-200/70">
              <div className="flex items-start gap-6">
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {selectedProject.title}
                </h2>

                <div className="ml-auto flex gap-3 rounded-lg bg-slate-50/80 px-4 py-2 ring-1 ring-slate-200/60">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    className="-rotate-90"
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="4"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - selectedProjectProgress / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                  </svg>

                  <div className="justify-end text-right">
                    <p className="text-xl font-bold leading-none text-slate-900">
                      {selectedProjectProgress}%
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      Journey Progress
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedProject ? (
        <div className="animate-enter rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {activeProjectTab === "overview"
                  ? "Project Overview"
                  : "Client Journey"}
              </h2>
              <span className="text-xs text-slate-500">
                {activeProjectTab === "overview"
                  ? "Client info, project info and latest update"
                  : "Roadmap and step-level insights"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveProjectTab("overview")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeProjectTab === "overview"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Project Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProjectTab("journey")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeProjectTab === "journey"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Client Journey
                </button>
              </div>
              <Link
                href={`/admin/logs?projectId=${selectedProject.id}`}
                className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Project Logs
              </Link>
            </div>
          </div>

          {activeProjectTab === "overview" && (
            <div key={`${selectedProject.id}-overview`} className="animate-enter">
              <ProjectOverview
                project={selectedProject}
                selectedClient={selectedClient}
                selectedStats={selectedStats}
                initialPaymentDate={initialPaymentDate}
                currentJourneyStage={currentJourneyStage}
                lastUpdateSummary={lastUpdateSummary}
                progress={selectedProjectProgress}
              />
            </div>
          )}

          {activeProjectTab === "journey" && (
            <div key={`${selectedProject.id}-journey`} className="animate-enter">
              <ProjectRoadmap
                project={selectedProject}
                journeySteps={journeySteps}
                completedStepsCount={completedStepsCount}
                nextDueStepIndex={nextDueStepIndex}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                activeInsight={activeInsight}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="animate-enter rounded-2xl bg-white/90 px-5 py-4 ring-1 ring-slate-200/70">
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {statsCards.map((item, idx) => (
                <div
                  key={item.label}
                  className={`rounded-lg px-2 py-1 hover-lift ${
                    idx < 3
                      ? "xl:border-r xl:border-slate-200 xl:pl-2 xl:pr-4"
                      : "xl:pl-4"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>
                  <p className={`mt-1 text-2xl font-bold ${item.tone}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-enter hover-lift rounded-2xl bg-white p-6 ring-1 ring-slate-200/70">
            <div className="mb-4 flex items-center justify-between">
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


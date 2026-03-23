import type { Project } from "@/types";

export type RoadmapInsight = {
  title: string;
  stage: string;
  summary: string;
  kpis: Array<{ label: string; value: string }>;
  notes: string[];
};

export const journeySteps = [
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

type GetProjectRoadmapInsightsOptions = {
  project: Project;
  progress: number;
};

export function getProjectRoadmapInsights({
  project,
  progress,
}: GetProjectRoadmapInsightsOptions): RoadmapInsight[] {
  const agentX = project.agentX || "Unassigned";
  const agentY = project.agentY || "Unassigned";
  const architect = project.architect || "Unassigned";
  const normalizedServiceType =
    project.serviceType.charAt(0).toUpperCase() + project.serviceType.slice(1);
  const selectedServiceLabel = project.selectedService || normalizedServiceType;
  const selectedSubServiceLabel = project.selectedSubService || "Not specified";

  return [
    {
      title: "Service selection",
      stage: "Service Intake",
      summary:
        "Client session validated and selected service preferences captured.",
      kpis: [
        { label: "Service", value: selectedServiceLabel },
        { label: "Sub Service", value: selectedSubServiceLabel },
        { label: "Location", value: project.location },
        { label: "Service Id", value: project.serviceId },
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
      summary: "Consultant assigned to review scope and coordinate next steps.",
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
        { label: "Documents", value: `${project.documents.length}` },
        {
          label: "Updated",
          value: new Date(project.updatedDate).toLocaleDateString("en-GB"),
        },
        { label: "Progress", value: `${progress}%` },
      ],
      notes: ["Documents verified", "Work in progress"],
    },
    {
      title: "30% remaining payment",
      stage: "Billing",
      summary: "Final payment pending prior to council submission.",
      kpis: [
        { label: "Pending", value: "30%" },
        { label: "Council", value: project.councilName },
        { label: "Reference", value: project.councilReference },
      ],
      notes: ["Payment reminder sent", "Awaiting settlement"],
    },
    {
      title: "Submitted to council",
      stage: "Submission",
      summary: "Project submitted for approval and awaiting council decision.",
      kpis: [
        { label: "Council", value: project.councilName },
        { label: "Reference", value: project.councilReference },
        {
          label: "Updated",
          value: new Date(project.updatedDate).toLocaleDateString("en-GB"),
        },
      ],
      notes: ["Submission completed", "Decision pending"],
    },
  ];
}

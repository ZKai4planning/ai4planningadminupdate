"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import axiosInstance from "@/app/lib/axiosinstance";
import {
  getProjectRoadmapInsights,
  journeySteps,
  type RoadmapInsight,
} from "@/app/lib/project-roadmap";
import ProjectOverview from "@/components/projects/ProjectOverview";
import ProjectRoadmap from "@/components/projects/ProjectRoadmap";
import type { Client, Document, Project, ProjectClientQuestionnaire } from "@/types";

type ApiService = {
  serviceId?: string;
  title?: string;
  serviceName?: string;
};

type ApiSubService = {
  subServiceId?: string;
  title?: string;
  subServiceName?: string;
  name?: string;
};

type ApiAssignedAgentDetails =
  | {
      name?: string;
      email?: string;
      userId?: string;
      id?: string;
    }
  | string
  | null
  | undefined;

type ApiProject = {
  _id?: string;
  projectId?: string;
  userId?: string;
  clientName?: string;
  clientDetails?: {
    _id?: string;
    userId?: string;
    email?: string;
    fullName?: string;
  } | null;
  services?: ApiService[];
  subServices?: ApiSubService[];
  assignedAgent?: string | null;
  assignedAgentUserId?: string | null;
  assignedAgentDetails?: ApiAssignedAgentDetails;
  status?: string;
  currentStep?: number;
  createdAt?: string;
  updatedAt?: string;
};

type ApiProjectsResponse = {
  data?: ApiProject[];
  pagination?: {
    totalItems?: number;
    currentPage?: number;
    totalPages?: number;
    pageSize?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
};

type ApiEligibilityForm = {
  _id?: string;
  projectId?: string;
  currentStep?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  applicantAndProperty?: {
    applicantDetails?: {
      contactEmailPhone?: string;
      fullName?: string;
      postcode?: string;
      siteAddress?: string;
    };
    propertyAndOwnership?: {
      nearConservationAreaOrListedBuilding?: string;
      ownershipStatus?: string;
      propertyType?: string;
      purposeOfDevelopment?: string;
    };
  };
  worksAndMaterials?: {
    descriptionOfWorks?: {
      propsedWorksDescription?: string;
      existingPropertyWidthM?: number | string;
      distanceFromBoundaryM?: number | string;
      existingPropertyHeightM?: number | string;
      proposedExtensionHeightM?: number | string;
      proposedExtensionWidthM?: number | string;
      ridgeOrEavesHeightM?: number | string;
    };
    materials?: {
      wallMaterials?: string;
      roofMaterials?: string;
      materialsMatchExisting?: string;
      colourOrFinishNotes?: string;
    };
    plansDrawingsPhotographs?: {
      locationPlan?: string;
      additionalDrawings?: string;
      existingAndProposedElevations?: string;
      photographsOfSite?: string;
      sitePlan?: string;
    };
  };
  siteConstraints?: {
    accessAndParking?: {
      accessOrParkingChanges?: string;
      cycleStorageProvisions?: string;
      newOrAlteredAccess?: string;
    };
    floodAndEnvironmentalRisk?: {
      isSiteContaminatedLand?: string;
      isSiteInFloodRiskArea?: string;
      floodRiskAssesmentReport?: string;
    };
    heritageAndListing?: {
      isInConservationArea?: string;
      isListedBuilding?: string;
    };
    preApplicationAdvice?: {
      soughtPreAppAdvice?: string;
      officerName?: string;
      preApplicationAdviceSummary?: string;
      preApplicationReferenceNumber?: string;
    };
    treesHedgesLandscaping?: {
      treeSpecies?: string;
      treesWithTPO?: string;
      treesWithinFallingDistance?: string;
      treeSurveyReport?: string;
    };
  };
  utilitiesAndConsents?: {
    additionalConsents?: string;
  };
  completionStatus?: {
    percentage?: number;
    completedSteps?: number;
  };
};

type ApiEligibilityResponse = {
  data?: ApiEligibilityForm;
};

type PaginationState = {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type ProjectRow = {
  id: string;
  clientName: string;
  clientId: string;
  clientEmail: string;
  agentX: string;
  agentY: string;
  projectId: string;
  tenantId: string;
  userId: string;
  service: string;
  subService: string;
  assignedAgent: string;
  status: string;
  statusLabel: "Open" | "Closed";
  currentStep: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
  isClosed: boolean;
};

const DEFAULT_PAGINATION: PaginationState = {
  totalItems: 0,
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  hasNextPage: false,
  hasPrevPage: false,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const CLOSED_STATUSES = new Set([
  "approved",
  "rejected",
  "completed",
  "closed",
  "cancelled",
]);

const clampStep = (value: number) => Math.max(0, Math.min(value, 10));

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

const formatStatusLabel = (value?: string) =>
  (value ?? "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDateLabel = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-GB");
};

const getServiceLabel = (project: ApiProject) =>
  project.services?.[0]?.serviceName?.trim() ||
  project.services?.[0]?.title?.trim() ||
  "Unassigned service";

const getSubServiceLabel = (project: ApiProject) => {
  if (!project.subServices?.length) return "Not specified";

  const labels = project.subServices
    .map((item) => item.subServiceName?.trim() || item.title?.trim() || item.name?.trim())
    .filter(Boolean);

  return labels.length ? labels.join(", ") : "Not specified";
};

const getAssignedAgentLabel = (project: ApiProject) => {
  const details = project.assignedAgentDetails;

  if (typeof details === "string" && details.trim()) return details.trim();

  if (details && typeof details === "object") {
    if (details.name?.trim()) return details.name.trim();
    if (details.userId?.trim()) return details.userId.trim();
    if (details.email?.trim()) return details.email.trim();
    if (details.id?.trim()) return details.id.trim();
  }

  if (project.assignedAgent?.trim()) return project.assignedAgent.trim();
  if (project.assignedAgentUserId?.trim()) return project.assignedAgentUserId.trim();

  return "Unassigned";
};

const mapStatusToProjectStatus = (status?: string): Project["status"] => {
  const normalized = (status ?? "").toLowerCase();

  switch (normalized) {
    case "registered":
      return "registered";
    case "docs_received":
    case "documents_received":
      return "docs_received";
    case "in_review":
    case "eligibility_in_progress":
    case "eligibility_completed":
      return "in_review";
    case "architect_assigned":
    case "consultant_assigned":
      return "architect_assigned";
    case "measurements_done":
      return "measurements_done";
    case "drawings_in_progress":
      return "drawings_in_progress";
    case "drawings_received":
      return "drawings_received";
    case "submitted_to_council":
      return "submitted_to_council";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    default:
      return "pending";
  }
};

const inferServiceType = (value: string): Project["serviceType"] => {
  const normalized = value.toLowerCase();
  if (normalized.includes("commercial")) return "commercial";
  if (normalized.includes("extension")) return "extension";
  return "residential";
};

const getProjectUpdateSummary = (status: string) => {
  const summaryByStatus: Record<string, string> = {
    pending: "Project has been created and is waiting for intake validation.",
    registered: "Client registration is complete and onboarding has started.",
    docs_received: "Initial documents were received and queued for review.",
    in_review: "Project is currently under internal planning review.",
    architect_assigned:
      "Consultant assignment is complete and internal delivery is underway.",
    measurements_done: "Site measurements are complete and verified.",
    drawings_in_progress: "Draft drawings are being prepared by the team.",
    drawings_received: "Drawings have been received and are being validated.",
    submitted_to_council:
      "Application has been submitted to council and is awaiting response.",
    approved: "Council decision received: approved.",
    rejected: "Council decision received: rejected.",
    eligibility_in_progress:
      "Eligibility checks are in progress and the case is being reviewed.",
  };

  return (
    summaryByStatus[status] ||
    `${formatStatusLabel(status)} is the latest recorded update for this project.`
  );
};

const getCompletedStepsForRow = (project: ProjectRow) =>
  project.currentStep > 0
    ? clampStep(project.currentStep)
    : completedStepsByStatus[mapStatusToProjectStatus(project.status)] ?? 0;

const getProgressForRow = (project: ProjectRow) =>
  project.progress > 0
    ? project.progress
    : Math.round((getCompletedStepsForRow(project) / journeySteps.length) * 100);

const getClientName = (project: ApiProject) =>
  project.clientName?.trim() ||
  project.clientDetails?.fullName?.trim() ||
  (project.userId?.trim() ? `User ${project.userId.trim()}` : "Unknown User");

const getClientId = (project: ApiProject) =>
  project.clientDetails?.userId?.trim() ||
  project.userId?.trim() ||
  "N/A";

const getTenantId = (project: ApiProject) =>
  project.clientDetails?._id?.trim() ||
  project._id?.trim() ||
  "N/A";

const toText = (value: unknown) => {
  if (value === undefined || value === null || value === "") return "";
  return String(value);
};

const joinValues = (...values: Array<string | undefined>) =>
  values.map((value) => value?.trim()).filter(Boolean).join(", ");

const buildEligibilityQuestionnaire = (
  eligibility: ApiEligibilityForm | null,
  project: ProjectRow,
): ProjectClientQuestionnaire | undefined => {
  if (!eligibility) return undefined;

  const applicantDetails = eligibility.applicantAndProperty?.applicantDetails;
  const propertyAndOwnership =
    eligibility.applicantAndProperty?.propertyAndOwnership;
  const descriptionOfWorks =
    eligibility.worksAndMaterials?.descriptionOfWorks;
  const materials = eligibility.worksAndMaterials?.materials;
  const accessAndParking = eligibility.siteConstraints?.accessAndParking;
  const floodRisk = eligibility.siteConstraints?.floodAndEnvironmentalRisk;
  const heritage = eligibility.siteConstraints?.heritageAndListing;
  const preApp = eligibility.siteConstraints?.preApplicationAdvice;
  const trees = eligibility.siteConstraints?.treesHedgesLandscaping;

  return {
    propertyDetails: {
      applicantFullName: applicantDetails?.fullName || project.clientName,
      contactEmailOrPhone:
        applicantDetails?.contactEmailPhone || project.clientEmail,
      siteAddress: applicantDetails?.siteAddress || "Not provided",
      postcode: applicantDetails?.postcode || "Not provided",
      propertyType: propertyAndOwnership?.propertyType || "Not provided",
      ownershipStatus: propertyAndOwnership?.ownershipStatus || "Not provided",
      conservationOrListed:
        propertyAndOwnership?.nearConservationAreaOrListedBuilding ||
        joinValues(heritage?.isInConservationArea, heritage?.isListedBuilding) ||
        "Not provided",
      purposeOfDevelopment:
        propertyAndOwnership?.purposeOfDevelopment || "Not provided",
    },
    dimensions: {
      existingPropertyWidthM:
        toText(descriptionOfWorks?.existingPropertyWidthM) || "Not provided",
      existingPropertyDepthM:
        toText(descriptionOfWorks?.distanceFromBoundaryM) || "Not provided",
      proposedExtensionDepthM:
        toText(descriptionOfWorks?.proposedExtensionWidthM) || "Not provided",
      proposedExtensionHeightM:
        toText(descriptionOfWorks?.proposedExtensionHeightM) || "Not provided",
      externalMaterials:
        joinValues(
          materials?.wallMaterials,
          materials?.roofMaterials,
          materials?.colourOrFinishNotes,
        ) || "Not provided",
      briefDescription:
        descriptionOfWorks?.propsedWorksDescription || "Not provided",
    },
    constraints: {
      listedBuilding: heritage?.isListedBuilding || "Not provided",
      tpo: trees?.treesWithTPO || "Not provided",
      floodZone: floodRisk?.isSiteInFloodRiskArea || "Not provided",
      vehicleAccess:
        accessAndParking?.newOrAlteredAccess ||
        accessAndParking?.accessOrParkingChanges ||
        "Not provided",
      preApplicationAdvice:
        joinValues(
          preApp?.soughtPreAppAdvice,
          preApp?.preApplicationReferenceNumber,
          preApp?.officerName,
        ) || "Not provided",
      additionalConsentsRequired:
        eligibility.utilitiesAndConsents?.additionalConsents || "Not provided",
    },
  };
};

const buildEligibilityDocuments = (
  eligibility: ApiEligibilityForm | null,
  project: ProjectRow,
): Document[] => {
  if (!eligibility) return [];

  const plans = eligibility.worksAndMaterials?.plansDrawingsPhotographs;
  const floodRisk = eligibility.siteConstraints?.floodAndEnvironmentalRisk;
  const trees = eligibility.siteConstraints?.treesHedgesLandscaping;

  const sources = [
    { name: "Location Plan", type: "site_plan" as const, url: plans?.locationPlan },
    { name: "Site Plan", type: "site_plan" as const, url: plans?.sitePlan },
    {
      name: "Existing And Proposed Elevations",
      type: "design" as const,
      url: plans?.existingAndProposedElevations,
    },
    { name: "Additional Drawings", type: "design" as const, url: plans?.additionalDrawings },
    { name: "Photographs Of Site", type: "other" as const, url: plans?.photographsOfSite },
    {
      name: "Flood Risk Assessment Report",
      type: "environmental" as const,
      url: floodRisk?.floodRiskAssesmentReport,
    },
    { name: "Tree Survey Report", type: "environmental" as const, url: trees?.treeSurveyReport },
  ];

  return sources
    .filter((item) => Boolean(item.url))
    .map((item, index) => ({
      id: `${project.projectId}-doc-${index + 1}`,
      projectId: project.projectId,
      clientId: project.clientId,
      name: item.name,
      type: item.type,
      uploadedDate: eligibility.updatedAt || eligibility.createdAt || project.updatedAt,
      uploadedBy: project.clientName,
      fileSize: 0,
      url: item.url as string,
      status: "reviewed",
      version: 1,
    }));
};

const mapProject = (project: ApiProject): ProjectRow => {
  const status = project.status?.trim() || "pending";
  const currentStep = clampStep(project.currentStep ?? 0);
  const fallbackId =
    project._id ||
    project.projectId ||
    `${project.userId || "user"}-${project.createdAt || status}`;

  return {
    id: project.projectId?.trim() || fallbackId,
    clientName: getClientName(project),
    clientId: getClientId(project),
    clientEmail: project.clientDetails?.email?.trim() || "Not available",
    agentX: getAssignedAgentLabel(project),
    agentY: "Unassigned",
    projectId: project.projectId?.trim() || project._id || "Unknown",
    tenantId: getTenantId(project),
    userId: project.userId?.trim() || "N/A",
    service: getServiceLabel(project),
    subService: getSubServiceLabel(project),
    assignedAgent: getAssignedAgentLabel(project),
    status,
    statusLabel: CLOSED_STATUSES.has(status.toLowerCase()) ? "Closed" : "Open",
    currentStep,
    progress: Math.round((currentStep / 10) * 100),
    createdAt: project.createdAt || "",
    updatedAt: project.updatedAt || project.createdAt || "",
    isClosed: CLOSED_STATUSES.has(status.toLowerCase()),
  };
};

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<"overview" | "journey">(
    "overview",
  );
  const [activeStep, setActiveStep] = useState(0);
  const [eligibilityData, setEligibilityData] = useState<ApiEligibilityForm | null>(
    null,
  );
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState("");
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("projectId") ?? "";
    if (!query) return;
    setSearchTerm(query);
    setDebouncedSearch(query);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await axiosInstance.get<ApiProjectsResponse>("/projects/all", {
          params: {
            page,
            limit: pageSize,
            ...(debouncedSearch ? { search: debouncedSearch } : {}),
          },
        });

        if (!isMounted) return;

        const rows = Array.isArray(response?.data?.data)
          ? response.data.data.map(mapProject)
          : [];
        const nextPagination = response?.data?.pagination;

        setProjects(rows);
        setPagination({
          totalItems: Math.max(0, nextPagination?.totalItems ?? 0),
          currentPage: Math.max(1, nextPagination?.currentPage ?? page),
          totalPages: Math.max(1, nextPagination?.totalPages ?? 1),
          pageSize: Math.max(1, nextPagination?.pageSize ?? pageSize),
          hasNextPage: Boolean(nextPagination?.hasNextPage),
          hasPrevPage: Boolean(nextPagination?.hasPrevPage),
        });
      } catch (requestError) {
        if (!isMounted) return;

        const message =
          (
            requestError as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (requestError as { message?: string })?.message ||
          "Failed to load projects.";

        setProjects([]);
        setPagination((current) => ({
          ...current,
          currentPage: page,
          pageSize,
          hasNextPage: false,
          hasPrevPage: page > 1,
        }));
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    if (!selectedProject || activeProjectTab !== "journey") {
      return;
    }

    const completedSteps =
      eligibilityData?.completionStatus?.completedSteps ??
      getCompletedStepsForRow(selectedProject);
    setActiveStep(Math.max(0, completedSteps - 1));
  }, [selectedProject, activeProjectTab, eligibilityData]);

  useEffect(() => {
    if (!selectedProject) {
      setEligibilityData(null);
      setEligibilityError("");
      setEligibilityLoading(false);
      return;
    }

    let isMounted = true;

    const loadEligibility = async () => {
      try {
        setEligibilityLoading(true);
        setEligibilityError("");

        const response = await axiosInstance.get<ApiEligibilityResponse>(
          `/eligibility/${selectedProject.projectId}`,
        );

        if (!isMounted) return;
        setEligibilityData(response?.data?.data ?? null);
      } catch (requestError) {
        if (!isMounted) return;

        const message =
          (
            requestError as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (requestError as { message?: string })?.message ||
          "Failed to load eligibility details.";

        setEligibilityData(null);
        setEligibilityError(message);
      } finally {
        if (isMounted) {
          setEligibilityLoading(false);
        }
      }
    };

    loadEligibility();

    return () => {
      isMounted = false;
    };
  }, [selectedProject]);

  const stats = useMemo(() => {
    const closed = projects.filter((project) => project.isClosed).length;
    const open = projects.length - closed;
    const avgProgress = projects.length
      ? Math.round(
          projects.reduce((sum, project) => sum + project.progress, 0) /
            projects.length,
        )
      : 0;

    return {
      total: pagination.totalItems,
      open,
      closed,
      avgProgress,
    };
  }, [pagination.totalItems, projects]);

  const pageStart = pagination.totalItems
    ? (pagination.currentPage - 1) * pagination.pageSize + 1
    : 0;
  const pageEnd = pageStart ? pageStart + projects.length - 1 : 0;

  const selectedProjectDetail = useMemo<Project | null>(() => {
    if (!selectedProject) return null;

    const questionnaire = buildEligibilityQuestionnaire(
      eligibilityData,
      selectedProject,
    );
    const documents = buildEligibilityDocuments(eligibilityData, selectedProject);
    const applicantDetails = eligibilityData?.applicantAndProperty?.applicantDetails;
    const detailProgress =
      eligibilityData?.completionStatus?.percentage ?? getProgressForRow(selectedProject);

    return {
      id: selectedProject.projectId,
      id2: selectedProject.tenantId !== "N/A" ? selectedProject.tenantId : undefined,
      serviceId: "",
      clientId: selectedProject.clientId,
      clientName: selectedProject.clientName,
      title:
        selectedProject.service !== "Unassigned service"
          ? selectedProject.service
          : `Project ${selectedProject.projectId}`,
      description: "Project details are available from the live projects list.",
      serviceType: inferServiceType(
        `${selectedProject.service} ${selectedProject.subService}`,
      ),
      selectedService: selectedProject.service,
      selectedSubService:
        selectedProject.subService !== "Not specified"
          ? selectedProject.subService
          : undefined,
      location: applicantDetails?.siteAddress || "Not available",
      postcode: applicantDetails?.postcode || "Not available",
      status: mapStatusToProjectStatus(selectedProject.status),
      createdDate: selectedProject.createdAt || new Date().toISOString(),
      updatedDate:
        eligibilityData?.updatedAt ||
        selectedProject.updatedAt ||
        selectedProject.createdAt ||
        new Date().toISOString(),
      agentX:
        selectedProject.agentX !== "Unassigned" ? selectedProject.agentX : undefined,
      agentY:
        selectedProject.agentY !== "Unassigned" ? selectedProject.agentY : undefined,
      progress: detailProgress,
      estimatedCompletionDate: "Not available",
      councilReference: "Not available",
      councilName: "Not available",
      documents,
      clientQuestionnaire: questionnaire,
    };
  }, [selectedProject, eligibilityData]);

  const selectedClient = useMemo<Client | null>(() => {
    if (!selectedProject) return null;

    const applicantDetails = eligibilityData?.applicantAndProperty?.applicantDetails;

    return {
      id: selectedProject.clientId,
      name: selectedProject.clientName,
      email:
        applicantDetails?.contactEmailPhone ||
        (selectedProject.clientEmail !== "Not available"
          ? selectedProject.clientEmail
          : ""),
      phone: "",
      address: applicantDetails?.siteAddress || "Not available",
      postcode: applicantDetails?.postcode || "Not available",
      serviceType: "residential",
      status: "registered",
      joinedDate: selectedProject.createdAt || new Date().toISOString(),
      paymentStatus: "pending",
      package: "basic",
    };
  }, [selectedProject, eligibilityData]);

  const selectedStats = useMemo(() => {
    if (!selectedProject) return null;

    const createdAt = new Date(selectedProject.createdAt);
    const daysOpen = Number.isNaN(createdAt.getTime())
      ? 0
      : Math.max(
          0,
          Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        );

    return {
      assigned: [selectedProject.agentX, selectedProject.agentY].filter(
        (value) => value && value !== "Unassigned",
      ).length,
      daysOpen,
      documents: buildEligibilityDocuments(eligibilityData, selectedProject).length,
      completedSteps:
        eligibilityData?.completionStatus?.completedSteps ??
        getCompletedStepsForRow(selectedProject),
    };
  }, [selectedProject, eligibilityData]);

  const stepInsights = useMemo<RoadmapInsight[]>(() => {
    if (!selectedProjectDetail) return [];

    return getProjectRoadmapInsights({
      project: selectedProjectDetail,
      progress: selectedProjectDetail.progress,
    });
  }, [selectedProjectDetail]);

  const activeInsight = stepInsights[activeStep];
  const completedStepsCount = selectedStats?.completedSteps ?? 0;
  const nextDueStepIndex =
    completedStepsCount < journeySteps.length ? completedStepsCount : null;
  const currentStepIndex =
    nextDueStepIndex ??
    Math.max(0, Math.min(completedStepsCount - 1, journeySteps.length - 1));
  const selectedProjectProgress = selectedProject
    ? eligibilityData?.completionStatus?.percentage ?? getProgressForRow(selectedProject)
    : 0;
  const currentJourneyStage =
    journeySteps[
      Math.min(completedStepsCount, Math.max(0, journeySteps.length - 1))
    ];
  const lastUpdateSummary = selectedProject
    ? getProjectUpdateSummary(selectedProject.status)
    : "";

  return (
    <div className="animate-enter space-y-6">
      {selectedProject && selectedProjectDetail && (
        <>
          <div className="relative">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                Back to projects
              </button>
            </div>

            <div className="rounded-2xl bg-white/90 p-4 ring-1 ring-slate-200/70">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {selectedProjectDetail.title}
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
                      strokeDashoffset={`${
                        2 * Math.PI * 16 * (1 - selectedProjectProgress / 100)
                      }`}
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
          </div>

          <div className="animate-enter rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <div className="flex flex-wrap items-center gap-2">
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
                  href={`/admin/logs?projectId=${selectedProject.projectId}`}
                  className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Project Logs
                </Link>
              </div>
            </div>

            {eligibilityError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {eligibilityError}
              </div>
            )}

            {eligibilityLoading && (
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Loading eligibility details...
              </div>
            )}

            {activeProjectTab === "overview" && (
              <div key={`${selectedProject.projectId}-overview`} className="animate-enter">
                <ProjectOverview
                  project={selectedProjectDetail}
                  selectedClient={selectedClient}
                  selectedStats={selectedStats}
                  initialPaymentDate={null}
                  currentJourneyStage={currentJourneyStage}
                  lastUpdateSummary={lastUpdateSummary}
                  progress={selectedProjectProgress}
                />
              </div>
            )}

            {activeProjectTab === "journey" && (
              <div key={`${selectedProject.projectId}-journey`} className="animate-enter">
                <ProjectRoadmap
                  project={selectedProjectDetail}
                  journeySteps={journeySteps}
                  completedStepsCount={completedStepsCount}
                  nextDueStepIndex={nextDueStepIndex}
                  currentStepIndex={currentStepIndex}
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  activeInsight={activeInsight}
                  eligibilityData={eligibilityData}
                />
              </div>
            )}
          </div>
        </>
      )}

      {!selectedProject && (
        <>
      <div className="rounded-2xl bg-white/90 px-5 py-4 ring-1 ring-slate-200/70">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <div className="rounded-lg px-2 py-1 xl:border-r xl:border-slate-200 xl:pr-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Total Projects
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-lg px-2 py-1 xl:border-r xl:border-slate-200 xl:px-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Open On Page
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{stats.open}</p>
          </div>
          <div className="rounded-lg px-2 py-1 xl:border-r xl:border-slate-200 xl:px-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Closed On Page
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{stats.closed}</p>
          </div>
          <div className="rounded-lg px-2 py-1 xl:pl-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Avg Progress
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {stats.avgProgress}%
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200/70">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
            <p className="text-xs text-slate-500">
              Server-side search by project ID, user ID, status, assigned agent,
              service, or subservice.
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {pageStart > 0
              ? `Showing ${pageStart}-${pageEnd} of ${pagination.totalItems}`
              : "No projects to show"}
          </span>
        </div>

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setPage(1);
                setSearchTerm(event.target.value);
              }}
              placeholder="Search project, user, status, agent, service..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={pageSize}
              onChange={(event) => {
                setPage(1);
                setPageSize(Number(event.target.value));
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} per page
                </option>
              ))}
            </select>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No projects found for the current search.
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {project.clientName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Client ID: {project.clientId}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        project.isClosed
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {project.statusLabel}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <span className="text-slate-500">S.No</span>
                    <span className="text-slate-700">{pageStart + index}</span>
                    <span className="text-slate-500">Project ID</span>
                    <span className="text-slate-700">{project.projectId}</span>
                    <span className="text-slate-500">Tenant ID</span>
                    <span className="text-slate-700">{project.tenantId}</span>
                    <span className="text-slate-500">Agent X</span>
                    <span className="text-slate-700">{project.agentX}</span>
                    <span className="text-slate-500">Agent Y</span>
                    <span className="text-slate-700">{project.agentY}</span>
                    <span className="text-slate-500">Status Detail</span>
                    <span className="text-slate-700">
                      {formatStatusLabel(project.status)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProject(project);
                      setActiveProjectTab("overview");
                    }}
                    className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            <div className="hidden overflow-auto rounded-xl border border-slate-200 md:block">
              <table className="min-w-[1100px] w-full table-auto">
                <thead className="bg-slate-100/90">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      S.No
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Client Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Client ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Agent X
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Agent Y
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Project ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Tenant ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, index) => (
                    <tr
                      key={project.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                        {pageStart + index}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        <div>
                          <p>{project.clientName}</p>
                          <p className="mt-1 text-xs font-normal text-slate-500">
                            Service: {project.service}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <div>
                          <p>{project.clientId}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Subservice: {project.subService}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {project.agentX}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {project.agentY}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">
                        {project.projectId}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {project.tenantId}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            project.statusLabel === "Closed"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {project.statusLabel}
                        </span>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatStatusLabel(project.status)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProject(project);
                            setActiveProjectTab("overview");
                          }}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {pageStart > 0
              ? `Showing ${pageStart}-${pageEnd} of ${pagination.totalItems} projects`
              : "Showing 0 projects"}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={isLoading || !pagination.hasPrevPage}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={isLoading || !pagination.hasNextPage}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

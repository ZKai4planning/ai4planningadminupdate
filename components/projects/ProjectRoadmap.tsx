import { useEffect, useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import EligibilityCheckDetails from "@/components/projects/EligibilityCheckDetails";
import TaskDetails from "@/components/projects/TaskDetails";
import type { Project } from "@/types";

export type RoadmapInsight = {
  title: string;
  stage: string;
 
  summary: string;
  kpis: Array<{ label: string; value: string }>;
  notes: string[];
};

export default function ProjectRoadmap({
  project,
  journeySteps,
  completedStepsCount,
  nextDueStepIndex,
  activeStep,
  setActiveStep,
  activeInsight,
}: {
  project: Project;
  journeySteps: string[];
  completedStepsCount: number;
  nextDueStepIndex: number | null;
  activeStep: number;
  setActiveStep: (step: number) => void;
  activeInsight: RoadmapInsight | undefined;
}) {
  const activeStepLabel = journeySteps[activeStep] || "";
  const isCrossTeamCreationStep =
    activeStepLabel === "Project Assigned to Agent Y" ||
    activeStepLabel === "Project creation between Agent X and Agent Y";

  const xTrack = [
    {
      id: "x-1",
      title: "Feasibility Pack",
      detail: "Planning review, constraints, and assumptions prepared.",
      status: ["in_review", "architect_assigned", "measurements_done", "drawings_in_progress", "drawings_received", "submitted_to_council", "approved", "rejected"].includes(project.status)
        ? "Done"
        : "In Progress",
    },
    {
      id: "x-2",
      title: "Handoff Brief",
      detail: "Execution brief with scope boundaries shared to Agent Y.",
      status: ["architect_assigned", "measurements_done", "drawings_in_progress", "drawings_received", "submitted_to_council", "approved", "rejected"].includes(project.status)
        ? "Done"
        : "Pending",
    },
    {
      id: "x-3",
      title: "Clarification Loop",
      detail: "Agent X answers design and regulation queries from Y.",
      status: ["drawings_in_progress", "drawings_received", "submitted_to_council", "approved", "rejected"].includes(project.status)
        ? "Active"
        : "Pending",
    },
  ];

  const yTrack = [
    {
      id: "y-1",
      title: "Brief Intake",
      detail: "Agent Y receives and validates X handoff package.",
      status: project.agentY ? "Done" : "Pending",
    },
    {
      id: "y-2",
      title: "Execution Mapping",
      detail: "Drawing and technical tasks mapped against X scope.",
      status: ["measurements_done", "drawings_in_progress", "drawings_received", "submitted_to_council", "approved", "rejected"].includes(project.status)
        ? "Done"
        : "In Progress",
    },
    {
      id: "y-3",
      title: "Feedback Sync",
      detail: "Y feedback and blockers are pushed back to X for closure.",
      status: ["drawings_in_progress", "drawings_received", "submitted_to_council", "approved", "rejected"].includes(project.status)
        ? "Active"
        : "Pending",
    },
  ];

  

  const [selectedSyncTask, setSelectedSyncTask] = useState<{
    lane: "x" | "y";
    title: string;
    detail: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    if (!isCrossTeamCreationStep) {
      setSelectedSyncTask(null);
      return;
    }
    setSelectedSyncTask((prev) => prev ?? { lane: "x", ...xTrack[0] });
  }, [isCrossTeamCreationStep]);

  return (
    <>
      <section className="mb-6 rounded-2xl p-5 bg-white ring-1 ring-slate-200/70 animate-enter">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-900">Client Journey</p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Step {activeStep + 1} of {journeySteps.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-start min-w-max">
            {journeySteps.map((step, index) => {
              const done = index < completedStepsCount;
              const isActive = activeStep === index;
              const isNextDue = nextDueStepIndex === index && !done;
              const connectorClass = done
                ? "bg-blue-200"
                : isNextDue
                  ? "bg-amber-300"
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
                          : isNextDue
                            ? "bg-amber-50 border-amber-500 text-amber-700 animate-pulse"
                            : isActive
                              ? "bg-white border-2 border-blue-500 text-blue-600"
                              : "bg-slate-100 border-slate-200 text-slate-500"
                      }`}
                    >
                      {done ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full text-white text-blue-600">
                          <CheckCircle2 className="w-5 h-5" />
                        </span>
                      ) : isNextDue ? (
                        <Clock className="w-5 h-5" />
                      ) : isActive ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                      )}
                    </span>
                    <span
                      className={`text-[11px] font-semibold text-center max-w-[120px] ${
                        isNextDue
                          ? "text-amber-700"
                          : isActive
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
                    <div className={`w-10 md:w-14 h-px mt-5 ${connectorClass}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {activeInsight && (
        <section className="mb-6 rounded-2xl p-5 bg-slate-50/40 ring-1 ring-slate-200/70 animate-enter">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-900">Step Details</p>
          </div>

          {!isCrossTeamCreationStep && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-2xl p-5 bg-white ring-1 ring-slate-200/70">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Step Details
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900 mt-1">
                      {activeInsight.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2">{activeInsight.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase">Stage</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {activeInsight.stage}
                    </p>
                    
                  </div>
                </div>
                {activeInsight.kpis.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {activeInsight.kpis.map((kpi) => (
                      <div
                        key={kpi.label}
                        className="border-b border-slate-200 pb-2"
                      >
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          {kpi.label}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">
                          {kpi.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <EligibilityCheckDetails
                  project={project}
                  activeStep={activeStep}
                  journeySteps={journeySteps}
                />
              </div>
              <div className="rounded-2xl p-5 bg-white ring-1 ring-slate-200/70">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Internal Notes
                </p>
                <div className="mt-3 space-y-3">
                  {activeInsight.notes.map((note) => (
                    <div key={note} className="flex items-start gap-2 border-b border-slate-100 pb-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <p className="text-sm text-slate-700">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isCrossTeamCreationStep && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl bg-gray-50 p-4 ring-1 ring-blue-100">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Agent X vs Agent Y analysis
                </p>
               
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/70">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Agent X Track
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {project.agentX || "Unassigned"}
                  </p>
                  <div className="mt-3 divide-y divide-slate-100">
                    {xTrack.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setSelectedSyncTask({
                            lane: "x",
                            title: item.title,
                            detail: item.detail,
                            status: item.status,
                          })
                        }
                        className={`block w-full py-2.5 text-left transition-colors ${
                          selectedSyncTask?.lane === "x" &&
                          selectedSyncTask?.title === item.title
                            ? "bg-blue-50/80"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{item.detail}</p>
                        <p className="text-[11px] font-semibold text-blue-700 mt-1">{item.status}</p>
                      </button>
                    ))}
                  </div>
                
                </div>

                <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/70">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Agent Y Track
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {project.agentY || "Unassigned"}
                  </p>
                  <div className="mt-3 divide-y divide-slate-100">
                    {yTrack.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setSelectedSyncTask({
                            lane: "y",
                            title: item.title,
                            detail: item.detail,
                            status: item.status,
                          })
                        }
                        className={`block w-full py-2.5 text-left transition-colors ${
                          selectedSyncTask?.lane === "y" &&
                          selectedSyncTask?.title === item.title
                            ? "bg-blue-50/80"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{item.detail}</p>
                        <p className="text-[11px] font-semibold text-blue-700 mt-1">{item.status}</p>
                      </button>
                    ))}
                  </div>
                
                </div>
              </div>

              
            </div>
              <aside className="lg:sticky lg:top-4 h-fit">
                <TaskDetails
                  project={project}
                  focusStep={activeStepLabel}
                  focusTask={selectedSyncTask ?? undefined}
                />
              </aside>
            </div>
          )}

          {isCrossTeamCreationStep && (
            <div className="mt-4 rounded-2xl p-4 bg-white ring-1 ring-slate-200/70">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Internal Notes
              </p>
              <div className="mt-3 space-y-3">
                {activeInsight.notes.map((note) => (
                  <div key={note} className="flex items-start gap-2 border-b border-slate-100 pb-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <p className="text-sm text-slate-700">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}

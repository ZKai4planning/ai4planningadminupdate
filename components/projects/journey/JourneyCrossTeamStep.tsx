import { useMemo, useState } from "react";
import JourneyNotes from "@/components/projects/journey/JourneyNotes";
import TaskDetails from "@/components/projects/TaskDetails";
import type { RoadmapInsight } from "@/app/lib/project-roadmap";
import type { Project } from "@/types";

type SyncTask = {
  lane: "x" | "y";
  title: string;
  detail: string;
  status: string;
};

type TrackItem = {
  id: string;
  title: string;
  detail: string;
  status: string;
};

function JourneyTrack({
  lane,
  title,
  owner,
  items,
  selectedTask,
  onSelect,
}: {
  lane: "x" | "y";
  title: string;
  owner: string;
  items: TrackItem[];
  selectedTask: SyncTask | null;
  onSelect: (task: SyncTask) => void;
}) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/70">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{owner}</p>
      <div className="mt-3 divide-y divide-slate-100">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect({ ...item, lane })}
            className={`block w-full py-2.5 text-left transition-colors ${
              selectedTask?.lane === lane && selectedTask.title === item.title
                ? "bg-blue-50/80"
                : "hover:bg-slate-50"
            }`}
          >
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-0.5 text-xs text-slate-600">{item.detail}</p>
            <p className="mt-1 text-[11px] font-semibold text-blue-700">
              {item.status}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function JourneyCrossTeamStep({
  project,
  activeStepLabel,
  activeInsight,
}: {
  project: Project;
  activeStepLabel: string;
  activeInsight: RoadmapInsight;
}) {
  const xTrack = useMemo<TrackItem[]>(
    () => [
      {
        id: "x-1",
        title: "Feasibility Pack",
        detail: "Planning review, constraints, and assumptions prepared.",
        status: [
          "in_review",
          "architect_assigned",
          "measurements_done",
          "drawings_in_progress",
          "drawings_received",
          "submitted_to_council",
          "approved",
          "rejected",
        ].includes(project.status)
          ? "Done"
          : "In Progress",
      },
      {
        id: "x-2",
        title: "Handoff Brief",
        detail: "Execution brief with scope boundaries shared to Agent Y.",
        status: [
          "architect_assigned",
          "measurements_done",
          "drawings_in_progress",
          "drawings_received",
          "submitted_to_council",
          "approved",
          "rejected",
        ].includes(project.status)
          ? "Done"
          : "Pending",
      },
      {
        id: "x-3",
        title: "Clarification Loop",
        detail: "Agent X answers design and regulation queries from Y.",
        status: [
          "drawings_in_progress",
          "drawings_received",
          "submitted_to_council",
          "approved",
          "rejected",
        ].includes(project.status)
          ? "Active"
          : "Pending",
      },
    ],
    [project.status],
  );

  const yTrack = useMemo<TrackItem[]>(
    () => [
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
        status: [
          "measurements_done",
          "drawings_in_progress",
          "drawings_received",
          "submitted_to_council",
          "approved",
          "rejected",
        ].includes(project.status)
          ? "Done"
          : "In Progress",
      },
      {
        id: "y-3",
        title: "Feedback Sync",
        detail: "Y feedback and blockers are pushed back to X for closure.",
        status: [
          "drawings_in_progress",
          "drawings_received",
          "submitted_to_council",
          "approved",
          "rejected",
        ].includes(project.status)
          ? "Active"
          : "Pending",
      },
    ],
    [project.agentY, project.status],
  );

  const [selectedSyncTask, setSelectedSyncTask] = useState<SyncTask | null>(
    null,
  );

  const resolvedSyncTask =
    selectedSyncTask ?? { lane: "x" as const, ...xTrack[0] };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-blue-100 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {activeInsight.stage}
              </p>
              <p className="text-sm font-semibold text-slate-900">
                Agent X vs Agent Y analysis
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {activeInsight.summary}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <JourneyTrack
              lane="x"
              title="Agent X Track"
              owner={project.agentX || "Unassigned"}
              items={xTrack}
              selectedTask={resolvedSyncTask}
              onSelect={setSelectedSyncTask}
            />
            <JourneyTrack
              lane="y"
              title="Agent Y Track"
              owner={project.agentY || "Unassigned"}
              items={yTrack}
              selectedTask={resolvedSyncTask}
              onSelect={setSelectedSyncTask}
            />
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-4">
          <TaskDetails
            project={project}
            focusStep={activeStepLabel}
            focusTask={resolvedSyncTask}
          />
        </aside>
      </div>

      <div className="mt-4">
        <JourneyNotes notes={activeInsight.notes} />
      </div>
    </>
  );
}

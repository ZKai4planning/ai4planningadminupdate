import EligibilityCheckDetails from "@/components/projects/EligibilityCheckDetails";
import JourneyNotes from "@/components/projects/journey/JourneyNotes";
import type { RoadmapInsight } from "@/app/lib/project-roadmap";
import type { Project } from "@/types";

type EligibilityDetailsPayload = {
  [key: string]: unknown;
};

export default function JourneyStandardStep({
  project,
  journeySteps,
  activeStep,
  activeInsight,
  eligibilityData,
}: {
  project: Project;
  journeySteps: string[];
  activeStep: number;
  activeInsight: RoadmapInsight;
  eligibilityData?: EligibilityDetailsPayload | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200/70 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Step Details
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">
              {activeInsight.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {activeInsight.summary}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">Stage</p>
            <p className="text-sm font-semibold text-slate-900">
              {activeInsight.stage}
            </p>
          </div>
        </div>

        {activeInsight.kpis.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {activeInsight.kpis.map((kpi) => (
              <div key={kpi.label} className="border-b border-slate-200 pb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {kpi.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
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
          eligibilityData={eligibilityData}
        />
      </div>

      <JourneyNotes notes={activeInsight.notes} />
    </div>
  );
}

import type { RoadmapInsight } from "@/app/lib/project-roadmap";
import JourneyCrossTeamStep from "@/components/projects/journey/JourneyCrossTeamStep";
import JourneyStandardStep from "@/components/projects/journey/JourneyStandardStep";
import JourneyTimeline from "@/components/projects/journey/JourneyTimeline";
import type { Project } from "@/types";

type EligibilityDetailsPayload = {
  [key: string]: unknown;
};

export default function ProjectRoadmap({
  project,
  journeySteps,
  completedStepsCount,
  nextDueStepIndex,
  currentStepIndex,
  activeStep,
  setActiveStep,
  activeInsight,
  eligibilityData,
}: {
  project: Project;
  journeySteps: string[];
  completedStepsCount: number;
  nextDueStepIndex: number | null;
  currentStepIndex: number;
  activeStep: number;
  setActiveStep: (step: number) => void;
  activeInsight: RoadmapInsight | undefined;
  eligibilityData?: EligibilityDetailsPayload | null;
}) {
  const activeStepLabel = journeySteps[activeStep] || "";
  const isCrossTeamCreationStep =
    activeStepLabel === "Project Assigned to Agent Y" ||
    activeStepLabel === "Project creation between Agent X and Agent Y";

  return (
    <>
      <JourneyTimeline
        journeySteps={journeySteps}
        completedStepsCount={completedStepsCount}
        nextDueStepIndex={nextDueStepIndex}
        currentStepIndex={currentStepIndex}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />

      {activeInsight && (
        <section className="mb-6 rounded-2xl bg-slate-50/40 p-5 ring-1 ring-slate-200/70 animate-enter">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Step Details</p>
          </div>

          {!isCrossTeamCreationStep && (
            <JourneyStandardStep
              project={project}
              journeySteps={journeySteps}
              activeStep={activeStep}
              activeInsight={activeInsight}
              eligibilityData={eligibilityData}
            />
          )}

          {isCrossTeamCreationStep && (
            <JourneyCrossTeamStep
              project={project}
              activeStepLabel={activeStepLabel}
              activeInsight={activeInsight}
            />
          )}
        </section>
      )}
    </>
  );
}

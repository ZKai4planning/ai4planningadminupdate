import { CheckCircle2, Clock } from "lucide-react";

export default function JourneyTimeline({
  journeySteps,
  completedStepsCount,
  nextDueStepIndex,
  currentStepIndex,
  activeStep,
  setActiveStep,
}: {
  journeySteps: string[];
  completedStepsCount: number;
  nextDueStepIndex: number | null;
  currentStepIndex: number;
  activeStep: number;
  setActiveStep: (step: number) => void;
}) {
  return (
    <section className="mb-6 rounded-2xl bg-white p-5 ring-1 ring-slate-200/70 animate-enter">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Client Journey</p>
          <p className="mt-1 text-xs text-slate-500">
            Completed steps are read-only. Current filling step stays highlighted.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
            Step {activeStep + 1} of {journeySteps.length}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-start">
          {journeySteps.map((step, index) => {
            const done = index < completedStepsCount;
            const isActive = activeStep === index;
            const isNextDue = nextDueStepIndex === index && !done;
            const isCurrentStep = currentStepIndex === index;
            const isReadable = done || isNextDue || isActive;
            const connectorClass = done
              ? "bg-blue-200"
              : isCurrentStep
                ? "bg-amber-300"
                : isActive
                  ? "bg-blue-200"
                  : "bg-slate-200";

            return (
              <div key={step} className="flex items-start">
                <button
                  type="button"
                  onClick={() => {
                    if (isReadable) {
                      setActiveStep(index);
                    }
                  }}
                  className={`flex flex-col items-center gap-2 px-3 ${
                    isReadable ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                  aria-disabled={!isReadable}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-colors ${
                      done
                        ? "border-blue-600 bg-blue-600 text-white"
                        : isCurrentStep
                          ? "border-amber-500 bg-amber-50 text-amber-700 animate-pulse"
                          : isActive
                            ? "border-2 border-blue-500 bg-white text-blue-600"
                            : "border-slate-200 bg-slate-100 text-slate-400"
                    }`}
                  >
                    {done ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-blue-600 text-white">
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                    ) : isCurrentStep || isActive ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-500" />
                    )}
                  </span>
                  <span
                    className={`max-w-[120px] text-center text-[11px] font-semibold ${
                      isCurrentStep
                        ? "text-amber-700"
                        : isActive
                          ? "text-blue-600"
                          : done
                            ? "text-blue-700"
                            : "text-slate-400"
                    }`}
                  >
                    {step}
                  </span>
                </button>
                {index < journeySteps.length - 1 && (
                  <div className={`mt-5 h-px w-10 md:w-14 ${connectorClass}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

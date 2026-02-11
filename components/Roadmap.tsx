import { CheckCircle2, Clock } from "lucide-react";

type RoadmapTrack = {
  title: string;
  steps: string[];
  activeStep: number;
};

const roadmapTracks: RoadmapTrack[] = [
  {
    title: "User Journey",
    activeStep: 6,
     steps: [
      "Profile created",
      "Service selected & initial payment",
      "Eligibility check",
      "Consultant assigned",
      "70% payment",
      "Documents submitted",
      "Documents under review",
      "Final 30% payment",
      "Council submission & approval",
    ],
  },
  {
    title: "Agent X",
    activeStep: 4,
     steps: [
      "Project assigned",
      "Assigned to Agent Y",
      "Quotation sent",
      "70% payment received",
      "Final documents received",
      "Client document review",
      "Remaining 30% received",
      "Submitted to council",
    ],
  },
  {
    title: "Agent Y",
    activeStep: 3,
  steps: [
      "Project received",
      "Documents validated",
      "Assigned to department",
      "Internal review & compilation",
      "Final documents sent to Agent X",
    ],
  },
  {
    title: "Superadmin",
    activeStep: 2,
    steps: [
      "Service & initial payment",
      "Eligibility completed",
      "Consultant assigned",
      "Quotation generated",
      "70% payment confirmed",
      "Document review process",
      "Final 30% confirmed",
      "Council decision tracked",
    ],
  },
];

export default function Roadmap() {
  return (
    <div className="space-y-6">
      {roadmapTracks.map((track) => (
        <section
          key={track.title}
          className="border border-slate-200/80 rounded-2xl p-5 bg-white"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-900">
              {track.title}
            </p>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              Step {track.activeStep + 1} of {track.steps.length}
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex items-start min-w-max">
              {track.steps.map((step, index) => {
                const done = index < track.activeStep;
                const isActive = index === track.activeStep;
                const connectorClass = done
                  ? "bg-blue-200"
                  : isActive
                    ? "bg-blue-200"
                    : "bg-slate-200";

                return (
                  <div key={step} className="flex items-start">
                    <div className="flex flex-col items-center gap-2 px-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors shadow-sm ${
                          done
                            ? "bg-blue-600 border-blue-600 text-white"
                            : isActive
                              ? "bg-white border-2 border-blue-500 text-gray-400"
                              : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}
                      >
                        {done ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full text-white">
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
                            ? "text-gray-400"
                            : done
                              ? "text-gray-600"
                              : "text-slate-500"
                        }`}
                      >
                        {step}
                      </span>
                    </div>

                    {index < track.steps.length - 1 && (
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
      ))}
    </div>
  );
}

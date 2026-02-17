"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/types";

type EligibilityQuestionItem = {
  question: string;
  answer: string;
};

type EligibilityQuestionSection = {
  title: string;
  items: EligibilityQuestionItem[];
};

const ELIGIBILITY_STEP_LABEL = "Eligibility Check";

const buildEligibilitySections = (
  project: Project,
): EligibilityQuestionSection[] => {
  const questionnaire = project.clientQuestionnaire;

  return [
    {
      title: "Step 1: Property Details",
      items: [
        {
          question: "Applicant Full Name",
          answer:
            questionnaire?.propertyDetails.applicantFullName || project.clientName,
        },
        {
          question: "Site Address",
          answer: questionnaire?.propertyDetails.siteAddress || project.location,
        },
        {
          question: "Postcode",
          answer: questionnaire?.propertyDetails.postcode || project.postcode,
        },
        {
          question: "Property Type",
          answer: questionnaire?.propertyDetails.propertyType || "Not provided",
        },
        {
          question: "Ownership Status",
          answer: questionnaire?.propertyDetails.ownershipStatus || "Not provided",
        },
        {
          question: "Conservation Area or Listed Building?",
          answer:
            questionnaire?.propertyDetails.conservationOrListed || "Not provided",
        },
        {
          question: "Purpose of Development",
          answer:
            questionnaire?.propertyDetails.purposeOfDevelopment || "Not provided",
        },
      ],
    },
    {
      title: "Step 2: Dimensions",
      items: [
        {
          question: "Existing Property Width (m)",
          answer:
            questionnaire?.dimensions.existingPropertyWidthM || "Not provided",
        },
        {
          question: "Existing Property Depth (m)",
          answer:
            questionnaire?.dimensions.existingPropertyDepthM || "Not provided",
        },
        {
          question: "Proposed Extension Depth (m)",
          answer:
            questionnaire?.dimensions.proposedExtensionDepthM || "Not provided",
        },
        {
          question: "Proposed Extension Height (m)",
          answer:
            questionnaire?.dimensions.proposedExtensionHeightM || "Not provided",
        },
        {
          question: "External Materials",
          answer: questionnaire?.dimensions.externalMaterials || "Not provided",
        },
        {
          question: "Brief Description of Proposed Works",
          answer: questionnaire?.dimensions.briefDescription || "Not provided",
        },
      ],
    },
    {
      title: "Step 3: Constraints",
      items: [
        {
          question: "Listed Building?",
          answer: questionnaire?.constraints.listedBuilding || "Not provided",
        },
        {
          question: "TPO? (Tree Preservation Order)",
          answer: questionnaire?.constraints.tpo || "Not provided",
        },
        {
          question: "Flood Zone?",
          answer: questionnaire?.constraints.floodZone || "Not provided",
        },
        {
          question: "Vehicle access?",
          answer: questionnaire?.constraints.vehicleAccess || "Not provided",
        },
        {
          question: "Pre-application advice?",
          answer:
            questionnaire?.constraints.preApplicationAdvice || "Not provided",
        },
        {
          question: "Additional Consents Required",
          answer:
            questionnaire?.constraints.additionalConsentsRequired ||
            "Not provided",
        },
      ],
    },
  ];
};

export default function EligibilityCheckDetails({
  project,
  activeStep,
  journeySteps,
}: {
  project: Project;
  activeStep: number;
  journeySteps: string[];
}) {
  const eligibilityStepIndex = journeySteps.findIndex(
    (step) => step === ELIGIBILITY_STEP_LABEL,
  );
  if (activeStep !== eligibilityStepIndex) {
    return null;
  }

  const sections = useMemo(() => buildEligibilitySections(project), [project]);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  if (sections.length === 0) {
    return null;
  }

  const clampedIndex = Math.min(activeSectionIndex, sections.length - 1);
  const activeSection = sections[clampedIndex];

  return (
    <div className="mt-5 border border-slate-200/80 rounded-xl p-4 bg-slate-50">
      <div className="flex flex-wrap items-center gap-2">
        {sections.map((section, index) => (
          <button
            key={section.title}
            type="button"
            onClick={() => setActiveSectionIndex(index)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              clampedIndex === index
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className="mt-4 border border-slate-200/80 rounded-xl bg-white">
        <div className="px-4 py-3 border-b border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase">
            {activeSection.title}
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {activeSection.items.map((item) => (
            <div
              key={item.question}
              className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4 px-4 py-3"
            >
              <p className="text-xs font-semibold text-slate-500 uppercase">
                {item.question}
              </p>
              <p className="text-sm font-semibold text-slate-900 sm:text-right">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 text-[11px] text-slate-500">
        Showing {clampedIndex + 1} of {sections.length} questionnaire steps.
      </div>
    </div>
  );
}

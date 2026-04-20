"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/types";

type EligibilityQuestionItem = {
  question: string;
  answer: string;
  href?: string;
};

type EligibilityQuestionGroup = {
  title: string;
  items: EligibilityQuestionItem[];
};

type EligibilityQuestionSection = {
  title: string;
  groups: EligibilityQuestionGroup[];
};

type EligibilityDetailsPayload = {
  _id?: string;
  projectId?: string;
  currentStep?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  applicantAndProperty?: {
    agentDetails?: {
      agentAddress?: string;
      agentContactEmailPhone?: string;
      agentName?: string;
      usesPlanningAgent?: boolean;
    };
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
      colourOrFinishNotes?: string;
      materialsMatchExisting?: string;
      roofMaterials?: string;
      wallMaterials?: string;
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
      officerName?: string;
      preApplicationAdviceSummary?: string;
      preApplicationReferenceNumber?: string;
      soughtPreAppAdvice?: string;
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
    communityConsultation?: string;
    ownershipCertificate?: {
      certificateOfOwnership?: string;
      ownershipDetails?: string;
    };
    utilitiesAndWaste?: {
      existingWasteArrangements?: string;
      renewableEnergyDetails?: string;
      renewableEnergyProposals?: string;
      sewageOrDrainage?: string;
      surfaceWaterDrainage?: string;
      waterSupply?: string;
    };
  };
  declarations?: {
    digitalSignature?: {
      signatoryCapacity?: string;
      signatoryFullName?: string;
    };
    reviewDeclarations?: {
      authorityConfirmed?: boolean;
      feeAgreementAccepted?: boolean;
      informationAccurate?: boolean;
      privateRightsAcknowledged?: boolean;
      publicDataConsent?: boolean;
    };
  };
  completionStatus?: {
    totalSteps?: number;
    completedSteps?: number;
    percentage?: number;
    isCompleted?: boolean;
    nextStep?: number;
    steps?: Array<{
      step?: number;
      key?: string;
      label?: string;
      completed?: boolean;
    }>;
  };
};

const ELIGIBILITY_STEP_LABEL = "Eligibility Check";

const asText = (value: unknown) => {
  if (value === undefined || value === null || value === "") return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

const asLinkItem = (question: string, value?: string): EligibilityQuestionItem => ({
  question,
  answer: value?.trim() ? "Open file" : "Not provided",
  href: value?.trim() || undefined,
});

const buildFallbackSections = (
  project: Project,
): EligibilityQuestionSection[] => {
  const questionnaire = project.clientQuestionnaire;

  return [
    {
      title: "Applicant + Property",
      groups: [
        {
          title: "Property Details",
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
              answer:
                questionnaire?.propertyDetails.ownershipStatus || "Not provided",
            },
            {
              question: "Conservation Area or Listed Building",
              answer:
                questionnaire?.propertyDetails.conservationOrListed ||
                "Not provided",
            },
            {
              question: "Purpose Of Development",
              answer:
                questionnaire?.propertyDetails.purposeOfDevelopment ||
                "Not provided",
            },
          ],
        },
      ],
    },
    {
      title: "Works + Materials",
      groups: [
        {
          title: "Dimensions",
          items: [
            {
              question: "Existing Property Width (m)",
              answer:
                questionnaire?.dimensions.existingPropertyWidthM ||
                "Not provided",
            },
            {
              question: "Existing Property Depth (m)",
              answer:
                questionnaire?.dimensions.existingPropertyDepthM ||
                "Not provided",
            },
            {
              question: "Proposed Extension Depth (m)",
              answer:
                questionnaire?.dimensions.proposedExtensionDepthM ||
                "Not provided",
            },
            {
              question: "Proposed Extension Height (m)",
              answer:
                questionnaire?.dimensions.proposedExtensionHeightM ||
                "Not provided",
            },
            {
              question: "External Materials",
              answer:
                questionnaire?.dimensions.externalMaterials || "Not provided",
            },
            {
              question: "Brief Description",
              answer:
                questionnaire?.dimensions.briefDescription || "Not provided",
            },
          ],
        },
      ],
    },
    {
      title: "Site Constraints",
      groups: [
        {
          title: "Constraints",
          items: [
            {
              question: "Listed Building",
              answer: questionnaire?.constraints.listedBuilding || "Not provided",
            },
            {
              question: "TPO",
              answer: questionnaire?.constraints.tpo || "Not provided",
            },
            {
              question: "Flood Zone",
              answer: questionnaire?.constraints.floodZone || "Not provided",
            },
            {
              question: "Vehicle Access",
              answer: questionnaire?.constraints.vehicleAccess || "Not provided",
            },
            {
              question: "Pre-application Advice",
              answer:
                questionnaire?.constraints.preApplicationAdvice ||
                "Not provided",
            },
            {
              question: "Additional Consents Required",
              answer:
                questionnaire?.constraints.additionalConsentsRequired ||
                "Not provided",
            },
          ],
        },
      ],
    },
  ];
};

const buildRawSections = (
  eligibilityData: EligibilityDetailsPayload,
): EligibilityQuestionSection[] => {
  const agentDetails = eligibilityData.applicantAndProperty?.agentDetails;
  const applicantDetails =
    eligibilityData.applicantAndProperty?.applicantDetails;
  const propertyAndOwnership =
    eligibilityData.applicantAndProperty?.propertyAndOwnership;
  const descriptionOfWorks =
    eligibilityData.worksAndMaterials?.descriptionOfWorks;
  const materials = eligibilityData.worksAndMaterials?.materials;
  const plans = eligibilityData.worksAndMaterials?.plansDrawingsPhotographs;
  const accessAndParking = eligibilityData.siteConstraints?.accessAndParking;
  const floodAndEnvironmentalRisk =
    eligibilityData.siteConstraints?.floodAndEnvironmentalRisk;
  const heritageAndListing =
    eligibilityData.siteConstraints?.heritageAndListing;
  const preApplicationAdvice =
    eligibilityData.siteConstraints?.preApplicationAdvice;
  const treesHedgesLandscaping =
    eligibilityData.siteConstraints?.treesHedgesLandscaping;
  const utilitiesAndConsents = eligibilityData.utilitiesAndConsents;
  const ownershipCertificate = utilitiesAndConsents?.ownershipCertificate;
  const utilitiesAndWaste = utilitiesAndConsents?.utilitiesAndWaste;
  const digitalSignature = eligibilityData.declarations?.digitalSignature;
  const reviewDeclarations =
    eligibilityData.declarations?.reviewDeclarations;

  return [
    {
      title: "Applicant + Property",
      groups: [
        {
          title: "Agent Details",
          items: [
            {
              question: "Uses Planning Agent",
              answer: asText(agentDetails?.usesPlanningAgent),
            },
            { question: "Agent Name", answer: asText(agentDetails?.agentName) },
            {
              question: "Agent Contact Email / Phone",
              answer: asText(agentDetails?.agentContactEmailPhone),
            },
            {
              question: "Agent Address",
              answer: asText(agentDetails?.agentAddress),
            },
          ],
        },
        {
          title: "Applicant Details",
          items: [
            {
              question: "Full Name",
              answer: asText(applicantDetails?.fullName),
            },
            {
              question: "Contact Email / Phone",
              answer: asText(applicantDetails?.contactEmailPhone),
            },
            {
              question: "Site Address",
              answer: asText(applicantDetails?.siteAddress),
            },
            {
              question: "Postcode",
              answer: asText(applicantDetails?.postcode),
            },
          ],
        },
        {
          title: "Property And Ownership",
          items: [
            {
              question: "Property Type",
              answer: asText(propertyAndOwnership?.propertyType),
            },
            {
              question: "Ownership Status",
              answer: asText(propertyAndOwnership?.ownershipStatus),
            },
            {
              question: "Purpose Of Development",
              answer: asText(propertyAndOwnership?.purposeOfDevelopment),
            },
            {
              question: "Near Conservation Area Or Listed Building",
              answer: asText(
                propertyAndOwnership?.nearConservationAreaOrListedBuilding,
              ),
            },
          ],
        },
      ],
    },
    {
      title: "Works + Materials",
      groups: [
        {
          title: "Description Of Works",
          items: [
            {
              question: "Proposed Works Description",
              answer: asText(descriptionOfWorks?.propsedWorksDescription),
            },
            {
              question: "Existing Property Width (m)",
              answer: asText(descriptionOfWorks?.existingPropertyWidthM),
            },
            {
              question: "Distance From Boundary (m)",
              answer: asText(descriptionOfWorks?.distanceFromBoundaryM),
            },
            {
              question: "Existing Property Height (m)",
              answer: asText(descriptionOfWorks?.existingPropertyHeightM),
            },
            {
              question: "Proposed Extension Height (m)",
              answer: asText(descriptionOfWorks?.proposedExtensionHeightM),
            },
            {
              question: "Proposed Extension Width (m)",
              answer: asText(descriptionOfWorks?.proposedExtensionWidthM),
            },
            {
              question: "Ridge Or Eaves Height (m)",
              answer: asText(descriptionOfWorks?.ridgeOrEavesHeightM),
            },
          ],
        },
        {
          title: "Materials",
          items: [
            {
              question: "Materials Match Existing",
              answer: asText(materials?.materialsMatchExisting),
            },
            {
              question: "Wall Materials",
              answer: asText(materials?.wallMaterials),
            },
            {
              question: "Roof Materials",
              answer: asText(materials?.roofMaterials),
            },
            {
              question: "Colour Or Finish Notes",
              answer: asText(materials?.colourOrFinishNotes),
            },
          ],
        },
        {
          title: "Plans, Drawings, Photographs",
          items: [
            asLinkItem("Location Plan", plans?.locationPlan),
            asLinkItem("Site Plan", plans?.sitePlan),
            asLinkItem(
              "Existing And Proposed Elevations",
              plans?.existingAndProposedElevations,
            ),
            asLinkItem("Additional Drawings", plans?.additionalDrawings),
            asLinkItem("Photographs Of Site", plans?.photographsOfSite),
          ],
        },
      ],
    },
    {
      title: "Site Constraints",
      groups: [
        {
          title: "Access And Parking",
          items: [
            {
              question: "New Or Altered Access",
              answer: asText(accessAndParking?.newOrAlteredAccess),
            },
            {
              question: "Access Or Parking Changes",
              answer: asText(accessAndParking?.accessOrParkingChanges),
            },
            {
              question: "Cycle Storage Provisions",
              answer: asText(accessAndParking?.cycleStorageProvisions),
            },
          ],
        },
        {
          title: "Flood And Environmental Risk",
          items: [
            {
              question: "Is Site In Flood Risk Area",
              answer: asText(floodAndEnvironmentalRisk?.isSiteInFloodRiskArea),
            },
            {
              question: "Is Site Contaminated Land",
              answer: asText(
                floodAndEnvironmentalRisk?.isSiteContaminatedLand,
              ),
            },
            asLinkItem(
              "Flood Risk Assessment Report",
              floodAndEnvironmentalRisk?.floodRiskAssesmentReport,
            ),
          ],
        },
        {
          title: "Heritage And Listing",
          items: [
            {
              question: "Is In Conservation Area",
              answer: asText(heritageAndListing?.isInConservationArea),
            },
            {
              question: "Is Listed Building",
              answer: asText(heritageAndListing?.isListedBuilding),
            },
          ],
        },
        {
          title: "Pre-application Advice",
          items: [
            {
              question: "Sought Pre-app Advice",
              answer: asText(preApplicationAdvice?.soughtPreAppAdvice),
            },
            {
              question: "Officer Name",
              answer: asText(preApplicationAdvice?.officerName),
            },
            {
              question: "Reference Number",
              answer: asText(preApplicationAdvice?.preApplicationReferenceNumber),
            },
            {
              question: "Advice Summary",
              answer: asText(preApplicationAdvice?.preApplicationAdviceSummary),
            },
          ],
        },
        {
          title: "Trees, Hedges, Landscaping",
          items: [
            {
              question: "Trees With TPO",
              answer: asText(treesHedgesLandscaping?.treesWithTPO),
            },
            {
              question: "Trees Within Falling Distance",
              answer: asText(
                treesHedgesLandscaping?.treesWithinFallingDistance,
              ),
            },
            {
              question: "Tree Species",
              answer: asText(treesHedgesLandscaping?.treeSpecies),
            },
            asLinkItem(
              "Tree Survey Report",
              treesHedgesLandscaping?.treeSurveyReport,
            ),
          ],
        },
      ],
    },
    {
      title: "Utilities + Consents",
      groups: [
        {
          title: "Consents",
          items: [
            {
              question: "Additional Consents",
              answer: asText(utilitiesAndConsents?.additionalConsents),
            },
            {
              question: "Community Consultation",
              answer: asText(utilitiesAndConsents?.communityConsultation),
            },
          ],
        },
        {
          title: "Ownership Certificate",
          items: [
            {
              question: "Certificate Of Ownership",
              answer: asText(ownershipCertificate?.certificateOfOwnership),
            },
            {
              question: "Ownership Details",
              answer: asText(ownershipCertificate?.ownershipDetails),
            },
          ],
        },
        {
          title: "Utilities And Waste",
          items: [
            {
              question: "Water Supply",
              answer: asText(utilitiesAndWaste?.waterSupply),
            },
            {
              question: "Surface Water Drainage",
              answer: asText(utilitiesAndWaste?.surfaceWaterDrainage),
            },
            {
              question: "Sewage Or Drainage",
              answer: asText(utilitiesAndWaste?.sewageOrDrainage),
            },
            {
              question: "Existing Waste Arrangements",
              answer: asText(utilitiesAndWaste?.existingWasteArrangements),
            },
            {
              question: "Renewable Energy Proposals",
              answer: asText(utilitiesAndWaste?.renewableEnergyProposals),
            },
            {
              question: "Renewable Energy Details",
              answer: asText(utilitiesAndWaste?.renewableEnergyDetails),
            },
          ],
        },
      ],
    },
    {
      title: "Declaration",
      groups: [
        {
          title: "Digital Signature",
          items: [
            {
              question: "Signatory Full Name",
              answer: asText(digitalSignature?.signatoryFullName),
            },
            {
              question: "Signatory Capacity",
              answer: asText(digitalSignature?.signatoryCapacity),
            },
          ],
        },
        {
          title: "Review Declarations",
          items: [
            {
              question: "Authority Confirmed",
              answer: asText(reviewDeclarations?.authorityConfirmed),
            },
            {
              question: "Fee Agreement Accepted",
              answer: asText(reviewDeclarations?.feeAgreementAccepted),
            },
            {
              question: "Information Accurate",
              answer: asText(reviewDeclarations?.informationAccurate),
            },
            {
              question: "Private Rights Acknowledged",
              answer: asText(reviewDeclarations?.privateRightsAcknowledged),
            },
            {
              question: "Public Data Consent",
              answer: asText(reviewDeclarations?.publicDataConsent),
            },
          ],
        },
      ],
    },
  ];
};

export default function EligibilityCheckDetails({
  project,
  activeStep,
  journeySteps,
  eligibilityData,
}: {
  project: Project;
  activeStep: number;
  journeySteps: string[];
  eligibilityData?: EligibilityDetailsPayload | null;
}) {
  const eligibilityStepIndex = journeySteps.findIndex(
    (step) => step === ELIGIBILITY_STEP_LABEL,
  );
  if (activeStep !== eligibilityStepIndex) {
    return null;
  }

  const sections = useMemo(
    () =>
      eligibilityData
        ? buildRawSections(eligibilityData)
        : buildFallbackSections(project),
    [eligibilityData, project],
  );
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  if (sections.length === 0) {
    return null;
  }

  const clampedIndex = Math.min(activeSectionIndex, sections.length - 1);
  const activeSection = sections[clampedIndex];

  return (
    <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {sections.map((section, index) => (
          <button
            key={section.title}
            type="button"
            onClick={() => setActiveSectionIndex(index)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              clampedIndex === index
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {activeSection.groups.map((group) => (
          <div
            key={group.title}
            className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
          >
            <div className="border-b border-slate-200/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                {group.title}
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {group.items.map((item) => (
                <div
                  key={`${group.title}-${item.question}`}
                  className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-2 sm:gap-4"
                >
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {item.question}
                  </p>
                  <div className="sm:text-right">
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-blue-700 hover:underline"
                      >
                        {item.answer}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-slate-900">
                        {item.answer}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-[11px] text-slate-500">
        Showing {clampedIndex + 1} of {sections.length} eligibility sections.
      </div>
    </div>
  );
}

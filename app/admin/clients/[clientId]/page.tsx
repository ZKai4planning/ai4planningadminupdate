import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, UserRound } from "lucide-react";
import { mockClients, mockProjects } from "@/app/lib/mock-data";

type ClientFollowUpPageProps = {
  params: {
    clientId: string;
  };
};

export default function ClientFollowUpPage({ params }: ClientFollowUpPageProps) {
  const client = mockClients.find((item) => item.id === params.clientId);

  if (!client) {
    notFound();
  }

  const existingProject = mockProjects.find(
    (project) => project.clientId === client.id,
  );

  const followUpState = existingProject
    ? {
        heading: "Project already exists for this client",
        summary:
          "This client has an active project. Follow-up is currently being handled inside project workflow.",
        blocker: "No onboarding blocker at client level.",
        urgency: "Low",
      }
    : {
        heading: "Agent X follow-up required",
        summary:
          "Agent X is following up with the client to understand why progress is stalled after login/payment activity.",
        blocker:
          "Client has not selected a service yet, or client paid the initial amount but did not continue to the next step.",
        urgency: "High",
      };

  const nextActions = existingProject
    ? [
        "Continue tracking progress from the project details screen.",
        "Use project notes for all client communication updates.",
        "No separate onboarding escalation required right now.",
      ]
    : [
        "Agent X to call client and confirm service requirement.",
        "Clarify why the client has not selected any service after logging in.",
        "If initial payment is done, guide client through remaining required actions.",
        "Capture client response and set next follow-up date.",
      ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Client Follow-up Details</h1>
          <p className="text-slate-600 mt-2">
            Operational follow-up for onboarding and payment progression.
          </p>
        </div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-blue-50 p-2">
              <UserRound className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{client.name}</p>
              <p className="text-sm text-slate-600 mt-1">
                {client.id} | {client.email} | {client.phone}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Urgency</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              followUpState.urgency === "High" ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {followUpState.urgency}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-lg bg-amber-50 p-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{followUpState.heading}</h2>
            <p className="text-sm text-slate-600 mt-2">{followUpState.summary}</p>
            <p className="text-sm text-slate-700 mt-3">
              <span className="font-semibold text-slate-900">Reason: </span>
              {followUpState.blocker}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Agent X Follow-up Plan</h3>
          </div>
          <div className="mt-4 space-y-3">
            {nextActions.map((action) => (
              <div key={action} className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                <p className="text-sm text-slate-700">{action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Current Client Signals</h3>
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">Client status:</span> {client.status}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Payment status:</span> {client.paymentStatus}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Joined:</span>{" "}
              {new Date(client.joinedDate).toLocaleDateString("en-GB")}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Project linked:</span>{" "}
              {existingProject ? existingProject.id : "No project created yet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


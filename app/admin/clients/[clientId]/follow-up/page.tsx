import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, MessageSquareText, UserRound } from "lucide-react";
import { mockClients, mockProjects } from "@/app/lib/mock-data";

type FollowUpPageProps = {
  params: Promise<{
    clientId: string;
  }>;
};

const followUpNotes: Record<
  string,
  {
    blockerTitle: string;
    blockerReason: string;
    agentXName: string;
    responseDate: string;
    responseSummary: string;
    requestedSupport: string;
    nextStep: string;
  }
> = {
  cl003: {
    blockerTitle: "Client paused after initial onboarding",
    blockerReason:
      "Client completed payment and login but did not move to the next planning step because they were unsure which service option fits their extension scope.",
    agentXName: "James Mitchell",
    responseDate: "2026-02-08",
    responseSummary:
      "Client said they need clarity on whether a full planning submission is required or if permitted development may be enough before they continue.",
    requestedSupport:
      "They asked for a short call to compare service options, expected timelines, and the document list needed from their side.",
    nextStep:
      "Agent X to schedule a 15-minute guidance call, share recommended service path, and confirm a decision deadline.",
  },
};

const defaultFollowUp = {
  blockerTitle: "Client did not proceed to next stage",
  blockerReason:
    "No confirmed progression after login/payment. Client activity indicates onboarding is paused before service finalization.",
  agentXName: "Agent X",
  responseDate: "2026-02-08",
  responseSummary:
    "Client acknowledged the follow-up and requested more clarity before committing to the next stage.",
  requestedSupport:
    "Requested a clear breakdown of next actions, expected timeline, and required documents.",
  nextStep:
    "Agent X to send a concise next-step checklist and set a follow-up reminder within 48 hours.",
};

export default async function ClientFollowUpReportPage({ params }: FollowUpPageProps) {
  const { clientId } = await params;
  const client = mockClients.find((item) => item.id === clientId);

  if (!client) {
    notFound();
  }

  const project = mockProjects.find((item) => item.clientId === client.id);
  const note = followUpNotes[client.id] ?? defaultFollowUp;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Follow-up Report</h1>
       
        </div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
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

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-lg bg-amber-50 p-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{note.blockerTitle}</h2>
            <p className="text-sm text-slate-600 mt-2">{note.blockerReason}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Agent X Follow-up Response</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">Followed up by:</span> {note.agentXName}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Date:</span>{" "}
              {new Date(note.responseDate).toLocaleDateString("en-GB")}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Client response:</span>{" "}
              {note.responseSummary}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Support requested:</span>{" "}
              {note.requestedSupport}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Next Action</h3>
          </div>
          <p className="text-sm text-slate-700 mt-4">{note.nextStep}</p>
        </div>
      </div>
    </div>
  );
}

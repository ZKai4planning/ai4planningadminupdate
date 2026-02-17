import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Flag,
  Link2,
  UserCircle2,
} from 'lucide-react';
import type { Project } from '@/types';

type TaskPriority = 'high' | 'medium' | 'low';

type FlowStep = {
  id: string;
  label: string;
  description: string;
};

type DependencyItem = {
  id: string;
  title: string;
  relation: string;
  owner: string;
  blocked: boolean;
};

type TaskPhaseTemplate = {
  title: string;
  summary: string;
  flowSteps: FlowStep[];
  checklistBase: string[];
  dependencies: DependencyItem[];
};

type FocusTask = {
  lane: 'x' | 'y';
  title: string;
  detail: string;
  status: string;
};

const statusBadgeStyles: Record<Project['status'], string> = {
  pending: 'bg-slate-100 text-slate-700',
  registered: 'bg-blue-100 text-blue-700',
  docs_received: 'bg-sky-100 text-sky-700',
  in_review: 'bg-amber-100 text-amber-700',
  architect_assigned: 'bg-indigo-100 text-indigo-700',
  measurements_done: 'bg-cyan-100 text-cyan-700',
  drawings_in_progress: 'bg-violet-100 text-violet-700',
  drawings_received: 'bg-purple-100 text-purple-700',
  submitted_to_council: 'bg-fuchsia-100 text-fuchsia-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
};

const priorityBadgeStyles: Record<TaskPriority, string> = {
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
};

const phaseByStatus: Record<Project['status'], TaskPhaseTemplate> = {
  pending: {
    title: 'Intake Validation',
    summary:
      'Reviewing client intent and confirming service fit before cross-team work starts.',
    flowSteps: [
      { id: 'intake', label: 'Intake', description: 'Collect project basics' },
      { id: 'scope', label: 'Scope Match', description: 'Service and risk screening' },
      { id: 'handoff', label: 'Assign Agent X', description: 'Primary owner assignment' },
    ],
    checklistBase: [
      'Confirm service selection against site type',
      'Validate address, postcode, and baseline constraints',
      'Create initial case notes for Project X',
    ],
    dependencies: [
      {
        id: 'dep-px-setup',
        title: 'Project X setup',
        relation: 'Downstream task',
        owner: 'Agent X workflow',
        blocked: false,
      },
    ],
  },
  registered: {
    title: 'Registration Complete',
    summary: 'Project is registered and prepared for document capture and workflow routing.',
    flowSteps: [
      { id: 'reg', label: 'Register', description: 'Case ID and ownership locked' },
      { id: 'docs', label: 'Docs Intake', description: 'Collect source documents' },
      { id: 'route', label: 'Route', description: 'Queue for review' },
    ],
    checklistBase: [
      'Generate assignment packet for Agent X',
      'Issue document request list to client',
      'Mark cross-team sync requirement for Project Y',
    ],
    dependencies: [
      {
        id: 'dep-py-sync',
        title: 'Project Y planning sync',
        relation: 'Cross-project dependency',
        owner: 'Agent Y workflow',
        blocked: true,
      },
    ],
  },
  docs_received: {
    title: 'Document Verification',
    summary: 'Checking submitted documents before technical evaluation begins.',
    flowSteps: [
      { id: 'collect', label: 'Collect', description: 'Receive initial files' },
      { id: 'verify', label: 'Verify', description: 'Completeness and quality checks' },
      { id: 'handoff', label: 'Review Prep', description: 'Move to analyst queue' },
    ],
    checklistBase: [
      'Verify title, plan, and ownership documents',
      'Highlight missing artifacts for client follow-up',
      'Prepare review bundle for Agent X',
    ],
    dependencies: [
      {
        id: 'dep-agentx-review',
        title: 'Agent X review packet',
        relation: 'Downstream task',
        owner: 'Project X',
        blocked: false,
      },
    ],
  },
  in_review: {
    title: 'Feasibility Review',
    summary: 'Agent X is validating planning feasibility and preparing design instructions.',
    flowSteps: [
      { id: 'analysis', label: 'Analyze', description: 'Policy and site viability' },
      { id: 'risk', label: 'Risk Check', description: 'Exceptions and blockers' },
      { id: 'handoff', label: 'Handoff to Y', description: 'Design briefing' },
    ],
    checklistBase: [
      'Review planning constraints and local policy',
      'Create feasibility note with assumptions',
      'Send structured brief for Agent Y',
    ],
    dependencies: [
      {
        id: 'dep-py-design',
        title: 'Project Y design kickoff',
        relation: 'Cross-project dependency',
        owner: 'Agent Y',
        blocked: false,
      },
    ],
  },
  architect_assigned: {
    title: 'Design Initiation',
    summary: 'Architect and Agent Y are aligned on validated inputs from Agent X.',
    flowSteps: [
      { id: 'brief', label: 'Brief', description: 'Agent X to Agent Y handoff' },
      { id: 'assign', label: 'Architect Assign', description: 'Technical owner confirmed' },
      { id: 'draft', label: 'Draft Plan', description: 'Drawings start' },
    ],
    checklistBase: [
      'Confirm architect availability and role ownership',
      'Validate design brief from Project X outputs',
      'Create drawing milestone and estimate',
    ],
    dependencies: [
      {
        id: 'dep-drawing-queue',
        title: 'Drawing queue slot',
        relation: 'Operational dependency',
        owner: 'Architecture team',
        blocked: false,
      },
    ],
  },
  measurements_done: {
    title: 'Measurement Complete',
    summary: 'Site measurements are complete and the drafting package is ready.',
    flowSteps: [
      { id: 'site', label: 'Site Capture', description: 'Measurements captured' },
      { id: 'validate', label: 'Validate', description: 'Check dimensions and notes' },
      { id: 'draft', label: 'Drafting', description: 'Move into drawings' },
    ],
    checklistBase: [
      'Upload verified site measurement sheet',
      'Resolve dimension conflicts from earlier intake',
      'Open drafting task with due date',
    ],
    dependencies: [
      {
        id: 'dep-structural',
        title: 'Structural pre-check',
        relation: 'Downstream task',
        owner: 'Technical review',
        blocked: false,
      },
    ],
  },
  drawings_in_progress: {
    title: 'Drawings In Progress',
    summary: 'Agent Y is producing the drawing package while dependencies are tracked.',
    flowSteps: [
      { id: 'prep', label: 'Prep', description: 'Reference files and standards' },
      { id: 'draw', label: 'Create Drawings', description: 'Draft and iterate' },
      { id: 'qa', label: 'Internal QA', description: 'Ready for delivery' },
    ],
    checklistBase: [
      'Complete baseline drawing set',
      'Run internal QA against council checklist',
      'Resolve comments from Agent X and architect',
    ],
    dependencies: [
      {
        id: 'dep-projectx-approval',
        title: 'Project X sign-off',
        relation: 'Cross-project dependency',
        owner: 'Agent X',
        blocked: true,
      },
    ],
  },
  drawings_received: {
    title: 'Drawings Received',
    summary: 'Drawing set delivered and prepared for council submission workflow.',
    flowSteps: [
      { id: 'receive', label: 'Receive', description: 'Collect final package' },
      { id: 'review', label: 'Final Review', description: 'Submission readiness check' },
      { id: 'submit', label: 'Submit Prep', description: 'Council application prep' },
    ],
    checklistBase: [
      'Verify drawing set version and naming',
      'Run final submission checklist',
      'Attach package to council application draft',
    ],
    dependencies: [
      {
        id: 'dep-council-slot',
        title: 'Council submission slot',
        relation: 'External dependency',
        owner: 'Council ops',
        blocked: false,
      },
    ],
  },
  submitted_to_council: {
    title: 'Council Submission',
    summary: 'Submission is live and the team is managing council interactions and responses.',
    flowSteps: [
      { id: 'submit', label: 'Submit', description: 'Application filed' },
      { id: 'track', label: 'Track', description: 'Monitor validation and comments' },
      { id: 'respond', label: 'Respond', description: 'Address follow-ups' },
    ],
    checklistBase: [
      'Record council reference and SLA milestones',
      'Track requests for further information',
      'Coordinate Agent X and Agent Y response loop',
    ],
    dependencies: [
      {
        id: 'dep-council-feedback',
        title: 'Council feedback cycle',
        relation: 'External dependency',
        owner: 'Council authority',
        blocked: false,
      },
    ],
  },
  approved: {
    title: 'Project Approved',
    summary: 'Submission approved and final closure activities are in progress.',
    flowSteps: [
      { id: 'decision', label: 'Decision', description: 'Approval confirmed' },
      { id: 'closure', label: 'Closeout', description: 'Archive and sign-off' },
      { id: 'handover', label: 'Handover', description: 'Client completion handoff' },
    ],
    checklistBase: [
      'Publish approval summary for client',
      'Archive Project X and Project Y artifacts',
      'Close all open dependencies and notes',
    ],
    dependencies: [
      {
        id: 'dep-billing-close',
        title: 'Billing closure',
        relation: 'Operational dependency',
        owner: 'Finance',
        blocked: false,
      },
    ],
  },
  rejected: {
    title: 'Decision Rejected',
    summary: 'Council decision is rejected and remediation flow is active.',
    flowSteps: [
      { id: 'decision', label: 'Decision', description: 'Rejection captured' },
      { id: 'review', label: 'Review', description: 'Assess rejection reasons' },
      { id: 'next', label: 'Next Action', description: 'Appeal or redesign path' },
    ],
    checklistBase: [
      'Capture rejection reasons and supporting notes',
      'Run remediation workshop with Agent X and Agent Y',
      'Create revised plan or appeal recommendation',
    ],
    dependencies: [
      {
        id: 'dep-remediation',
        title: 'Remediation workflow',
        relation: 'Cross-project dependency',
        owner: 'Project X + Project Y',
        blocked: false,
      },
    ],
  },
};

const formatLabel = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatDate = (value?: string) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const resolvePriority = (project: Project): TaskPriority => {
  if (project.status === 'rejected') return 'high';
  if (project.status === 'approved') return 'low';
  if (project.progress >= 80) return 'medium';
  return 'high';
};

const buildChecklist = (project: Project, checklistBase: string[]) => {
  const completedCount = Math.max(
    0,
    Math.min(checklistBase.length, Math.floor((project.progress / 100) * checklistBase.length)),
  );

  return checklistBase.map((item, index) => ({
    id: `${project.id}-task-${index + 1}`,
    label: item,
    completed: index < completedCount,
  }));
};

const buildFocusedPhase = (
  project: Project,
  phase: TaskPhaseTemplate,
  focusStep?: string,
  focusTask?: FocusTask,
): TaskPhaseTemplate => {
  if (focusTask) {
    const isAgentX = focusTask.lane === 'x';
    const ownerName = isAgentX ? project.agentX || 'Agent X' : project.agentY || 'Agent Y';
    const peerName = isAgentX ? project.agentY || 'Agent Y' : project.agentX || 'Agent X';
    const isBlocked = focusTask.status.toLowerCase().includes('pending');

    return {
      title: `${isAgentX ? 'Agent X' : 'Agent Y'} Task Focus`,
      summary: `${focusTask.title}: ${focusTask.detail}`,
      flowSteps: [
        {
          id: 'selected-task',
          label: focusTask.title,
          description: `Current status: ${focusTask.status}`,
        },
        {
          id: 'sync-step',
          label: 'Sync Review',
          description: `${isAgentX ? 'Agent Y' : 'Agent X'} dependency mapping and handoff check`,
        },
        {
          id: 'closure-step',
          label: 'Update Loop',
          description: 'Track notes, blockers, and close feedback cycle',
        },
      ],
      checklistBase: [
        `Validate task scope for ${ownerName}`,
        `Confirm sync handoff with ${peerName}`,
        'Log status update and close outstanding blockers',
      ],
      dependencies: [
        {
          id: `dep-focused-owner-${focusTask.lane}`,
          title: `${ownerName} delivery checkpoint`,
          relation: 'Task dependency',
          owner: ownerName,
          blocked: isBlocked,
        },
        {
          id: `dep-focused-peer-${focusTask.lane}`,
          title: `${peerName} sync acknowledgment`,
          relation: 'Cross-team dependency',
          owner: peerName,
          blocked: false,
        },
      ],
    };
  }

  const normalized = (focusStep || '').toLowerCase();
  const isCrossTeamFocus =
    normalized.includes('project assigned to agent y') ||
    normalized.includes('agent x and agent y');

  if (!isCrossTeamFocus) {
    return phase;
  }

  return {
    title: 'Agent X and Agent Y Coordination',
    summary:
      'Cross-team coordination is active. Agent X analysis outputs are being synchronized with Agent Y execution tasks.',
    flowSteps: [
      { id: 'x-state', label: 'Agent X Status', description: 'Feasibility and policy outputs are finalized' },
      { id: 'sync-link', label: 'Sync Bridge', description: 'Handoff packet and dependency mapping verified' },
      { id: 'y-state', label: 'Agent Y Status', description: 'Drawing and execution workflow aligned to X' },
    ],
    checklistBase: [
      `Lock Agent X handoff packet for ${project.id}`,
      'Map X deliverables to Y execution checklist',
      'Validate feedback loop and response SLA between X and Y',
    ],
    dependencies: [
      {
        id: 'dep-cross-x-signoff',
        title: 'Agent X sign-off on briefing scope',
        relation: 'Cross-team dependency',
        owner: project.agentX || 'Agent X',
        blocked: false,
      },
      {
        id: 'dep-cross-y-acceptance',
        title: 'Agent Y acceptance of execution brief',
        relation: 'Cross-team dependency',
        owner: project.agentY || 'Agent Y',
        blocked: !project.agentY,
      },
    ],
  };
};

export default function TaskDetails({
  project,
  focusStep,
  focusTask,
}: {
  project: Project;
  focusStep?: string;
  focusTask?: FocusTask;
}) {
  const phase = buildFocusedPhase(project, phaseByStatus[project.status], focusStep, focusTask);
  const priority = resolvePriority(project);
  const checklist = buildChecklist(project, phase.checklistBase);
  const isCrossTeamFocus =
    Boolean(focusTask) ||
    (focusStep || '').toLowerCase().includes('project assigned to agent y') ||
    (focusStep || '').toLowerCase().includes('agent x and agent y');

  return (
    <article className={`rounded-xl bg-white p-4 ${isCrossTeamFocus ? 'ring-1 ring-yellow-200 bg-yellow-50/40' : 'ring-1 ring-slate-200/70'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">Task Details</p>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusBadgeStyles[project.status]}`}
          >
            {formatLabel(project.status)}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${priorityBadgeStyles[priority]}`}
          >
            {priority} Priority
          </span>
        </div>
      </div>

      <h3 className="mt-3 text-lg font-bold text-slate-900">{phase.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{phase.summary}</p>

      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
        {phase.flowSteps.map((step, index) => (
          <div key={step.id} className="rounded-lg px-3 py-2 bg-white/80 ring-1 ring-slate-200/60">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Step {index + 1}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{step.label}</p>
            <p className="text-xs text-slate-600">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-slate-200/60">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {isCrossTeamFocus ? 'Assigned Agents' : 'Assigned Agent'}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <UserCircle2 className="h-4 w-4 text-blue-600" />
            {isCrossTeamFocus
              ? `${project.agentX || 'Unassigned'} + ${project.agentY || 'Unassigned'}`
              : project.agentX || 'Unassigned'}
          </p>
        </div>
        <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-slate-200/60">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Date</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            {formatDate(project.agentXAssignedDate || project.createdDate)}
          </p>
        </div>
        <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-slate-200/60">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Due Date
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Flag className="h-4 w-4 text-blue-600" />
            {formatDate(project.estimatedCompletionDate)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Sub-task Checklist
        </p>
        <div className="mt-2 divide-y divide-slate-100 rounded-lg bg-white/80 ring-1 ring-slate-200/60">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-3 py-2"
            >
              {item.completed ? (
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              ) : (
                <Circle className="h-4 w-4 text-slate-400" />
              )}
              <p
                className={`text-sm ${
                  item.completed ? 'font-medium text-slate-500 line-through' : 'font-semibold text-slate-800'
                }`}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Workflow Dependencies
        </p>
        <div className="mt-2 space-y-2">
          {phase.dependencies.map((dependency) => (
            <div
              key={dependency.id}
              className="rounded-lg bg-violet-50/60 px-3 py-2 ring-1 ring-violet-100"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">
                {dependency.relation}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Link2 className="h-4 w-4 text-violet-500" />
                {dependency.title}
              </p>
              <p className="text-xs text-slate-600">
                {dependency.owner}
                {dependency.blocked ? ' | Blocked' : ' | Active'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

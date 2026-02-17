import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BriefcaseBusiness, FolderKanban, Users } from 'lucide-react';
import { mockProjects, mockTeamMembers } from '@/app/lib/mock-data';


const getDesignation = (role: string) => {
  if (role === 'agent_x') return 'Business Analyst';
  if (role === 'agent_y') return 'CAD Engineer';
  if (role === 'architect') return 'Architect Lead';
  if (role === 'admin') return 'Operations Manager';
  return role.replace('_', ' ');
};

const getRegionLabel = (region: string) =>
  region === 'uk' ? 'United Kingdom (UK)' : 'India (IN)';

const getTeamLabel = (team: string) =>
  team === 'london' ? 'London Team' : 'India Team';

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const member = mockTeamMembers.find((item) => item.id === memberId);

  if (!member) {
    notFound();
  }

  const assignedProjects = mockProjects.filter(
    (project) =>
      project.agentX === member.name ||
      project.agentY === member.name ||
      project.architect === member.name,
  );

  const customersHandled = Array.from(
    new Set(assignedProjects.map((project) => project.clientName)),
  );

  const isLead = member.role === 'architect' || member.role === 'admin';
  const managedMembers = isLead
    ? mockTeamMembers.filter(
        (item) =>
          item.id !== member.id &&
          (member.role === 'admin'
            ? item.region === member.region
            : item.team === member.team),
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </Link>
    
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
  <div>
    <h1 className="text-2xl font-bold text-slate-900">
      {member.name}
    </h1>
    <p className="mt-1 text-sm text-slate-600">
      {getDesignation(member.role)} | {getTeamLabel(member.team)}
    </p>
  </div>

  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
    {member.agentCode}
  </span>
</div>


        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Email</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{member.email}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Region</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {getRegionLabel(member.region)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Team</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {getTeamLabel(member.team)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Leadership</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {isLead ? 'Team Lead / Manager' : 'Individual Contributor'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold text-slate-900">Managed Team Members</p>
        </div>
        {managedMembers.length === 0 ? (
          <p className="text-sm text-slate-600">
            This agent currently has no direct reports.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {managedMembers.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {getDesignation(item.role)} | {item.email}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold text-slate-900">
              Customers Handled ({customersHandled.length})
            </p>
          </div>
          {customersHandled.length === 0 ? (
            <p className="text-sm text-slate-600">No active customer assignments yet.</p>
          ) : (
            <div className="space-y-2">
              {customersHandled.map((clientName) => (
                <div
                  key={clientName}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800"
                >
                  {clientName}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold text-slate-900">
              Current Projects ({assignedProjects.length})
            </p>
          </div>
          {assignedProjects.length === 0 ? (
            <p className="text-sm text-slate-600">No projects assigned at the moment.</p>
          ) : (
            <div className="space-y-3">
              {assignedProjects.map((project) => (
                <div key={project.id} className="space-y-2 rounded-xl border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Project ID: {project.id} | Client: {project.clientName}
                    </p>
                  </div>
                
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, BriefcaseBusiness, FolderKanban, Users } from 'lucide-react';
import axiosInstance from '@/app/lib/axiosinstance';
import { mockProjects } from '@/app/lib/mock-data';
import { TeamMember } from '@/types';

type ApiUser = {
  id?: string;
  userId?: string;
  userID?: string;
  userid?: string;
  name?: string;
  email?: string;
  region?: string;
  isActive?: boolean;
  roleName?: string;
  createdAt?: string;
};

const getDesignation = (member: TeamMember) => {
  if (member.roleName) return member.roleName;
  if (member.role === 'agent_x') return 'Business Analyst';
  if (member.role === 'agent_y') return 'CAD Engineer';
  if (member.role === 'architect') return 'Architect Lead';
  if (member.role === 'admin') return 'Operations Manager';
  return 'Team Member';
};

const getRegionLabel = (region: TeamMember['region']) =>
  region === 'uk' ? 'United Kingdom (UK)' : 'India (IN)';

const getTeamLabel = (team: TeamMember['team']) =>
  team === 'london' ? 'London Team' : 'India Team';

const normalizeRegion = (
  region: string | undefined,
  fallback: TeamMember['region'],
) => {
  if (region === 'uk') return 'uk';
  if (region === 'in') return 'in';
  return fallback;
};

const resolveRole = (
  roleName: string | undefined,
  region: TeamMember['region'],
): TeamMember['role'] => {
  const normalized = (roleName ?? '').toLowerCase();
  if (normalized.includes('architect')) return 'architect';
  if (normalized.includes('admin')) return 'admin';
  return region === 'uk' ? 'agent_x' : 'agent_y';
};

const mapUserToMember = (user: ApiUser, fallbackRegion: TeamMember['region']): TeamMember => {
  const region = normalizeRegion(user.region, fallbackRegion);
  const resolvedUserId = user.userId || user.userID || user.userid || user.id;
  const createdDate = user.createdAt
    ? user.createdAt.split('T')[0]
    : new Date().toISOString().split('T')[0];
  const agentCodeSource = resolvedUserId || user.id || 'AGT-000';

  return {
    id: user.id || agentCodeSource,
    userId: resolvedUserId,
    name: user.name || 'Unnamed',
    email: user.email || '',
    roleId: '',
    roleName: user.roleName,
    role: resolveRole(user.roleName, region),
    team: region === 'uk' ? 'london' : 'india',
    region,
    agentCode: `AGT-${agentCodeSource}`,
    isActive: user.isActive ?? true,
    defaultPassword: false,
    resetPasswordStatus: 'none',
    assignedProjects: 0,
    joinedDate: createdDate,
    createdDate,
  };
};

export default function TeamMemberDetailPage() {
  const params = useParams<{ memberId: string }>();
  const memberId = params?.memberId ?? '';
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadMember = async () => {
      if (!memberId) {
        if (isMounted) {
          setMember(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setLoadError('');
        const response = await axiosInstance.get('/employee/users');
        const payload = response?.data?.data ?? response?.data ?? [];
        const users = Array.isArray(payload) ? payload : [];
        const matched = users.find((user: ApiUser) => {
          const uid = user.userId || user.userID || user.userid;
          return user.id === memberId || uid === memberId;
        });

        if (isMounted) {
          setMember(matched ? mapUserToMember(matched, 'uk') : null);
        }
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } }; message?: string })
            ?.response?.data?.message ||
          (error as { message?: string })?.message ||
          'Failed to load team member.';
        if (isMounted) {
          setLoadError(message);
          setMember(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadMember();
    return () => {
      isMounted = false;
    };
  }, [memberId]);

  const assignedProjects = useMemo(() => {
    if (!member) return [];
    return mockProjects.filter(
      (project) =>
        project.agentX === member.name ||
        project.agentY === member.name ||
        project.architect === member.name,
    );
  }, [member]);

  const customersHandled = useMemo(
    () => Array.from(new Set(assignedProjects.map((project) => project.clientName))),
    [assignedProjects],
  );

  const isLead = member?.role === 'architect' || member?.role === 'admin';

  if (loading) {
    return (
      <div className="space-y-4 px-1 pb-2 sm:px-0">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading team member...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4 px-1 pb-2 sm:px-0">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="space-y-4 px-1 pb-2 sm:px-0">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Team member not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-1 pb-2 sm:px-0">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold text-slate-900">{member.name}</h1>
            <p className="mt-1 break-words text-sm text-slate-600">
              {getDesignation(member)} | {getTeamLabel(member.team)}
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {member.agentCode}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Email</p>
            <p className="mt-1 break-all text-sm font-semibold text-slate-900">{member.email}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Region</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {getRegionLabel(member.region)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Team</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{getTeamLabel(member.team)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Leadership</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {isLead ? 'Team Lead / Manager' : 'Individual Contributor'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold text-slate-900">Managed Team Members</p>
        </div>
        <p className="text-sm text-slate-600">
          Detailed direct-report data is not available in this endpoint yet.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
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

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
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
                    <p className="mt-1 break-words text-xs text-slate-600">
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


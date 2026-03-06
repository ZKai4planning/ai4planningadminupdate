'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Eye, EyeOff, Mail, Plus, Search, Users } from 'lucide-react';
import DataTable, { Column } from '@/components/datatable';
import { TeamMember } from '@/types';
import axiosInstance from '@/app/lib/axiosinstance';

const regionOptions = [
  { value: 'uk', label: 'United Kingdom (UK)' },
  { value: 'in', label: 'India (IN)' },
];

const ukSubTeamOptions = [
  { value: 'all', label: 'All Members' },
  { value: 'business-analyst', label: 'Business Analyst' },
  { value: 'architect', label: 'Architect' },
  { value: 'operations-admin', label: 'Operations/Admin' },
];

const indiaSubTeamOptions = [
  { value: 'all', label: 'All Members' },
  { value: 'cad-engineer', label: 'CAD Engineer' },
  { value: 'architect', label: 'Architect' },
  { value: 'operations-admin', label: 'Operations/Admin' },
];

const getSubTeamKey = (member: TeamMember) => {
  if (member.region === 'uk') {
    if (member.role === 'agent_x') return 'business-analyst';
    if (member.role === 'architect') return 'architect';
    return 'operations-admin';
  }
  if (member.role === 'agent_y') return 'cad-engineer';
  if (member.role === 'architect') return 'architect';
  return 'operations-admin';
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

type TeamFormData = {
  name: string;
  email: string;
  region: 'uk' | 'in';
  roleId: string;
};

type RoleOption = {
  _id?: string;
  roleId: string;
  roleName: string;
  status?: number;
};

type ApiUser = {
  id?: string;
  name?: string;
  email?: string;
  region?: string;
  isActive?: boolean;
  roleId?: string;
  roleName?: string;
  userId?: string;
  createdAt?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const resolveDefaultRoleId = (roles: RoleOption[]) => {
  const employeesRole = roles.find(
    (role) => role.roleName?.toLowerCase() === 'employees',
  );
  return employeesRole?.roleId ?? roles[0]?.roleId ?? '';
};

const resolveRole = (
  roleName: string | undefined,
  region: TeamMember['region'],
) => {
  const normalized = (roleName ?? '').toLowerCase();
  if (normalized.includes('architect')) return 'architect';
  if (normalized.includes('admin')) return 'admin';
  return region === 'uk' ? 'agent_x' : 'agent_y';
};

const normalizeRegion = (
  region: string | undefined,
  fallback: TeamMember['region'],
) => {
  if (region === 'uk') return 'uk';
  if (region === 'in') return 'in';
  return fallback;
};

const mapUserToMember = (
  user: ApiUser,
  fallbackRegion: TeamMember['region'],
): TeamMember => {
  const region = normalizeRegion(user.region, fallbackRegion);
  const createdDate = user.createdAt
    ? user.createdAt.split('T')[0]
    : new Date().toISOString().split('T')[0];
  const resolvedUserId =
    user.userId ||
    (user as { userid?: string }).userid ||
    (user as { userID?: string }).userID ||
    user.id;
  const agentCodeSource = resolvedUserId || user.id || 'AGT-000';
  return {
    id: user.id || agentCodeSource,
    userId: resolvedUserId,
    name: user.name || 'Unnamed',
    email: user.email || '',
    roleId: user.roleId,
    roleName: user.roleName,
    role: resolveRole(user.roleName, region),
    team: region === 'uk' ? 'london' : 'india',
    region,
    agentCode: `AGT-${agentCodeSource}`,
    isActive: user.isActive ?? true,
    defaultPassword: false,
    assignedProjects: 0,
    joinedDate: createdDate,
    createdDate,
  };
};

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState<Record<string, boolean>>(
    {},
  );
  const [statusConfirm, setStatusConfirm] = useState<{
    member: TeamMember;
    nextActive: boolean;
  } | null>(null);
  const [activeRegionTab, setActiveRegionTab] = useState<'uk' | 'in'>('uk');
  const [ukSubTeamFilter, setUkSubTeamFilter] = useState('all');
  const [indiaSubTeamFilter, setIndiaSubTeamFilter] = useState('all');
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    email: '',
    region: 'uk',
    roleId: '',
  });
  const [revealedEmails, setRevealedEmails] = useState<Record<string, boolean>>(
    {},
  );
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const defaultRoleId = useMemo(() => resolveDefaultRoleId(roles), [roles]);

  const validateAgentForm = (name: string, email: string, roleId: string) => {
    if (!name || !email) {
      return 'Name and email are required.';
    }
    if (name.length < 3 || name.length > 50) {
      return 'Name must be between 3 and 50 characters.';
    }
    if (!EMAIL_REGEX.test(email)) {
      return 'Enter a valid email address.';
    }
    if (!roleId) {
      return 'Role is required.';
    }
    return '';
  };

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      try {
        setRolesLoading(true);
        setRolesError('');
        const response = await axiosInstance.get('/roles');
        const payload =
          response?.data?.roles ??
          response?.data?.data?.roles ??
          response?.data?.data ??
          response?.data ??
          [];
        const rolesPayload = Array.isArray(payload) ? payload : [];
        const normalized = rolesPayload
          .map((role) => ({
            _id: role?._id,
            roleId: String(role?.roleId ?? ''),
            roleName: String(role?.roleName ?? ''),
            status: role?.status,
          }))
          .filter((role) => role.roleId && role.roleName);
        if (isMounted) {
          setRoles(normalized);
        }
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } }; message?: string })
            ?.response?.data?.message ||
          (error as { message?: string })?.message ||
          'Failed to load roles.';
        if (isMounted) {
          setRolesError(message);
        }
      } finally {
        if (isMounted) {
          setRolesLoading(false);
        }
      }
    };

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!defaultRoleId) return;
    setFormData((prev) =>
      prev.roleId ? prev : { ...prev, roleId: defaultRoleId },
    );
  }, [defaultRoleId]);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const response = await axiosInstance.get('/employee/users');
        const payload = response?.data?.data ?? response?.data ?? [];
        const users = Array.isArray(payload) ? payload : [];
        if (isMounted) {
          setMembers(users.map((user) => mapUserToMember(user, 'uk')));
        }
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } }; message?: string })
            ?.response?.data?.message ||
          (error as { message?: string })?.message ||
          'Failed to load agents.';
        if (isMounted) {
          setLoadError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolveMemberUserId = (member: TeamMember) =>
    member.userId ||
    (member.agentCode?.startsWith('AGT-') ? member.agentCode.slice(4) : '') ||
    member.id;
  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const subTeamFilter =
      activeRegionTab === 'uk' ? ukSubTeamFilter : indiaSubTeamFilter;

    return members.filter((member) => {
      if (member.region !== activeRegionTab) {
        return false;
      }

      const matchesSearch =
        !term ||
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        member.agentCode.toLowerCase().includes(term);

      const matchesSubTeam =
        subTeamFilter === 'all' || getSubTeamKey(member) === subTeamFilter;

      return matchesSearch && matchesSubTeam;
    });
  }, [members, searchTerm, activeRegionTab, ukSubTeamFilter, indiaSubTeamFilter]);

  const tabCounts = useMemo(
    () => ({
      uk: members.filter((member) => member.region === 'uk').length,
      in: members.filter((member) => member.region === 'in').length,
    }),
    [members],
  );

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditAgent = (member: TeamMember) => {
    setEditingMember(member);
    setCreateError('');
    setFormData({
      name: member.name,
      email: member.email,
      region: member.region,
      roleId: member.roleId ?? defaultRoleId,
    });
    setShowAddModal(true);
  };

  const handleAddAgent = async () => {
    if (isCreating) return;

    const name = formData.name.trim();
    const email = formData.email.trim();
    const roleId = formData.roleId;

    const validationError = validateAgentForm(name, email, roleId);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setIsCreating(true);
    setCreateError('');
    try {
      const response = await axiosInstance.post('/employee/users', {
        name,
        email,
        roleId,
        region: formData.region,
      });

      const data = response?.data?.data ?? response?.data ?? {};
      const nextIndex = members.length + 1;
      const fallbackMember = mapUserToMember(
        {
          id: `tm${String(nextIndex).padStart(3, '0')}`,

          name,
          email,
          roleId,
          roleName: roles.find((role) => role.roleId === roleId)?.roleName,
          region: formData.region,
        },
        formData.region,
      );
      const mapped = data?.id
        ? mapUserToMember(data, formData.region)
        : fallbackMember;
      const newMember: TeamMember = {
        ...fallbackMember,
        ...mapped,
        agentCode: data?.userId
          ? `AGT-${data.userId}`
          : mapped.agentCode || fallbackMember.agentCode,
        roleId: data?.roleId || roleId || mapped.roleId || fallbackMember.roleId,
        roleName:
          data?.roleName ||
          mapped.roleName ||
          fallbackMember.roleName ||
          roles.find((role) => role.roleId === roleId)?.roleName,
        userId:
          data?.userId ||
          data?.userID ||
          data?.userid ||
          mapped.userId ||
          fallbackMember.userId,
        defaultPassword: data?.defaultPassword ?? true,
      };

      setMembers((prev) => [...prev, newMember]);
      setFormData({
        name: '',
        email: '',
        region: 'uk',
        roleId: defaultRoleId,
      });
      setShowAddModal(false);
      setEditingMember(null);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to create agent.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateAgent = async () => {
    if (isCreating || !editingMember) return;

    const name = formData.name.trim();
    const email = formData.email.trim();
    const roleId = formData.roleId;
    const userId =
      editingMember.userId ||
      (editingMember.agentCode?.startsWith('AGT-')
        ? editingMember.agentCode.slice(4)
        : '');

    const validationError = validateAgentForm(name, email, roleId);
    if (validationError) {
      setCreateError(validationError);
      return;
    }
    if (!userId) {
      setCreateError('User ID is missing for this agent.');
      return;
    }
    setIsCreating(true);
    setCreateError('');
    try {
      const response = await axiosInstance.put(
        `/employee/users/${userId}`,
        {
          name,
          email,
          roleId,
          region: formData.region,
        },
      );

      const data = response?.data?.data ?? response?.data ?? {};
      setMembers((prev) =>
        prev.map((member) => {
          if (member.id !== editingMember.id) return member;
          const updatedRegion = normalizeRegion(data?.region, formData.region);
          const updatedRole = data?.roleName
            ? resolveRole(data.roleName, updatedRegion)
            : member.role;
          const nextRoleId = data?.roleId || roleId || member.roleId;
          const nextRoleName =
            data?.roleName ||
            roles.find((role) => role.roleId === nextRoleId)?.roleName ||
            member.roleName;
          return {
            ...member,
            name: data?.name || name,
            email: data?.email || email,
            region: updatedRegion,
            team: updatedRegion === 'uk' ? 'london' : 'india',
            role: updatedRole,
            roleId: nextRoleId,
            roleName: nextRoleName,
        
            agentCode: data?.userId ? `AGT-${data.userId}` : member.agentCode,
            userId:
              data?.userId ||
              data?.userID ||
              data?.userid ||
              member.userId ||
              member.id,
            isActive: data?.isActive ?? member.isActive,
            createdDate: data?.createdAt
              ? String(data.createdAt).split('T')[0]
              : member.createdDate,
            joinedDate: data?.createdAt
              ? String(data.createdAt).split('T')[0]
              : member.joinedDate,
          };
        }),
      );

      setFormData({
        name: '',
        email: '',
        region: 'uk',
        roleId: defaultRoleId,
      });
      setShowAddModal(false);
      setEditingMember(null);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to update agent.';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleDefaultPassword = (id: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? { ...member, defaultPassword: !member.defaultPassword }
          : member,
      ),
    );
  };

  const requestStatusChange = (member: TeamMember) => {
    const userId = resolveMemberUserId(member);
    if (!userId) {
      setStatusError('User ID is missing for this agent.');
      return;
    }
    setStatusConfirm({ member, nextActive: !member.isActive });
  };

  const applyStatusChange = async (member: TeamMember, nextActive: boolean) => {
    if (statusUpdating[member.id]) return;

    const userId = resolveMemberUserId(member);
    if (!userId) {
      setStatusError('User ID is missing for this agent.');
      return;
    }

    setStatusError('');
    setStatusUpdating((prev) => ({ ...prev, [member.id]: true }));
    setMembers((prev) =>
      prev.map((item) =>
        item.id === member.id ? { ...item, isActive: nextActive } : item,
      ),
    );

    try {
      const response = await axiosInstance.patch(
        `/employee/users/${userId}/status`,
        { isActive: nextActive },
      );

      const data = response?.data?.data ?? response?.data ?? {};
      setMembers((prev) =>
        prev.map((item) => {
          if (item.id !== member.id) return item;
          return {
            ...item,
            isActive: data?.isActive ?? nextActive,
            userId:
              data?.userId ||
              data?.userID ||
              data?.userid ||
              item.userId ||
              item.id,
            agentCode: data?.userId ? `AGT-${data.userId}` : item.agentCode,
          };
        }),
      );
    } catch (error) {
      setMembers((prev) =>
        prev.map((item) =>
          item.id === member.id ? { ...item, isActive: member.isActive } : item,
        ),
      );
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to update status.';
      setStatusError(message);
    } finally {
      setStatusUpdating((prev) => {
        const next = { ...prev };
        delete next[member.id];
        return next;
      });
    }
  };

  const handleConfirmStatusChange = () => {
    if (!statusConfirm) return;
    const { member, nextActive } = statusConfirm;
    setStatusConfirm(null);
    applyStatusChange(member, nextActive);
  };

  const handleCancelStatusChange = () => {
    setStatusConfirm(null);
  };

  const toggleEmailReveal = (id: string) => {
    setRevealedEmails((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? false),
    }));
  };

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((member) => member.isActive).length;
    const inactive = total - active;
    const uk = members.filter((member) => member.region === 'uk').length;
    const india = members.filter((member) => member.region === 'in').length;
    return { total, active, inactive, uk, india };
  }, [members]);

  const columns: Column<TeamMember>[] = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_v, _row, index, startIndex) => (
        <span className="font-semibold">{startIndex + index + 1}</span>
      ),
      sticky: true,
      left: 0,
    },
    {
      key: 'agentCode',
      label: 'Agent Code',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <Link
          href={`/admin/team/${row.id}`}
          className="font-semibold text-blue-700 hover:underline"
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'role',
      label: 'Designation',
      sortable: true,
      render: (_value, row) => (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          {getDesignation(row)}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-500" />
          <span className="text-slate-700">
            {(revealedEmails[row.id] ?? false) ? value : '••••••••••'}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleEmailReveal(row.id);
            }}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Toggle email visibility"
          >
            {(revealedEmails[row.id] ?? false) ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>
        </div>
      ),
    },
   
   
    {
      key: 'defaultPassword',
      label: 'Default Password',
      render: (_v, row) => (
        <button
          onClick={() => toggleDefaultPassword(row.id)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            row.defaultPassword
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-slate-100 text-slate-600'
          }`}
        >
          {row.defaultPassword ? 'Yes' : 'No'}
        </button>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (_v, row) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => requestStatusChange(row)}
            disabled={statusUpdating[row.id]}
            aria-busy={statusUpdating[row.id]}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-opacity ${
              row.isActive ? 'bg-emerald-500' : 'bg-slate-300'
            } ${statusUpdating[row.id] ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                row.isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-xs font-semibold">
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      key: 'createdDate',
      label: 'Created Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('en-GB'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_v, row) => (
        <button
          type="button"
          onClick={() => handleEditAgent(row)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team</h1>
          <p className="mt-2 text-slate-600">Manage agents across regions.</p>
        </div>
        <button
          onClick={() => {
            setEditingMember(null);
            setCreateError('');
            setFormData({
              name: '',
              email: '',
              region: 'uk',
              roleId: defaultRoleId,
            });
            setShowAddModal(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 md:w-auto"
        >
          <Plus size={20} />
          Add Agent
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Total Agents
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Active</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Inactive</p>
          <p className="text-2xl font-bold text-slate-700">{stats.inactive}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">
            United Kingdom
          </p>
          <p className="text-2xl font-bold text-slate-900">{stats.uk}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">India</p>
          <p className="text-2xl font-bold text-slate-900">{stats.india}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveRegionTab('uk')}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              activeRegionTab === 'uk'
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            UK Team ({tabCounts.uk})
          </button>
          <button
            type="button"
            onClick={() => setActiveRegionTab('in')}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              activeRegionTab === 'in'
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            India Team ({tabCounts.in})
          </button>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, email, code..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={activeRegionTab === 'uk' ? ukSubTeamFilter : indiaSubTeamFilter}
            onChange={(e) => {
              if (activeRegionTab === 'uk') {
                setUkSubTeamFilter(e.target.value);
              } else {
                setIndiaSubTeamFilter(e.target.value);
              }
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:w-72"
          >
            {(activeRegionTab === 'uk'
              ? ukSubTeamOptions
              : indiaSubTeamOptions
            ).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {(loadError || statusError) && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError || statusError}
          </div>
        )}
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Loading agents...
          </div>
        )}
        {filteredMembers.map((member) => (
          <article
            key={member.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={`/admin/team/${member.id}`}
                  className="text-base font-semibold text-blue-700 hover:underline"
                >
                  {member.name}
                </Link>
                <p className="mt-1 text-xs text-slate-500">{member.agentCode}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => requestStatusChange(member)}
                  disabled={statusUpdating[member.id]}
                  aria-busy={statusUpdating[member.id]}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-opacity ${
                    member.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                  } ${
                    statusUpdating[member.id]
                      ? 'opacity-60 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      member.isActive ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    member.isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {member.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <p className="text-sm text-slate-700">
                {(revealedEmails[member.id] ?? false) ? member.email : '••••••••••'}
              </p>
              <button
                type="button"
                onClick={() => toggleEmailReveal(member.id)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Toggle email visibility"
              >
                {(revealedEmails[member.id] ?? false) ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {getDesignation(member)}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {getTeamLabel(member.team)}
              </span>
              <button
                type="button"
                onClick={() => handleEditAgent(member)}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"
              >
                Edit
              </button>
            </div>
          </article>
        ))}
        {!isLoading && filteredMembers.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            No team members found for this filter.
          </div>
        )}
      </div>

      <div className="hidden md:block">
        {(loadError || statusError) && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError || statusError}
          </div>
        )}
        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Loading agents...
          </div>
        ) : (
        <DataTable data={filteredMembers} columns={columns} />
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl md:p-8">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              {editingMember ? 'Edit Agent' : 'Add Agent'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Alex Morgan"
                  minLength={3}
                  maxLength={50}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Enter min 3 to max 50 characters.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g., alex@company.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Region
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {regionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Role
                </label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  disabled={rolesLoading}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {rolesLoading && <option value="">Loading roles...</option>}
                  {!rolesLoading && roles.length === 0 && (
                    <option value="">No roles available</option>
                  )}
                  {!rolesLoading &&
                    roles.map((role) => (
                      <option key={role.roleId} value={role.roleId}>
                        {role.roleName}
                      </option>
                    ))}
                </select>
                {rolesError && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {rolesError}
                  </p>
                )}
              </div>
            </div>

            {createError && (
              <p className="mt-3 text-sm font-medium text-red-600">{createError}</p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={editingMember ? handleUpdateAgent : handleAddAgent}
                disabled={isCreating}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-70"
              >
                <Plus size={18} />
                {editingMember
                  ? isCreating
                    ? 'Saving...'
                    : 'Save Changes'
                  : isCreating
                    ? 'Adding...'
                    : 'Add Agent'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMember(null);
                  setCreateError('');
                }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-900 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {statusConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900">
              Confirm Status Change
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Are you sure you want to{' '}
              <span className="font-semibold">
                {statusConfirm.nextActive ? 'activate' : 'deactivate'}
              </span>{' '}
              {statusConfirm.member.name}?
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleConfirmStatusChange}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={handleCancelStatusChange}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-900 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

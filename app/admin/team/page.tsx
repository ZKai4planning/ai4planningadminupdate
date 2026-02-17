'use client';

import Link from 'next/link';
import { useMemo, useState, type ChangeEvent } from 'react';
import { Eye, EyeOff, Mail, Plus, Search, Users } from 'lucide-react';
import { mockTeamMembers } from '@/app/lib/mock-data';
import DataTable, { Column } from '@/components/datatable';
import { TeamMember } from '@/types';

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
};

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [activeRegionTab, setActiveRegionTab] = useState<'uk' | 'in'>('uk');
  const [ukSubTeamFilter, setUkSubTeamFilter] = useState('all');
  const [indiaSubTeamFilter, setIndiaSubTeamFilter] = useState('all');
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    email: '',
    region: 'uk',
  });
  const [revealedEmails, setRevealedEmails] = useState<Record<string, boolean>>(
    {},
  );

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

  const handleAddAgent = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      return;
    }

    const nextIndex = members.length + 1;
    const createdDate = new Date().toISOString().split('T')[0];
    const newMember: TeamMember = {
      id: `tm${String(nextIndex).padStart(3, '0')}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.region === 'uk' ? 'agent_x' : 'agent_y',
      team: formData.region === 'uk' ? 'london' : 'india',
      region: formData.region,
      agentCode: `AGT-${String(nextIndex).padStart(3, '0')}`,
      isActive: true,
      defaultPassword: true,
      assignedProjects: 0,
      joinedDate: createdDate,
      createdDate,
    };

    setMembers((prev) => [...prev, newMember]);
    setFormData({ name: '', email: '', region: 'uk' });
    setShowAddModal(false);
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

  const toggleActiveStatus = (id: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, isActive: !member.isActive } : member,
      ),
    );
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
            onClick={() => toggleActiveStatus(row.id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              row.isActive ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
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
      label: 'Profile',
      render: (_v, row) => (
        <Link
          href={`/admin/team/${row.id}`}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          View
        </Link>
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
          onClick={() => setShowAddModal(true)}
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
            </div>
          </article>
        ))}
        {filteredMembers.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            No team members found for this filter.
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <DataTable data={filteredMembers} columns={columns} />
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl md:p-8">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Add Agent</h2>

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
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAddAgent}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Agent
              </button>
              <button
                onClick={() => setShowAddModal(false)}
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

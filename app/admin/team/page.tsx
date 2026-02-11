'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { mockTeamMembers } from '@/app/lib/mock-data';
import DataTable, { Column } from "@/components/datatable"
import { TeamMember } from '@/types';


const regionOptions = [
  { value: 'uk', label: 'United Kingdom (UK)' },
  { value: 'in', label: 'India (IN)' },
];

type TeamFormData = {
  name: string;
  email: string;
  region: 'uk' | 'in';
};

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    email: '',
    region: 'uk',
  });

  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return members;
    }
    return members.filter((member) =>
      member.name.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      member.agentCode.toLowerCase().includes(term)
    );
  }, [members, searchTerm]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      role: 'agent_x',
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
        member.id === id ? { ...member, defaultPassword: !member.defaultPassword } : member
      )
    );
  };

  const toggleActiveStatus = (id: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? { ...member, isActive: !member.isActive, status: member.isActive ? 'inactive' : 'active' }
          : member
      )
    );
  };

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.isActive).length;
    const inactive = total - active;
    const uk = members.filter((m) => m.region === 'uk').length;
    const india = members.filter((m) => m.region === 'in').length;
    return { total, active, inactive, uk, india };
  }, [members]);


  
 const columns: Column<TeamMember>[] = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_v, _row, index, startIndex) => (
        <span className="font-semibold">
          {startIndex + index + 1}
        </span>
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
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'region',
      label: 'Region',
      sortable: true,
      render: (value) =>
        value === 'uk' ? 'United Kingdom (UK)' : 'India (IN)',
    },
    {
      key: 'defaultPassword',
      label: 'Default Password',
      render: (_v, row) => (
        <button
          onClick={() => toggleDefaultPassword(row.id)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            row.defaultPassword
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
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
              className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
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
      render: (value) =>
        new Date(value).toLocaleDateString('en-GB'),
    },
  ];



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team</h1>
          <p className="text-slate-600 mt-2">Manage agents across regions.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Agent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Agents</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Active</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Inactive</p>
          <p className="text-2xl font-bold text-slate-700">{stats.inactive}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">United Kingdom</p>
          <p className="text-2xl font-bold text-slate-900">{stats.uk}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">India</p>
          <p className="text-2xl font-bold text-slate-900">{stats.india}</p>
        </div>
      </div>

   


      <DataTable data={filteredMembers} columns={columns} />

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add Agent</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Alex Morgan"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g., alex@company.com"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Region</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {regionOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleAddAgent}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={18} />
                Add Agent
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-900"
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

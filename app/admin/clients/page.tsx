'use client';

import { useMemo, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { Eye, EyeOff, Mail, Phone, Users } from 'lucide-react';
import { mockClients, mockProjects } from '@/app/lib/mock-data';
import DataTable from '@/components/datatable';
import { useRouter } from 'next/navigation';

type ClientRow = (typeof mockClients)[0] & {
  isActive: boolean;
  projectId: string;
};

export default function ClientsPage() {
  const router = useRouter();
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [revealedFields, setRevealedFields] = useState<Record<string, { email: boolean; phone: boolean }>>({});
  const [clients, setClients] = useState<ClientRow[]>(
    mockClients.map((client) => {
      const project = mockProjects.find((p) => p.clientId === client.id);
      return {
        ...client,
        isActive: client.status !== 'rejected',
        projectId: project ? project.id : '-',
      };
    })
  );
  const filteredClients = useMemo(() => clients, [clients]);

  const getClientProjects = (clientId: string) => {
    return mockProjects.filter(p => p.clientId === clientId);
  };

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.isActive).length;
    const inactiveClients = totalClients - activeClients;
    const totalProjects = mockProjects.length;
    return { totalClients, activeClients, inactiveClients, totalProjects };
  }, [clients]);

  const toggleReveal = (id: string, field: 'email' | 'phone') => {
    setRevealedFields((prev) => ({
      ...prev,
      [id]: {
        email: prev[id]?.email ?? false,
        phone: prev[id]?.phone ?? false,
        [field]: !(prev[id]?.[field] ?? false),
      },
    }));
  };

  const toggleClientStatus = (id: string) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, isActive: !client.isActive } : client
      )
    );
  };

  const getClientProject = (clientId: string) =>
    mockProjects.find((project) => project.clientId === clientId);

  const handleViewProject = (clientId: string) => {
    const project = getClientProject(clientId);
    if (project) {
      router.push(`/admin/projects?projectId=${project.id}`);
      return;
    }
    router.push(`/admin/clients/${clientId}`);
  };

  const handleFollowUp = (clientId: string) => {
    router.push(`/admin/clients/${clientId}/follow-up`);
  };

  const lastClientId = clients[clients.length - 1]?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-600 mt-2">Manage client accounts and track their applications.</p>
        </div>
       
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Clients</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalClients}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Active</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.activeClients}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Inactive</p>
          <p className="text-2xl font-bold text-slate-700">{stats.inactiveClients}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Projects</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalProjects}</p>
        </div>
      </div>

      {/* Clients Table */}
      <div>
        <DataTable
          data={filteredClients}
          columns={[
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
              key: 'id',
              label: 'Client ID',
              sortable: true,
              render: (value) => (
                <span className="font-medium text-slate-900">{value}</span>
              ),
            },
            {
              key: 'projectId',
              label: 'Project ID',
              sortable: true,
              render: (_value, row) => {
                const project = getClientProject(row.id);
                return (
                  <span className="text-slate-700">
                    {project ? project.id : '-'}
                  </span>
                );
              },
            },
            {
              key: 'name',
              label: 'Name',
              sortable: true,
              render: (value, row) => (
                <div>
                  <p className="font-semibold text-slate-900">{value}</p>
                
                </div>
              ),
            },
            {
              key: 'email',
              label: 'Email',
              sortable: true,
              render: (value, row) => (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <span className="text-slate-700">
                    {(revealedFields[row.id]?.email ?? false) ? value : '••••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReveal(row.id, 'email');
                    }}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Toggle email visibility"
                  >
                    {(revealedFields[row.id]?.email ?? false) ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              ),
            },
            {
              key: 'phone',
              label: 'Phone',
              sortable: true,
              render: (value, row) => (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span className="text-slate-700">
                    {(revealedFields[row.id]?.phone ?? false) ? value : '••••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReveal(row.id, 'phone');
                    }}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Toggle phone visibility"
                  >
                    {(revealedFields[row.id]?.phone ?? false) ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              ),
            },
            {
              key: 'serviceType',
              label: 'Service',
              sortable: true,
              render: (value) => (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold capitalize">
                  {value}
                </span>
              ),
            },
            {
              key: 'isActive',
              label: 'Status',
              sortable: true,
              render: (_value, row) => (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleClientStatus(row.id);
                    }}
                    aria-pressed={row.isActive}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      row.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        row.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-semibold ${row.isActive ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ),
            },
            {
              key: 'actions',
              label: 'View Details',
              render: (_value, row) => {
                const project = getClientProject(row.id);
                const isLastRow = row.id === lastClientId;
                return (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLastRow) {
                        handleFollowUp(row.id);
                        return;
                      }
                      handleViewProject(row.id);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-colors ${
                      isLastRow
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isLastRow ? 'Follow Up' : project ? 'View Project' : 'View Details'}
                  </button>
                );
              },
            },
            {
              key: 'joinedDate',
              label: 'Joined',
              sortable: true,
              render: (value) => new Date(value).toLocaleDateString('en-GB'),
            },
          ]}
        />
      </div>

      {/* Selected Client Details */}
      {selectedClient && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedClient.name}</h2>
              <p className="text-slate-600 mt-1">Client ID: {selectedClient.id}</p>
            </div>
            <button
              onClick={() => setSelectedClient(null)}
              className="text-slate-600 hover:text-slate-900 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Client Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-200">
            <div>
              <p className="text-sm text-slate-600 font-medium">Email</p>
              <a href={`mailto:${selectedClient.email}`} className="text-blue-600 hover:text-blue-700 mt-1">
                {selectedClient.email}
              </a>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Phone</p>
              <a href={`tel:${selectedClient.phone}`} className="text-blue-600 hover:text-blue-700 mt-1">
                {selectedClient.phone}
              </a>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Address</p>
              <p className="font-semibold text-slate-900 mt-1">
                {selectedClient.address}, {selectedClient.postcode}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Service Type</p>
              <p className="font-semibold text-slate-900 mt-1 capitalize">{selectedClient.serviceType}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Package</p>
              <p className="font-semibold text-slate-900 mt-1 capitalize">{selectedClient.package}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Joined Date</p>
              <p className="font-semibold text-slate-900 mt-1">
                {new Date(selectedClient.joinedDate).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          {/* Client Projects */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Projects ({getClientProjects(selectedClient.id).length})
            </h3>
            {getClientProjects(selectedClient.id).length === 0 ? (
              <p className="text-slate-500">No projects for this client yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getClientProjects(selectedClient.id).map((project) => (
                  <div key={project.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-900">{project.title}</h4>
                      <StatusBadge status={project.status} type="project" />
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{project.location}</p>
                    <p className="text-xs text-slate-500">Created: {new Date(project.createdDate).toLocaleDateString('en-GB')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

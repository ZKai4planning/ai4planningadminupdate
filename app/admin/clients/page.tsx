// 'use client';

// import { useMemo, useState } from 'react';
// import StatusBadge from '@/components/StatusBadge';
// import { Eye, EyeOff, Mail, Phone, Users } from 'lucide-react';
// import { mockClients, mockProjects } from '@/app/lib/mock-data';
// import DataTable from '@/components/datatable';
// import { useRouter } from 'next/navigation';

// type ClientRow = (typeof mockClients)[0] & {
//   isActive: boolean;
//   projectId: string;
// };

// export default function ClientsPage() {
//   const router = useRouter();
//   const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
//   const [savedView, setSavedView] = useState<'all' | 'active' | 'inactive' | 'pending-payment'>('all');
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);
//   const [revealedFields, setRevealedFields] = useState<Record<string, { email: boolean; phone: boolean }>>({});
//   const [clients, setClients] = useState<ClientRow[]>(
//     mockClients.map((client) => {
//       const project = mockProjects.find((p) => p.clientId === client.id);
//       return {
//         ...client,
//         isActive: client.status !== 'rejected',
//         projectId: project ? project.id : '-',
//       };
//     })
//   );
//   const filteredClients = useMemo(() => {
//     if (savedView === 'active') return clients.filter((client) => client.isActive);
//     if (savedView === 'inactive') return clients.filter((client) => !client.isActive);
//     if (savedView === 'pending-payment') return clients.filter((client) => client.paymentStatus === 'pending');
//     return clients;
//   }, [clients, savedView]);

//   const getClientProjects = (clientId: string) => {
//     return mockProjects.filter(p => p.clientId === clientId);
//   };

//   const stats = useMemo(() => {
//     const totalClients = clients.length;
//     const activeClients = clients.filter((c) => c.isActive).length;
//     const inactiveClients = totalClients - activeClients;
//     const totalProjects = mockProjects.length;
//     return { totalClients, activeClients, inactiveClients, totalProjects };
//   }, [clients]);

//   const toggleReveal = (id: string, field: 'email' | 'phone') => {
//     setRevealedFields((prev) => ({
//       ...prev,
//       [id]: {
//         email: prev[id]?.email ?? false,
//         phone: prev[id]?.phone ?? false,
//         [field]: !(prev[id]?.[field] ?? false),
//       },
//     }));
//   };

//   const toggleClientStatus = (id: string) => {
//     setClients((prev) =>
//       prev.map((client) =>
//         client.id === id ? { ...client, isActive: !client.isActive } : client
//       )
//     );
//   };

//   const toggleSelection = (id: string) => {
//     setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
//   };

//   const toggleSelectAllFiltered = () => {
//     const filteredIds = filteredClients.map((client) => client.id);
//     const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));
//     if (allSelected) {
//       setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
//       return;
//     }
//     setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
//   };

//   const applyBulkStatus = (isActive: boolean) => {
//     if (selectedIds.length === 0) return;
//     setClients((prev) =>
//       prev.map((client) => (selectedIds.includes(client.id) ? { ...client, isActive } : client))
//     );
//   };

//   const getClientProject = (clientId: string) =>
//     mockProjects.find((project) => project.clientId === clientId);

//   const handleViewProject = (clientId: string) => {
//     const project = getClientProject(clientId);
//     if (project) {
//       router.push(`/admin/projects?projectId=${project.id}`);
//       return;
//     }
//     router.push(`/admin/clients/${clientId}`);
//   };

//   const handleFollowUp = (clientId: string) => {
//     router.push(`/admin/clients/${clientId}/follow-up`);
//   };

//   const lastClientId = clients[clients.length - 1]?.id;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
//           <p className="text-slate-600 mt-2">Manage client accounts and track their applications.</p>
//         </div>
       
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
//               <Users className="w-5 h-5 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-xs font-semibold text-slate-500 uppercase">Total Clients</p>
//               <p className="text-2xl font-bold text-slate-900">{stats.totalClients}</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
//           <p className="text-xs font-semibold text-slate-500 uppercase">Active</p>
//           <p className="text-2xl font-bold text-emerald-600">{stats.activeClients}</p>
//         </div>
//         <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
//           <p className="text-xs font-semibold text-slate-500 uppercase">Inactive</p>
//           <p className="text-2xl font-bold text-slate-700">{stats.inactiveClients}</p>
//         </div>
//         <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
//           <p className="text-xs font-semibold text-slate-500 uppercase">Projects</p>
//           <p className="text-2xl font-bold text-slate-900">{stats.totalProjects}</p>
//         </div>
//       </div>

//       <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
//         <div className="flex flex-wrap items-center gap-2">
//           <span className="text-xs font-semibold uppercase text-slate-500">Saved Views</span>
//           {[
//             { id: 'all', label: 'All' },
//             { id: 'active', label: 'Active' },
//             { id: 'inactive', label: 'Inactive' },
//             { id: 'pending-payment', label: 'Pending Payment' },
//           ].map((view) => (
//             <button
//               key={view.id}
//               type="button"
//               onClick={() => setSavedView(view.id as typeof savedView)}
//               className={`px-3 py-1.5 rounded-lg text-xs ${
//                 savedView === view.id
//                   ? 'bg-blue-100 text-blue-700 font-semibold'
//                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//               }`}
//             >
//               {view.label}
//             </button>
//           ))}
//         </div>
//         <div className="flex flex-wrap items-center gap-2">
//           <button
//             type="button"
//             onClick={toggleSelectAllFiltered}
//             className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
//           >
//             {filteredClients.length > 0 && filteredClients.every((client) => selectedIds.includes(client.id))
//               ? 'Clear Filtered Selection'
//               : 'Select Filtered'}
//           </button>
//           <button
//             type="button"
//             onClick={() => applyBulkStatus(true)}
//             disabled={selectedIds.length === 0}
//             className="px-3 py-1.5 rounded-lg text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
//           >
//             Bulk Activate ({selectedIds.length})
//           </button>
//           <button
//             type="button"
//             onClick={() => applyBulkStatus(false)}
//             disabled={selectedIds.length === 0}
//             className="px-3 py-1.5 rounded-lg text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50"
//           >
//             Bulk Deactivate ({selectedIds.length})
//           </button>
//         </div>
//       </div>

//       {/* Clients Table */}
//       <div className="md:hidden space-y-3">
//         {filteredClients.map((client) => (
//           <div key={client.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
//             <div className="flex items-start justify-between gap-3">
//               <div>
//                 <p className="text-sm font-semibold text-slate-900">{client.name}</p>
//                 <p className="text-xs text-slate-500">Client ID: {client.id}</p>
//               </div>
//               <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
//                 client.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
//               }`}>
//                 {client.isActive ? 'Active' : 'Inactive'}
//               </span>
//             </div>
//             <div className="mt-3 space-y-1 text-sm text-slate-700">
//               <p>Email: {(revealedFields[client.id]?.email ?? false) ? client.email : '••••••••••'}</p>
//               <p>Phone: {(revealedFields[client.id]?.phone ?? false) ? client.phone : '••••••••••'}</p>
//               <p>Service: <span className="capitalize">{client.serviceType}</span></p>
//             </div>
//             <div className="mt-4 flex flex-wrap items-center gap-2">
//               <button
//                 type="button"
//                 onClick={() => toggleClientStatus(client.id)}
//                 className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
//                   client.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
//                 }`}
//               >
//                 {client.isActive ? 'Deactivate' : 'Activate'}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => handleViewProject(client.id)}
//                 className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
//               >
//                 View Details
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="hidden md:block">
//         <DataTable
//           data={filteredClients}
//           columns={[
//             {
//               key: 'sno',
//               label: 'S.No',
//               render: (_v, _row, index, startIndex) => (
//                 <span className="font-semibold">{startIndex + index + 1}</span>
//               ),
//               sticky: true,
//               left: 0,
//             },
//             {
//               key: 'id',
//               label: 'Client ID',
//               sortable: true,
//               render: (value, row) => (
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={selectedIds.includes(row.id)}
//                     onChange={(e) => {
//                       e.stopPropagation();
//                       toggleSelection(row.id);
//                     }}
//                     aria-label={`Select ${row.name}`}
//                   />
//                   <span className="font-medium text-slate-900">{value}</span>
//                 </div>
//               ),
//             },
//             {
//               key: 'projectId',
//               label: 'Project ID',
//               sortable: true,
//               render: (_value, row) => {
//                 const project = getClientProject(row.id);
//                 return (
//                   <span className="text-slate-700">
//                     {project ? project.id : '-'}
//                   </span>
//                 );
//               },
//             },
//             {
//               key: 'name',
//               label: 'Name',
//               sortable: true,
//               render: (value) => (
//                 <div>
//                   <p className="font-semibold text-slate-900">{value}</p>
                
//                 </div>
//               ),
//             },
//             {
//               key: 'email',
//               label: 'Email',
//               sortable: true,
//               render: (value, row) => (
//                 <div className="flex items-center gap-2">
//                   <Mail size={14} className="text-slate-400" />
//                   <span className="text-slate-700">
//                     {(revealedFields[row.id]?.email ?? false) ? value : '••••••••••'}
//                   </span>
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       toggleReveal(row.id, 'email');
//                     }}
//                     className="text-slate-400 hover:text-slate-600"
//                     aria-label="Toggle email visibility"
//                   >
//                     {(revealedFields[row.id]?.email ?? false) ? <EyeOff size={16} /> : <Eye size={16} />}
//                   </button>
//                 </div>
//               ),
//             },
//             {
//               key: 'phone',
//               label: 'Phone',
//               sortable: true,
//               render: (value, row) => (
//                 <div className="flex items-center gap-2">
//                   <Phone size={14} className="text-slate-400" />
//                   <span className="text-slate-700">
//                     {(revealedFields[row.id]?.phone ?? false) ? value : '••••••••••'}
//                   </span>
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       toggleReveal(row.id, 'phone');
//                     }}
//                     className="text-slate-400 hover:text-slate-600"
//                     aria-label="Toggle phone visibility"
//                   >
//                     {(revealedFields[row.id]?.phone ?? false) ? <EyeOff size={16} /> : <Eye size={16} />}
//                   </button>
//                 </div>
//               ),
//             },
//             {
//               key: 'serviceType',
//               label: 'Service',
//               sortable: true,
//               render: (value) => (
//                 <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold capitalize">
//                   {value}
//                 </span>
//               ),
//             },
//             {
//               key: 'isActive',
//               label: 'Status',
//               sortable: true,
//               render: (_value, row) => (
//                 <div className="flex items-center gap-3">
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       toggleClientStatus(row.id);
//                     }}
//                     aria-pressed={row.isActive}
//                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//                       row.isActive ? 'bg-emerald-500' : 'bg-slate-300'
//                     }`}
//                   >
//                     <span
//                       className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
//                         row.isActive ? 'translate-x-6' : 'translate-x-1'
//                       }`}
//                     />
//                   </button>
//                   <span className={`text-xs font-semibold ${row.isActive ? 'text-emerald-700' : 'text-slate-600'}`}>
//                     {row.isActive ? 'Active' : 'Inactive'}
//                   </span>
//                 </div>
//               ),
//             },
//             {
//               key: 'actions',
//               label: 'View Details',
//               render: (_value, row) => {
//                 const project = getClientProject(row.id);
//                 const isLastRow = row.id === lastClientId;
//                 return (
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       if (isLastRow) {
//                         handleFollowUp(row.id);
//                         return;
//                       }
//                       handleViewProject(row.id);
//                     }}
//                     className={`px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-colors ${
//                       isLastRow
//                         ? 'bg-amber-600 hover:bg-amber-700'
//                         : 'bg-blue-600 hover:bg-blue-700'
//                     }`}
//                   >
//                     {isLastRow ? 'Follow Up' : project ? 'View Project' : 'View Details'}
//                   </button>
//                 );
//               },
//             },
//             {
//               key: 'joinedDate',
//               label: 'Joined',
//               sortable: true,
//               render: (value) => new Date(value).toLocaleDateString('en-GB'),
//             },
//           ]}
//         />
//       </div>

//       {/* Selected Client Details */}
//       {selectedClient && (
//         <div className="bg-white rounded-lg border border-slate-200 p-6">
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <h2 className="text-2xl font-bold text-slate-900">{selectedClient.name}</h2>
//               <p className="text-slate-600 mt-1">Client ID: {selectedClient.id}</p>
//             </div>
//             <button
//               onClick={() => setSelectedClient(null)}
//               className="text-slate-600 hover:text-slate-900 text-2xl"
//             >
//               ×
//             </button>
//           </div>

//           {/* Client Information Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-200">
//             <div>
//               <p className="text-sm text-slate-600 font-medium">Email</p>
//               <a href={`mailto:${selectedClient.email}`} className="text-blue-600 hover:text-blue-700 mt-1">
//                 {selectedClient.email}
//               </a>
//             </div>
//             <div>
//               <p className="text-sm text-slate-600 font-medium">Phone</p>
//               <a href={`tel:${selectedClient.phone}`} className="text-blue-600 hover:text-blue-700 mt-1">
//                 {selectedClient.phone}
//               </a>
//             </div>
//             <div>
//               <p className="text-sm text-slate-600 font-medium">Address</p>
//               <p className="font-semibold text-slate-900 mt-1">
//                 {selectedClient.address}, {selectedClient.postcode}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-slate-600 font-medium">Service Type</p>
//               <p className="font-semibold text-slate-900 mt-1 capitalize">{selectedClient.serviceType}</p>
//             </div>
//             <div>
//               <p className="text-sm text-slate-600 font-medium">Package</p>
//               <p className="font-semibold text-slate-900 mt-1 capitalize">{selectedClient.package}</p>
//             </div>
//             <div>
//               <p className="text-sm text-slate-600 font-medium">Joined Date</p>
//               <p className="font-semibold text-slate-900 mt-1">
//                 {new Date(selectedClient.joinedDate).toLocaleDateString('en-GB')}
//               </p>
//             </div>
//           </div>

//           {/* Client Projects */}
//           <div>
//             <h3 className="text-lg font-semibold text-slate-900 mb-4">
//               Projects ({getClientProjects(selectedClient.id).length})
//             </h3>
//             {getClientProjects(selectedClient.id).length === 0 ? (
//               <p className="text-slate-500">No projects for this client yet.</p>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {getClientProjects(selectedClient.id).map((project) => (
//                   <div key={project.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
//                     <div className="flex justify-between items-start mb-2">
//                       <h4 className="font-semibold text-slate-900">{project.title}</h4>
//                       <StatusBadge status={project.status} type="project" />
//                     </div>
//                     <p className="text-sm text-slate-600 mb-2">{project.location}</p>
//                     <p className="text-xs text-slate-500">Created: {new Date(project.createdDate).toLocaleDateString('en-GB')}</p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


'use client';

import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { Eye, EyeOff, Mail, Phone, Users } from 'lucide-react';
import { mockProjects } from '@/app/lib/mock-data';
import DataTable from '@/components/datatable';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/app/lib/axiosinstance';

type ApiUser = {
  _id: string;
  userId: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  loginAttempts: number;
  lockUntil: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  profile?: {
    _id: string;
    profileId: string;
    userRefId: string;
    fullName: string;
    profilePicture: string;
    bio: string;
    createdAt: string;
    updatedAt: string;
  };
};

type UsersApiResponse = {
  page: number;
  limit: number;
  total: number;
  users: ApiUser[];
};

type ClientRow = {
  _id: string;
  id: string; // using userId for UI display + selection
  userId: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  joinedDate: string;
  updatedAt: string;
  lastLoginAt: string | null;
  projectId: string;
  loginAttempts: number;
  profilePicture?: string;
  bio?: string;
};

export default function ClientsPage() {
  const router = useRouter();

  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [savedView, setSavedView] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [revealedFields, setRevealedFields] = useState<Record<string, { email: boolean; phone: boolean }>>({});
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axiosInstance.get('/auth/users?page=1&limit=10'
         
    );

       
    

        const data: UsersApiResponse = await res.data;

        const mappedClients: ClientRow[] = data.users.map((user) => {
          const project = mockProjects.find((p) => p.clientId === user.userId);

          return {
            _id: user._id,
            id: user.userId,
            userId: user.userId,
            name: user.fullName || user.profile?.fullName || '-',
            email: user.email || '-',
            phone: user.phoneNumber || '-',
            isActive: user.isActive,
            joinedDate: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: user.lastLoginAt,
            projectId: project ? project.id : '-',
            loginAttempts: user.loginAttempts ?? 0,
            profilePicture: user.profile?.profilePicture || '',
            bio: user.profile?.bio || '',
          };
        });

        setClients(mappedClients);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong while fetching clients.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    if (savedView === 'active') return clients.filter((client) => client.isActive);
    if (savedView === 'inactive') return clients.filter((client) => !client.isActive);
    return clients;
  }, [clients, savedView]);

  const getClientProjects = (clientId: string) => {
    return mockProjects.filter((p) => p.clientId === clientId);
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

  const setClientStatusInState = (id: string, isActive: boolean) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, isActive } : client
      )
    );
    setSelectedClient((prev) =>
      prev && prev.id === id ? { ...prev, isActive } : prev
    );
  };

  const getStatusUpdateErrorMessage = (err: unknown) => {
    const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
    return errorObj?.response?.data?.message || errorObj?.message || 'Failed to update status.';
  };

  const updateClientStatus = async (client: ClientRow, nextActive: boolean) => {
    if (!client.userId) {
      setStatusError('User ID is missing for this client.');
      return false;
    }

    setStatusError(null);
    setStatusUpdating((prev) => ({ ...prev, [client.id]: true }));
    setClientStatusInState(client.id, nextActive);

    try {
      const response = await axiosInstance.put(`/auth/${client.userId}/status`, {
        isActive: nextActive,
      });
      const data = response?.data?.data ?? response?.data ?? {};
      const resolvedActive =
        typeof data?.isActive === 'boolean' ? data.isActive : nextActive;
      setClientStatusInState(client.id, resolvedActive);
      return true;
    } catch (err) {
      setClientStatusInState(client.id, client.isActive);
      setStatusError(getStatusUpdateErrorMessage(err));
      return false;
    } finally {
      setStatusUpdating((prev) => {
        const next = { ...prev };
        delete next[client.id];
        return next;
      });
    }
  };

  const toggleClientStatus = (id: string) => {
    const client = clients.find((item) => item.id === id);
    if (!client) return;
    void updateClientStatus(client, !client.isActive);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredClients.map((client) => client.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const applyBulkStatus = async (isActive: boolean) => {
    if (selectedIds.length === 0) return;

    const targetClients = clients.filter(
      (client) => selectedIds.includes(client.id) && client.isActive !== isActive
    );

    if (targetClients.length === 0) return;

    const failedIds: string[] = [];
    for (const client of targetClients) {
      const updated = await updateClientStatus(client, isActive);
      if (!updated) failedIds.push(client.id);
    }

    if (failedIds.length > 0) {
      setStatusError(`Failed to update ${failedIds.length} client status update(s).`);
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          Loading clients...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-600 mt-2">Manage client accounts and track their applications.</p>
        </div>
      </div>

      {statusError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {statusError}
        </div>
      )}

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

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Saved Views</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' },
          ].map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setSavedView(view.id as typeof savedView)}
              className={`px-3 py-1.5 rounded-lg text-xs ${
                savedView === view.id
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleSelectAllFiltered}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            {filteredClients.length > 0 && filteredClients.every((client) => selectedIds.includes(client.id))
              ? 'Clear Filtered Selection'
              : 'Select Filtered'}
          </button>

          <button
            type="button"
            onClick={() => void applyBulkStatus(true)}
            disabled={selectedIds.length === 0}
            className="px-3 py-1.5 rounded-lg text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
          >
            Bulk Activate ({selectedIds.length})
          </button>

          <button
            type="button"
            onClick={() => void applyBulkStatus(false)}
            disabled={selectedIds.length === 0}
            className="px-3 py-1.5 rounded-lg text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50"
          >
            Bulk Deactivate ({selectedIds.length})
          </button>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filteredClients.map((client) => (
          <div key={client.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                <p className="text-xs text-slate-500">Client ID: {client.id}</p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  client.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {client.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>Email: {(revealedFields[client.id]?.email ?? false) ? client.email : '••••••••••'}</p>
              <p>Phone: {(revealedFields[client.id]?.phone ?? false) ? client.phone : '••••••••••'}</p>
              <p>Joined: {new Date(client.joinedDate).toLocaleDateString('en-GB')}</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toggleClientStatus(client.id)}
                disabled={statusUpdating[client.id]}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  client.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {statusUpdating[client.id]
                  ? 'Updating...'
                  : client.isActive
                    ? 'Deactivate'
                    : 'Activate'}
              </button>

              <button
                type="button"
                onClick={() => handleViewProject(client.id)}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
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
              render: (value, row) => (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelection(row.id);
                    }}
                    aria-label={`Select ${row.name}`}
                  />
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
              ),
            },
            {
              key: 'projectId',
              label: 'Project ID',
              sortable: true,
              render: (_value, row) => {
                const project = getClientProject(row.id);
                return <span className="text-slate-700">{project ? project.id : '-'}</span>;
              },
            },
            {
              key: 'name',
              label: 'Name',
              sortable: true,
              render: (value) => (
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
                    disabled={statusUpdating[row.id]}
                    aria-pressed={row.isActive}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      row.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                    } ${statusUpdating[row.id] ? 'cursor-not-allowed opacity-60' : ''} ${
                      !statusUpdating[row.id] ? 'cursor-pointer' : ''
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
              <p className="text-sm text-slate-600 font-medium">Joined Date</p>
              <p className="font-semibold text-slate-900 mt-1">
                {new Date(selectedClient.joinedDate).toLocaleDateString('en-GB')}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-600 font-medium">Last Login</p>
              <p className="font-semibold text-slate-900 mt-1">
                {selectedClient.lastLoginAt
                  ? new Date(selectedClient.lastLoginAt).toLocaleDateString('en-GB')
                  : '-'}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-600 font-medium">Login Attempts</p>
              <p className="font-semibold text-slate-900 mt-1">{selectedClient.loginAttempts}</p>
            </div>

            <div>
              <p className="text-sm text-slate-600 font-medium">Status</p>
              <p className="font-semibold text-slate-900 mt-1">
                {selectedClient.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

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
                    <p className="text-xs text-slate-500">
                      Created: {new Date(project.createdDate).toLocaleDateString('en-GB')}
                    </p>
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

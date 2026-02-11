'use client';

import { useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import Table from '@/components/Table';
import { Search, Plus, Download, Eye } from 'lucide-react';
import { mockDocuments, mockProjects, mockClients } from '@/app/lib/mock-data';

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<typeof mockDocuments[0] | null>(null);

  const filteredDocs = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.clientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || doc.status === filterStatus;
    const matchesType = !filterType || doc.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const statusOptions = ['pending', 'reviewed', 'approved', 'requesting_update'];
  const typeOptions = [
    'application_form',
    'floor_plan',
    'site_plan',
    'design',
    'structural',
    'environmental',
    'other',
  ];

  const getProjectTitle = (projectId: string) => {
    return mockProjects.find(p => p.id === projectId)?.title || 'Unknown Project';
  };

  const getClientName = (clientId: string) => {
    return mockClients.find(c => c.id === clientId)?.name || 'Unknown Client';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getDocTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-600 mt-2">Manage and review project documents.</p>
        </div>
  
      </div>

      {/* Document Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 font-medium">Total Documents</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{mockDocuments.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 font-medium">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {mockDocuments.filter(d => d.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 font-medium">Approved</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {mockDocuments.filter(d => d.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 font-medium">Updates Needed</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {mockDocuments.filter(d => d.status === 'requesting_update').length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by document name or project/client ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {getDocTypeLabel(type)}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {filteredDocs.length} Document{filteredDocs.length !== 1 ? 's' : ''}
        </h2>
        <Table
          columns={[
            {
              key: 'name',
              label: 'Document Name',
              width: '20%',
              render: (value, row) => (
                <div>
                  <p className="font-semibold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-600">{getDocTypeLabel(row.type)}</p>
                </div>
              ),
            },
            {
              key: 'projectId',
              label: 'Project',
              width: '20%',
              render: (value) => (
                <div>
                  <p className="font-medium text-slate-900">{value}</p>
                  <p className="text-xs text-slate-600">{getProjectTitle(value)}</p>
                </div>
              ),
            },
            {
              key: 'clientId',
              label: 'Client',
              width: '15%',
              render: (value) => (
                <p className="text-slate-900">{getClientName(value)}</p>
              ),
            },
            {
              key: 'fileSize',
              label: 'Size',
              width: '10%',
              render: (value) => (
                <p className="text-slate-900">{formatFileSize(value)}</p>
              ),
            },
            {
              key: 'version',
              label: 'Version',
              width: '8%',
              render: (value) => (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">
                  v{value}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              width: '15%',
              render: (value) => <StatusBadge status={value} type="document" />,
            },
            {
              key: 'uploadedDate',
              label: 'Uploaded',
              width: '12%',
              render: (value) => new Date(value).toLocaleDateString('en-GB'),
            },
          ]}
          data={filteredDocs}
          onRowClick={(doc) => setSelectedDoc(doc)}
        />
      </div>

      {/* Selected Document Details */}
      {selectedDoc && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedDoc.name}</h2>
              <p className="text-slate-600 mt-1">Document ID: {selectedDoc.id}</p>
            </div>
            <button
              onClick={() => setSelectedDoc(null)}
              className="text-slate-600 hover:text-slate-900 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Document Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-200">
            <div>
              <p className="text-sm text-slate-600 font-medium">Project</p>
              <p className="font-semibold text-slate-900 mt-1">{getProjectTitle(selectedDoc.projectId)}</p>
              <p className="text-xs text-slate-600">{selectedDoc.projectId}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Client</p>
              <p className="font-semibold text-slate-900 mt-1">{getClientName(selectedDoc.clientId)}</p>
              <p className="text-xs text-slate-600">{selectedDoc.clientId}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Document Type</p>
              <p className="font-semibold text-slate-900 mt-1">{getDocTypeLabel(selectedDoc.type)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Status</p>
              <div className="mt-1">
                <StatusBadge status={selectedDoc.status} type="document" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">File Size</p>
              <p className="font-semibold text-slate-900 mt-1">{formatFileSize(selectedDoc.fileSize)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Version</p>
              <p className="font-semibold text-slate-900 mt-1">v{selectedDoc.version}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Uploaded By</p>
              <p className="font-semibold text-slate-900 mt-1">{selectedDoc.uploadedBy}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Upload Date</p>
              <p className="font-semibold text-slate-900 mt-1">
                {new Date(selectedDoc.uploadedDate).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          {/* Document Actions */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Eye size={18} />
              Preview
            </button>
            <button className="flex items-center gap-2 bg-slate-200 text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">
              <Download size={18} />
              Download
            </button>
            {selectedDoc.status === 'requesting_update' && (
              <button className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                Request Update
              </button>
            )}
            {selectedDoc.status === 'pending' && (
              <>
                <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Approve
                </button>
                <button className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Request Update
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import Table from '@/components/Table';
import { Search, Plus, FileText, AlertCircle } from 'lucide-react';
import { mockCouncilApplications, mockProjects, mockClients } from '@/app/lib/mock-data';

export default function CouncilPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<typeof mockCouncilApplications[0] | null>(null);

  const filteredApplications = mockCouncilApplications.filter((app) => {
    const matchesSearch =
      app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.councilRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.council.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    'draft',
    'submitted',
    'validated',
    'under_review',
    'approved',
    'rejected',
    'appeal_pending',
  ];

  const getProjectDetails = (projectId: string) => {
    return mockProjects.find(p => p.id === projectId);
  };

  const getApplicationStats = () => {
    return {
      total: mockCouncilApplications.length,
      submitted: mockCouncilApplications.filter(a => a.status !== 'draft').length,
      underReview: mockCouncilApplications.filter(a => a.status === 'under_review').length,
      approved: mockCouncilApplications.filter(a => a.status === 'approved').length,
      rejected: mockCouncilApplications.filter(a => a.status === 'rejected').length,
    };
  };

  const stats = getApplicationStats();
  const upcomingDeadlines = mockCouncilApplications
    .filter(a => !a.decisionDate && a.targetDecisionDate)
    .sort((a, b) => new Date(a.targetDecisionDate).getTime() - new Date(b.targetDecisionDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Council Status</h1>
          <p className="text-slate-600 mt-2">Track planning applications with local councils.</p>
        </div>
       
      </div>

      {/* Application Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 font-medium">Total Applications</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 font-medium">Submitted</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.submitted}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 font-medium">Under Review</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.underReview}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 font-medium">Approved</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 font-medium">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900">Upcoming Decision Deadlines</h3>
              <div className="mt-3 space-y-2">
                {upcomingDeadlines.map((app) => (
                  <div key={app.id} className="text-sm text-amber-800">
                    <p className="font-medium">{app.clientName} - {app.council}</p>
                    <p className="text-amber-700">
                      Decision due: {new Date(app.targetDecisionDate).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by client, council, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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

      {/* Applications Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {filteredApplications.length} Application{filteredApplications.length !== 1 ? 's' : ''}
        </h2>
        <Table
          columns={[
            {
              key: 'clientName',
              label: 'Client',
              width: '16%',
              render: (value) => (
                <p className="font-semibold text-slate-900">{value}</p>
              ),
            },
            {
              key: 'council',
              label: 'Council',
              width: '16%',
              render: (value) => (
                <p className="text-slate-900">{value}</p>
              ),
            },
            {
              key: 'councilRef',
              label: 'Reference',
              width: '14%',
              render: (value) => (
                <p className="font-medium text-blue-600">{value}</p>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              width: '14%',
              render: (value) => <StatusBadge status={value} type="council" />,
            },
            {
              key: 'applicationDate',
              label: 'Submitted',
              width: '12%',
              render: (value) => new Date(value).toLocaleDateString('en-GB'),
            },
            {
              key: 'targetDecisionDate',
              label: 'Target Decision',
              width: '14%',
              render: (value) => new Date(value).toLocaleDateString('en-GB'),
            },
            {
              key: 'decisionDate',
              label: 'Decision Date',
              width: '14%',
              render: (value) => value ? new Date(value).toLocaleDateString('en-GB') : '-',
            },
          ]}
          data={filteredApplications}
          onRowClick={(app) => setSelectedApplication(app)}
        />
      </div>

      {/* Selected Application Details */}
      {selectedApplication && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Application Details</h2>
              <p className="text-slate-600 mt-1">Reference: {selectedApplication.councilRef}</p>
            </div>
            <button
              onClick={() => setSelectedApplication(null)}
              className="text-slate-600 hover:text-slate-900 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Application Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-200">
            <div>
              <p className="text-sm text-slate-600 font-medium">Client Name</p>
              <p className="font-semibold text-slate-900 mt-1">{selectedApplication.clientName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Council</p>
              <p className="font-semibold text-slate-900 mt-1">{selectedApplication.council}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Council Reference</p>
              <p className="font-bold text-blue-600 mt-1">{selectedApplication.councilRef}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Status</p>
              <div className="mt-1">
                <StatusBadge status={selectedApplication.status} type="council" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Application Fee</p>
              <p className="font-semibold text-slate-900 mt-1">£{selectedApplication.applicationFee}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Submitted Date</p>
              <p className="font-semibold text-slate-900 mt-1">
                {new Date(selectedApplication.applicationDate).toLocaleDateString('en-GB')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Target Decision Date</p>
              <p className="font-semibold text-slate-900 mt-1">
                {new Date(selectedApplication.targetDecisionDate).toLocaleDateString('en-GB')}
              </p>
            </div>
            {selectedApplication.decisionDate && (
              <div>
                <p className="text-sm text-slate-600 font-medium">Decision Date</p>
                <p className="font-semibold text-slate-900 mt-1">
                  {new Date(selectedApplication.decisionDate).toLocaleDateString('en-GB')}
                </p>
              </div>
            )}
            {selectedApplication.decision && (
              <div>
                <p className="text-sm text-slate-600 font-medium">Decision</p>
                <p className={`font-bold mt-1 ${
                  selectedApplication.decision === 'Approved' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedApplication.decision}
                </p>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="mb-8">
            <p className="text-sm text-slate-600 font-medium mb-2">COMMENTS</p>
            <p className="text-slate-700 bg-slate-50 rounded-lg p-4">{selectedApplication.comments}</p>
          </div>

          {/* Conditions */}
          {selectedApplication.conditions && selectedApplication.conditions.length > 0 && (
            <div className="mb-8">
              <p className="text-sm text-slate-600 font-medium mb-3">CONDITIONS</p>
              <div className="space-y-2">
                {selectedApplication.conditions.map((condition, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-50 rounded-lg p-4">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700">{condition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Link */}
          {getProjectDetails(selectedApplication.projectId) && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Related Project</h3>
              {getProjectDetails(selectedApplication.projectId) && (
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <p className="font-semibold text-slate-900">
                    {getProjectDetails(selectedApplication.projectId)?.title}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {getProjectDetails(selectedApplication.projectId)?.location}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Project ID: {selectedApplication.projectId}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <FileText size={18} />
              View Documents
            </button>
            {selectedApplication.status !== 'approved' && selectedApplication.status !== 'rejected' && (
              <>
                <button className="flex items-center gap-2 bg-slate-200 text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">
                  Update Status
                </button>
                <button className="flex items-center gap-2 bg-slate-200 text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">
                  Add Comment
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import Table from '@/components/Table';
import { Search, CreditCard, Wallet, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { mockPayments, mockClients } from '@/app/lib/mock-data';

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPackage, setFilterPackage] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<typeof mockPayments[0] | null>(null);

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch =
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || payment.status === filterStatus;
    const matchesPackage = !filterPackage || payment.package === filterPackage;
    return matchesSearch && matchesStatus && matchesPackage;
  });

  const statusOptions = ['pending', 'completed', 'failed', 'refunded'];
  const packageOptions = ['basic', 'standard', 'premium'];

  const totalCompleted = mockPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = mockPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalFailed = mockPayments.filter(p => p.status === 'failed').length;
  const totalCount = mockPayments.length || 1;
  const completionRate = Math.round((mockPayments.filter(p => p.status === 'completed').length / totalCount) * 100);
  const avgPayment = Math.round(mockPayments.reduce((sum, p) => sum + p.amount, 0) / totalCount);

  const getClientEmail = (clientName: string) => {
    return mockClients.find(c => c.name === clientName)?.email || '';
  };

  const getPackagePrice = (pkg: string) => {
    const prices: Record<string, number> = {
      basic: 299,
      standard: 399,
      premium: 599,
    };
    return prices[pkg] || 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        </div>
        <p className="text-slate-600">Track and manage all client payments and invoicing.</p>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs text-slate-500">Completed</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">£{totalCompleted.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Total revenue collected</p>
          <div className="mt-3 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-slate-500">Pending</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">£{totalPending.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Awaiting settlement</p>
          <div className="mt-3 text-xs text-amber-700 font-semibold">
            {mockPayments.filter(p => p.status === 'pending').length} open payments
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-slate-500">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{completionRate}%</p>
          <p className="text-xs text-slate-500 mt-1">Completed / total payments</p>
          <div className="mt-3 text-xs text-blue-700 font-semibold">
            Avg payment £{avgPayment.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-xs text-slate-500">Failed</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{totalFailed}</p>
          <p className="text-xs text-slate-500 mt-1">Needs retry or follow-up</p>
          <div className="mt-3 text-xs text-rose-700 font-semibold">
            {totalCount} total transactions
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Package</h3>
          <div className="space-y-3">
            {packageOptions.map((pkg) => {
              const payments = mockPayments.filter(p => p.package === pkg && p.status === 'completed');
              const total = payments.reduce((sum, p) => sum + p.amount, 0);
              return (
                <div key={pkg} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-900 capitalize">{pkg}</p>
                    <p className="text-xs text-slate-600">{payments.length} payments</p>
                  </div>
                  <p className="font-bold text-slate-900">£{total.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {['card', 'bank_transfer', 'paypal'].map((method) => {
              const count = mockPayments.filter(p => p.paymentMethod === method).length;
              return (
                <div key={method} className="flex justify-between items-center">
                  <p className="font-medium text-slate-900 capitalize">{method.replace(/_/g, ' ')}</p>
                  <p className="font-bold text-slate-900">{count}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Status Distribution</h3>
          <div className="space-y-3">
            {statusOptions.map((status) => {
              const count = mockPayments.filter(p => p.status === status).length;
              const percentage = (count / mockPayments.length) * 100;
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-slate-900 capitalize">{status}</p>
                      <p className="text-sm font-semibold text-slate-900">{count}</p>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div> */}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by client name or payment ID..."
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
          <select
            value={filterPackage}
            onChange={(e) => setFilterPackage(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Packages</option>
            {packageOptions.map((pkg) => (
              <option key={pkg} value={pkg}>
                {pkg.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {filteredPayments.length} Payment{filteredPayments.length !== 1 ? 's' : ''}
        </h2>
        <Table
          columns={[
            {
              key: 'clientName',
              label: 'Client',
              width: '18%',
              render: (value) => (
                <div>
                  <p className="font-semibold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-600">{getClientEmail(value)}</p>
                </div>
              ),
            },
            {
              key: 'id',
              label: 'Transaction ID',
              width: '16%',
              render: (value) => (
                <p className="text-sm font-medium text-slate-900">{value}</p>
              ),
            },
            {
              key: 'package',
              label: 'Package',
              width: '12%',
              render: (value) => (
                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold capitalize">
                  {value}
                </span>
              ),
            },
            {
              key: 'amount',
              label: 'Amount',
              width: '12%',
              render: (value) => (
                <p className="font-bold text-slate-900">£{value}</p>
              ),
            },
            {
              key: 'paymentMethod',
              label: 'Method',
              width: '14%',
              render: (value) => (
                <p className="text-slate-900 capitalize">{value.replace(/_/g, ' ')}</p>
              ),
            },
            {
              key: 'paymentDate',
              label: 'Date',
              width: '12%',
              render: (value) => new Date(value).toLocaleDateString('en-GB'),
            },
            {
              key: 'status',
              label: 'Status',
              width: '12%',
              render: (value) => <StatusBadge status={value} type="payment" />,
            },
          ]}
          data={filteredPayments}
          onRowClick={(payment) => setSelectedPayment(payment)}
        />
      </div>

      {/* Selected Payment Details */}
      {selectedPayment && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Payment Details</h2>
              <p className="text-slate-600 mt-1">Transaction ID: {selectedPayment.id}</p>
            </div>
            <button
              onClick={() => setSelectedPayment(null)}
              className="text-slate-600 hover:text-slate-900 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 font-medium">Client Name</p>
              <p className="font-semibold text-slate-900 mt-1">{selectedPayment.clientName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Amount</p>
              <p className="font-bold text-slate-900 text-xl mt-1">£{selectedPayment.amount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Package</p>
              <p className="font-semibold text-slate-900 mt-1 capitalize">{selectedPayment.package}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Status</p>
              <div className="mt-1">
                <StatusBadge status={selectedPayment.status} type="payment" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Payment Method</p>
              <p className="font-semibold text-slate-900 mt-1 capitalize">{selectedPayment.paymentMethod.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Payment Date</p>
              <p className="font-semibold text-slate-900 mt-1">
                {new Date(selectedPayment.paymentDate).toLocaleDateString('en-GB')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Due Date</p>
              <p className="font-semibold text-slate-900 mt-1">
                {new Date(selectedPayment.dueDate).toLocaleDateString('en-GB')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Description</p>
              <p className="font-semibold text-slate-900 mt-1">{selectedPayment.description}</p>
            </div>
            {selectedPayment.projectId && (
              <div>
                <p className="text-sm text-slate-600 font-medium">Project ID</p>
                <p className="font-semibold text-slate-900 mt-1">{selectedPayment.projectId}</p>
              </div>
            )}
          </div>

          {selectedPayment.status === 'pending' && (
            <div className="mt-6 flex gap-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Mark as Completed
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Mark as Failed
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


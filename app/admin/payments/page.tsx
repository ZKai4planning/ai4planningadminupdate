'use client';

import { useMemo, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import DataTable, { Column } from '@/components/datatable';
import {
  AlertCircle,
  Clock,
  CreditCard,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { mockPayments, mockClients, mockProjects } from '@/app/lib/mock-data';

const currency = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

type ProjectBudgetRow = {
  id: string;
  projectId: string;
  projectTitle: string;
  budget: number;
  received: number;
  pending: number;
  spent: number;
  remaining: number;
  utilizationPct: number;
  isActive: boolean;
};

type PaymentTableRow = {
  id: string;
  clientName: string;
  clientEmail: string;
  package: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  transactionId: string;
  isActive: boolean;
};

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPackage, setFilterPackage] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<(typeof mockPayments)[0] | null>(null);

  const statusOptions = ['pending', 'completed', 'failed', 'refunded'];
  const packageOptions = ['basic', 'standard', 'premium'];

  const filteredPayments = useMemo(
    () =>
      mockPayments.filter((payment) => {
        const matchesSearch =
          payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !filterStatus || payment.status === filterStatus;
        const matchesPackage = !filterPackage || payment.package === filterPackage;
        return matchesSearch && matchesStatus && matchesPackage;
      }),
    [searchTerm, filterStatus, filterPackage],
  );

  const analytics = useMemo(() => {
    const projectTitleById = new Map(mockProjects.map((project) => [project.id, project.title]));

    const spendFactorByStatus: Record<string, number> = {
      completed: 0.62,
      pending: 0.34,
      failed: 0.1,
      refunded: 0.2,
    };

    let totalBudget = 0;
    let totalReceived = 0;
    let totalPending = 0;
    let totalSpent = 0;
    let ukSpent = 0;
    let indiaSpent = 0;
    let failedCount = 0;

    const projectMap = new Map<string, ProjectBudgetRow>();

    for (const payment of mockPayments) {
      totalBudget += payment.amount;
      if (payment.status === 'completed') totalReceived += payment.amount;
      if (payment.status === 'pending') totalPending += payment.amount;
      if (payment.status === 'failed') failedCount += 1;

      const spend = payment.amount * (spendFactorByStatus[payment.status] ?? 0.3);
      totalSpent += spend;

      const project = payment.projectId
        ? mockProjects.find((item) => item.id === payment.projectId)
        : null;
      const hasIndiaTeam = Boolean(project?.agentY);
      const ukShare = hasIndiaTeam ? 0.52 : 0.68;
      ukSpent += spend * ukShare;
      indiaSpent += spend * (1 - ukShare);

      if (!payment.projectId) continue;

      const current = projectMap.get(payment.projectId) ?? {
        id: payment.projectId,
        projectId: payment.projectId,
        projectTitle: projectTitleById.get(payment.projectId) || payment.projectId,
        budget: 0,
        received: 0,
        pending: 0,
        spent: 0,
        remaining: 0,
        utilizationPct: 0,
        isActive: true,
      };

      current.budget += payment.amount;
      current.spent += spend;
      if (payment.status === 'completed') current.received += payment.amount;
      if (payment.status === 'pending') current.pending += payment.amount;
      projectMap.set(payment.projectId, current);
    }

    const totalCount = mockPayments.length || 1;
    const completionRate = Math.round((mockPayments.filter((p) => p.status === 'completed').length / totalCount) * 100);
    const avgPayment = Math.round(mockPayments.reduce((sum, payment) => sum + payment.amount, 0) / totalCount);
    const net = totalReceived - totalSpent;
    const utilizationPct = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const collectionPct = totalBudget ? Math.round((totalReceived / totalBudget) * 100) : 0;
    const ukSpendPct = totalSpent ? Math.round((ukSpent / totalSpent) * 100) : 0;
    const indiaSpendPct = totalSpent ? 100 - ukSpendPct : 0;

    return {
      totalBudget,
      totalReceived,
      totalPending,
      totalSpent,
      ukSpent,
      indiaSpent,
      ukSpendPct,
      indiaSpendPct,
      net,
      utilizationPct,
      collectionPct,
      completionRate,
      avgPayment,
      failedCount,
      projectBudgets: Array.from(projectMap.values())
        .map((project) => {
          const remaining = Math.max(0, project.budget - project.spent);
          const utilization = project.budget
            ? Math.min(100, Math.round((project.spent / project.budget) * 100))
            : 0;
          return {
            ...project,
            remaining,
            utilizationPct: utilization,
            isActive: true,
          };
        })
        .sort((a, b) => b.budget - a.budget),
    };
  }, []);

  const getClientEmail = (clientName: string) =>
    mockClients.find((client) => client.name === clientName)?.email || '';

  const projectBudgetColumns = useMemo<Column<ProjectBudgetRow>[]>(
    () => [
      {
        key: 'projectTitle',
        label: 'Project',
        sortable: true,
        render: (_value, row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.projectTitle}</p>
            <p className="text-xs text-slate-500">{row.projectId}</p>
          </div>
        ),
      },
      {
        key: 'budget',
        label: 'Budget',
        sortable: true,
        render: (value) => <span className="font-semibold">{currency.format(value)}</span>,
      },
      {
        key: 'received',
        label: 'Received',
        sortable: true,
        render: (value) => <span className="font-semibold text-emerald-700">{currency.format(value)}</span>,
      },
      {
        key: 'pending',
        label: 'Pending',
        sortable: true,
        render: (value) => <span className="font-semibold text-amber-700">{currency.format(value)}</span>,
      },
      {
        key: 'spent',
        label: 'Spent',
        sortable: true,
        render: (value) => <span className="font-semibold text-rose-700">{currency.format(value)}</span>,
      },
      {
        key: 'remaining',
        label: 'Remaining',
        sortable: true,
        render: (value) => <span className="font-semibold text-slate-900">{currency.format(value)}</span>,
      },
      {
        key: 'utilizationPct',
        label: 'Utilization',
        sortable: true,
        render: (value) => (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {value}%
          </span>
        ),
      },
    ],
    [],
  );

  const paymentRows = useMemo<PaymentTableRow[]>(
    () =>
      filteredPayments.map((payment) => ({
        id: payment.id,
        clientName: payment.clientName,
        clientEmail: getClientEmail(payment.clientName),
        package: payment.package,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        status: payment.status,
        transactionId: payment.transactionId,
        isActive: payment.status !== 'failed',
      })),
    [filteredPayments],
  );

  const paymentColumns = useMemo<Column<PaymentTableRow>[]>(
    () => [
      {
        key: 'clientName',
        label: 'Client',
        sortable: true,
        render: (_value, row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.clientName}</p>
            <p className="text-xs text-slate-600">{row.clientEmail}</p>
          </div>
        ),
      },
      {
        key: 'transactionId',
        label: 'Transaction ID',
        sortable: true,
        render: (value) => <span className="font-mono text-xs text-slate-700">{value}</span>,
      },
      {
        key: 'package',
        label: 'Package',
        sortable: true,
        render: (value) => (
          <span className="inline-block rounded bg-purple-100 px-2 py-1 text-xs font-semibold capitalize text-purple-800">
            {value}
          </span>
        ),
      },
      {
        key: 'amount',
        label: 'Amount',
        sortable: true,
        render: (value) => <p className="font-bold text-slate-900">{currency.format(value)}</p>,
      },
      {
        key: 'paymentMethod',
        label: 'Method',
        sortable: true,
        render: (value) => <p className="capitalize text-slate-900">{value.replace(/_/g, ' ')}</p>,
      },
      {
        key: 'paymentDate',
        label: 'Date',
        sortable: true,
        render: (value) => new Date(value).toLocaleDateString('en-GB'),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => <StatusBadge status={value} type="payment" />,
      },
      {
        key: 'actions',
        label: 'Details',
        render: (_value, row) => (
          <button
            type="button"
            onClick={() =>
              setSelectedPayment(
                mockPayments.find((payment) => payment.id === row.id) || null,
              )
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            View
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Revenue Project Analysis</h1>
        </div>
        <p className="text-slate-600">
          Project-level collections, spend analysis, and budget health across delivery teams.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500">Received</p>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{currency.format(analytics.totalReceived)}</p>
          <p className="mt-1 text-xs text-slate-500">{analytics.collectionPct}% of total budget</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500">Pending</p>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">{currency.format(analytics.totalPending)}</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting customer payment</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500">Spent</p>
            <TrendingDown className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-700">{currency.format(analytics.totalSpent)}</p>
          <p className="mt-1 text-xs text-slate-500">{analytics.utilizationPct}% budget utilized</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500">Net Position</p>
            <TrendingUp className={`h-4 w-4 ${analytics.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
          </div>
          <p className={`mt-2 text-2xl font-bold ${analytics.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {currency.format(analytics.net)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Received minus spent</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Collection vs Budget</p>
            <span className="text-xs text-slate-500">Simple cash flow view</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-600">Collected</span>
                <span className="font-semibold text-slate-900">
                  {currency.format(analytics.totalReceived)} / {currency.format(analytics.totalBudget)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-emerald-500" style={{ width: `${analytics.collectionPct}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-600">Spent</span>
                <span className="font-semibold text-slate-900">
                  {currency.format(analytics.totalSpent)} / {currency.format(analytics.totalBudget)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-rose-500" style={{ width: `${analytics.utilizationPct}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-600">Pending to collect</span>
                <span className="font-semibold text-slate-900">{currency.format(analytics.totalPending)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-amber-500"
                  style={{
                    width: `${analytics.totalBudget ? Math.round((analytics.totalPending / analytics.totalBudget) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Operational Snapshot</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">UK Team Spend</span>
              <span className="font-semibold text-blue-700">
                {analytics.ukSpendPct}% ({currency.format(analytics.ukSpent)})
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-blue-500" style={{ width: `${analytics.ukSpendPct}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">India Team Spend</span>
              <span className="font-semibold text-amber-700">
                {analytics.indiaSpendPct}% ({currency.format(analytics.indiaSpent)})
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-amber-500" style={{ width: `${analytics.indiaSpendPct}%` }} />
            </div>
            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Success Rate</span>
                <span className="font-semibold text-slate-900">{analytics.completionRate}%</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-600">Avg Payment</span>
                <span className="font-semibold text-slate-900">{currency.format(analytics.avgPayment)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-600">Failed Count</span>
                <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {analytics.failedCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Project Budget Overview</h3>
          <span className="text-xs text-slate-500">Budget, collection, and spend by project</span>
        </div>
        <div className="md:hidden space-y-3">
          {analytics.projectBudgets.map((project) => (
            <div key={project.id} className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">{project.projectTitle}</p>
              <p className="text-xs text-slate-500">{project.projectId}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <span className="text-slate-500">Budget</span>
                <span className="font-semibold text-slate-900">{currency.format(project.budget)}</span>
                <span className="text-slate-500">Received</span>
                <span className="font-semibold text-emerald-700">{currency.format(project.received)}</span>
                <span className="text-slate-500">Pending</span>
                <span className="font-semibold text-amber-700">{currency.format(project.pending)}</span>
                <span className="text-slate-500">Utilization</span>
                <span className="font-semibold text-blue-700">{project.utilizationPct}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:block">
          <DataTable data={analytics.projectBudgets} columns={projectBudgetColumns} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by client name or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Packages</option>
            {packageOptions.map((pkg) => (
              <option key={pkg} value={pkg}>
                {pkg.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {filteredPayments.length} Payment{filteredPayments.length !== 1 ? 's' : ''}
        </h2>
        <div className="md:hidden space-y-3">
          {paymentRows.map((payment) => (
            <div key={payment.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{payment.clientName}</p>
                  <p className="text-xs text-slate-500">{payment.clientEmail}</p>
                </div>
                <StatusBadge status={payment.status} type="payment" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <span className="text-slate-500">Amount</span>
                <span className="font-semibold text-slate-900">{currency.format(payment.amount)}</span>
                <span className="text-slate-500">Method</span>
                <span className="capitalize text-slate-700">{payment.paymentMethod.replace(/_/g, ' ')}</span>
                <span className="text-slate-500">Date</span>
                <span className="text-slate-700">{new Date(payment.paymentDate).toLocaleDateString('en-GB')}</span>
                <span className="text-slate-500">Txn</span>
                <span className="font-mono text-xs text-slate-700">{payment.transactionId}</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSelectedPayment(
                    mockPayments.find((p) => p.id === payment.id) || null,
                  )
                }
                className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                View
              </button>
            </div>
          ))}
        </div>
        <div className="hidden md:block">
          <DataTable data={paymentRows} columns={paymentColumns} />
        </div>
      </section>

      {selectedPayment && (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Payment Details</h2>
              <p className="mt-1 text-slate-600">Transaction ID: {selectedPayment.id}</p>
            </div>
            <button
              onClick={() => setSelectedPayment(null)}
              className="text-2xl text-slate-600 hover:text-slate-900"
            >
              x
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-slate-600">Client Name</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedPayment.clientName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Amount</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{currency.format(selectedPayment.amount)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Package</p>
              <p className="mt-1 font-semibold capitalize text-slate-900">{selectedPayment.package}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Status</p>
              <div className="mt-1">
                <StatusBadge status={selectedPayment.status} type="payment" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Payment Method</p>
              <p className="mt-1 font-semibold capitalize text-slate-900">
                {selectedPayment.paymentMethod.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Payment Date</p>
              <p className="mt-1 font-semibold text-slate-900">
                {new Date(selectedPayment.paymentDate).toLocaleDateString('en-GB')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Due Date</p>
              <p className="mt-1 font-semibold text-slate-900">
                {new Date(selectedPayment.dueDate).toLocaleDateString('en-GB')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Description</p>
              <p className="mt-1 font-semibold text-slate-900">{selectedPayment.description}</p>
            </div>
            {selectedPayment.projectId && (
              <div>
                <p className="text-sm font-medium text-slate-600">Project ID</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedPayment.projectId}</p>
              </div>
            )}
          </div>

          {selectedPayment.status === 'pending' && (
            <div className="mt-6 flex gap-3">
              <button className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
                Mark as Completed
              </button>
              <button className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700">
                Mark as Failed
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

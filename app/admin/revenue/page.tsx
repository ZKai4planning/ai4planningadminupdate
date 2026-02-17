"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Printer,
  ReceiptText,
  TrendingUp,
  X,
} from "lucide-react";
import { mockPayments, mockProjects } from "@/app/lib/mock-data";
import DataTable, { Column } from "@/components/datatable";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const shortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const pendingRef = (id: string) => `PEND-${id.toUpperCase()}`;

type PendingPaymentRow = {
  id: string;
  clientName: string;
  projectId: string;
  amount: number;
  dueDate: string;
  paymentRef: string;
  followUpOwner: string;
  isOverdue: boolean;
  isActive: boolean;
};

type ReceivedPaymentRow = {
  id: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string;
  isActive: boolean;
};

export default function RevenuePage() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );

  const projectOwnerById = useMemo(() => {
    return new Map(
      mockProjects.map((project) => [
        project.id,
        project.agentX || project.agentY || "Revenue Team",
      ]),
    );
  }, []);

  const stats = useMemo(() => {
    const received = mockPayments.filter((payment) => payment.status === "completed");
    const pending = mockPayments.filter((payment) => payment.status === "pending");

    const totalReceivedAmount = received.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const totalPendingAmount = pending.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const overduePending = pending.filter(
      (payment) => new Date(payment.dueDate).getTime() < Date.now(),
    ).length;

    return {
      totalReceivedAmount,
      totalPendingAmount,
      receivedCount: received.length,
      pendingCount: pending.length,
      overduePending,
    };
  }, []);

  const monthSeries = useMemo(() => {
    const monthMap = new Map<string, number>();

    mockPayments.forEach((payment) => {
      if (payment.status !== "completed") {
        return;
      }
      const date = new Date(payment.paymentDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, (monthMap.get(key) || 0) + payment.amount);
    });

    const entries = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, value]) => {
        const [year, month] = key.split("-");
        return {
          key,
          label: new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
            "en-GB",
            { month: "short" },
          ),
          value,
        };
      });

    const max = Math.max(...entries.map((item) => item.value), 1);
    return { entries, max };
  }, []);

  const pendingPayments = useMemo(
    () =>
      mockPayments
        .filter((payment) => payment.status === "pending")
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        ),
    [],
  );

  const receivedPayments = useMemo(
    () =>
      mockPayments
        .filter((payment) => payment.status === "completed")
        .sort(
          (a, b) =>
            new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
        ),
    [],
  );

  const pendingRows = useMemo<PendingPaymentRow[]>(
    () =>
      pendingPayments.map((payment) => {
        const isOverdue = new Date(payment.dueDate).getTime() < Date.now();
        return {
          id: payment.id,
          clientName: payment.clientName,
          projectId: payment.projectId || "N/A",
          amount: payment.amount,
          dueDate: payment.dueDate,
          paymentRef: pendingRef(payment.id),
          followUpOwner: payment.projectId
            ? projectOwnerById.get(payment.projectId) || "Revenue Team"
            : "Revenue Team",
          isOverdue,
          isActive: true,
        };
      }),
    [pendingPayments, projectOwnerById],
  );

  const receivedRows = useMemo<ReceivedPaymentRow[]>(
    () =>
      receivedPayments.map((payment) => ({
        id: payment.id,
        clientName: payment.clientName,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        isActive: true,
      })),
    [receivedPayments],
  );

  const pendingColumns = useMemo<Column<PendingPaymentRow>[]>(
    () => [
      {
        key: "clientName",
        label: "Client",
        sortable: true,
        render: (value) => <span className="font-semibold text-slate-900">{value}</span>,
      },
      {
        key: "projectId",
        label: "Project",
        sortable: true,
      },
      {
        key: "amount",
        label: "Amount",
        sortable: true,
        render: (value) => (
          <span className="font-semibold text-amber-700">
            {currency.format(value)}
          </span>
        ),
      },
      {
        key: "dueDate",
        label: "Due Date",
        sortable: true,
        render: (_value, row) => (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              row.isOverdue ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            {shortDate(row.dueDate)}
          </span>
        ),
      },
      {
        key: "paymentRef",
        label: "Payment Ref",
        sortable: true,
        render: (value) => <span className="font-mono text-xs">{value}</span>,
      },
      {
        key: "followUpOwner",
        label: "Follow Up Owner",
        sortable: true,
      },
    ],
    [],
  );

  const receivedColumns = useMemo<Column<ReceivedPaymentRow>[]>(
    () => [
      {
        key: "clientName",
        label: "Client",
        sortable: true,
        render: (value) => <span className="font-semibold text-slate-900">{value}</span>,
      },
      {
        key: "amount",
        label: "Amount",
        sortable: true,
        render: (value) => (
          <span className="font-semibold text-emerald-700">
            {currency.format(value)}
          </span>
        ),
      },
      {
        key: "paymentDate",
        label: "Payment Date",
        sortable: true,
        render: (value) => shortDate(value),
      },
      {
        key: "paymentMethod",
        label: "Method",
        sortable: true,
        render: (value) => (
          <span className="capitalize text-slate-700">
            {value.replace("_", " ")}
          </span>
        ),
      },
      {
        key: "transactionId",
        label: "Transaction ID",
        sortable: true,
        render: (value) => <span className="font-mono text-xs">{value}</span>,
      },
      {
        key: "actions",
        label: "Invoice",
        render: (_value, row) => (
          <button
            type="button"
            onClick={() => setSelectedInvoiceId(row.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
        ),
      },
    ],
    [],
  );

  const selectedInvoice = useMemo(
    () => mockPayments.find((payment) => payment.id === selectedInvoiceId) ?? null,
    [selectedInvoiceId],
  );

  const totalTracked = stats.totalReceivedAmount + stats.totalPendingAmount;
  const receivedPct = totalTracked
    ? Math.round((stats.totalReceivedAmount / totalTracked) * 100)
    : 0;
  const pendingPct = 100 - receivedPct;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Revenue Overall Analysis</h1>
        <p className="mt-2 text-slate-600">
          Monitor platform-wide collections, pending follow-ups, transaction IDs, and invoices.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Banknote className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase">Received Value</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {currency.format(stats.totalReceivedAmount)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock3 className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase">Pending Value</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {currency.format(stats.totalPendingAmount)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase">Received Count</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.receivedCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <AlertCircle className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase">Pending Count</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <TrendingUp className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase">Overdue Pending</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-700">
            {stats.overduePending}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">
              Payments Received Trend
            </p>
            <span className="text-xs text-slate-500">Last 6 months</span>
          </div>
          <div className="overflow-x-auto">
            <div className="flex min-w-[520px] h-52 items-end gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            {monthSeries.entries.length === 0 ? (
              <p className="text-sm text-slate-500">No completed payments yet.</p>
            ) : (
              monthSeries.entries.map((month) => (
                <div key={month.key} className="flex flex-1 flex-col items-center">
                  <div className="mb-2 text-[11px] font-semibold text-slate-600">
                    {currency.format(month.value)}
                  </div>
                  <div className="flex h-36 w-full items-end">
                    <div
                      className="w-full rounded-t-md bg-blue-500"
                      style={{
                        height: `${Math.max(
                          8,
                          Math.round((month.value / monthSeries.max) * 100),
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {month.label}
                  </p>
                </div>
              ))
            )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Payment Track</p>
          <p className="mt-1 text-xs text-slate-500">
            Received vs pending amount split
          </p>
          <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="flex h-full">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${receivedPct}%` }}
              />
              <div
                className="h-full bg-amber-500"
                style={{ width: `${pendingPct}%` }}
              />
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Received</span>
              <span className="font-semibold text-emerald-700">
                {receivedPct}% ({currency.format(stats.totalReceivedAmount)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Pending</span>
              <span className="font-semibold text-amber-700">
                {pendingPct}% ({currency.format(stats.totalPendingAmount)})
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-900">
            Pending Payments and Follow Up
          </p>
          <span className="text-xs text-slate-500">Track due dates and owners</span>
        </div>
        <DataTable data={pendingRows} columns={pendingColumns} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-900">
            Received Payments
          </p>
          <span className="text-xs text-slate-500">Transactions and receipts</span>
        </div>
        <DataTable data={receivedRows} columns={receivedColumns} />
      </section>

      {selectedInvoice && (
        <div className="fixed inset-0 z-40 bg-slate-900/60">
          <div className="flex h-full flex-col">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-semibold text-slate-900">
                  Invoice A4 Preview
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceId(null)}
                  className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
              <article className="mx-auto w-full max-w-[210mm] min-h-[297mm] bg-white p-4 shadow-xl sm:p-6 md:p-10">
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      AI4Planning
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                      Invoice
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      INV-{selectedInvoice.id.toUpperCase()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      selectedInvoice.status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Bill To
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {selectedInvoice.clientName}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Client ID: {selectedInvoice.clientId}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Invoice Date
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {shortDate(selectedInvoice.paymentDate)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Due Date: {shortDate(selectedInvoice.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-2 gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 sm:grid-cols-4">
                    <span>Description</span>
                    <span>Package</span>
                    <span>Method</span>
                    <span className="text-right">Amount</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 px-4 py-4 text-sm text-slate-700 sm:grid-cols-4">
                    <span className="text-slate-800">{selectedInvoice.description}</span>
                    <span className="capitalize">{selectedInvoice.package}</span>
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <CreditCard className="h-4 w-4 text-slate-500" />
                      {selectedInvoice.paymentMethod.replace("_", " ")}
                    </span>
                    <span className="text-right font-semibold text-slate-900">
                      {currency.format(selectedInvoice.amount)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2 text-sm">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Payment Reference
                    </p>
                    <p className="font-mono text-xs text-slate-700">
                      {selectedInvoice.status === "completed"
                        ? selectedInvoice.transactionId
                        : pendingRef(selectedInvoice.id)}
                    </p>
                    <p className="text-slate-600">
                      Project: {selectedInvoice.projectId || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:ml-auto sm:w-full sm:max-w-xs">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-semibold text-slate-900">
                        {currency.format(selectedInvoice.amount)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">Tax</span>
                      <span className="font-semibold text-slate-900">
                        {currency.format(0)}
                      </span>
                    </div>
                    <div className="mt-3 border-t border-slate-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">
                          Total
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          {currency.format(selectedInvoice.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-12 text-xs text-slate-500">
                  This is a system-generated invoice preview for internal revenue
                  review.
                </p>
              </article>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

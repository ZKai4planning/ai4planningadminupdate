'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import axiosInstance from '@/app/lib/axiosinstance';
import DataTable, { type Column } from '@/components/datatable';
import {
  ICON_OPTIONS,
  normalizeStageListResponse,
  type StageDefinition,
} from './stage-storage';

type StageTableRow = {
  id: string;
  label: string;
  iconKey: StageDefinition['iconKey'];
  priority: number;
  route: string;
  legacyRoutes: string;
  nextCardSummary: string;
  ctaStage: string;
  initialStage: string;
  isActive: boolean;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || fallback;
};

export default function ProjectStagesPage() {
  const router = useRouter();
  const [stages, setStages] = useState<StageDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const fetchStages = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/project-stage?includeDeleted=true');
      setStages(normalizeStageListResponse(response.data));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load project stages.'));
      setStages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStages();
  }, []);

  const handleDeleteStage = async (id: string) => {
    if (deletingId || restoringId) return;

    try {
      setDeletingId(id);
      setError('');
      await axiosInstance.delete(`/project-stage/${id}`);
      setStages((prev) =>
        prev.map((stage) => (stage.id === id ? { ...stage, isActive: false } : stage)),
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete stage.'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestoreStage = async (id: string) => {
    if (deletingId || restoringId) return;

    try {
      setRestoringId(id);
      setError('');
      await axiosInstance.patch(`/project-stage/restore/${id}`);
      setStages((prev) =>
        prev.map((stage) => (stage.id === id ? { ...stage, isActive: true } : stage)),
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to restore stage.'));
    } finally {
      setRestoringId(null);
    }
  };

  const handleEditStage = (id: string) => {
    const query = new URLSearchParams({ mode: 'edit', id });
    router.push(`/admin/ProjectStages/create?${query.toString()}`);
  };

  const tableData = useMemo<StageTableRow[]>(
    () =>
      [...stages]
        .sort((a, b) => a.priority - b.priority)
        .map((stage) => ({
          id: stage.id,
          label: stage.label,
          iconKey: stage.iconKey,
          priority: stage.priority,
          route: stage.route,
          legacyRoutes: stage.legacyRoutes.join(', ') || '-',
          nextCardSummary: stage.nextCard?.title || 'No next card',
          ctaStage: stage.nextCard?.ctaStage || '-',
          initialStage: stage.isInitialStage ? 'Yes' : 'No',
          isActive: stage.isActive,
        })),
    [stages],
  );

  const selectedStage = useMemo(
    () => stages.find((stage) => stage.id === selectedStageId) ?? null,
    [selectedStageId, stages],
  );

  const columns: Column<StageTableRow>[] = [
    {
      key: 'sno',
      label: 'S.No',
      render: (_value, _row, index, startIndex) => startIndex + index + 1,
    },
    {
      key: 'label',
      label: 'Stage',
      sortable: true,
      render: (value, row) => {
        const Icon = ICON_OPTIONS[row.iconKey];
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-600" />
            <div>
              <p className="font-semibold text-slate-900">{String(value)}</p>
              <p className="text-xs text-slate-500">{row.id}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
    },
    {
      key: 'route',
      label: 'Route',
      sortable: true,
    },
    {
      key: 'legacyRoutes',
      label: 'Legacy Routes',
      render: (value) => <span className="line-clamp-1 text-slate-600">{String(value)}</span>,
    },
    {
      key: 'nextCardSummary',
      label: 'Next Card',
      render: (value, row) => (
        <div>
          <p className="font-medium text-slate-900">{String(value)}</p>
          <p className="text-xs text-slate-500">CTA Stage: {row.ctaStage}</p>
        </div>
      ),
    },
    {
      key: 'initialStage',
      label: 'Initial',
      sortable: true,
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (_value, row) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            row.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedStageId(row.id)}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-blue-700"
            aria-label={`View ${row.label}`}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleEditStage(row.id)}
            disabled={!row.isActive}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`Edit ${row.label}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          {row.isActive ? (
            <button
              type="button"
              onClick={() => void handleDeleteStage(row.id)}
              disabled={deletingId === row.id || Boolean(restoringId)}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Delete ${row.label}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleRestoreStage(row.id)}
              disabled={restoringId === row.id || Boolean(deletingId)}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Restore ${row.label}`}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-2 md:p-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">Project Stages</h1>
            <p className="mt-1 text-sm text-slate-500">Manage all configured project journey stages.</p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/admin/ProjectStages/create')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Create Stage
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Loading stages...
        </div>
      ) : (
        <DataTable data={tableData} columns={columns} />
      )}

      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{selectedStage.label}</h2>
                <p className="mt-1 text-xs text-slate-500">Stage ID: {selectedStage.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStageId(null)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Close view dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Route</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{selectedStage.route}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{selectedStage.priority}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Initial Stage</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selectedStage.isInitialStage ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selectedStage.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Legacy Routes</p>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedStage.legacyRoutes.length ? selectedStage.legacyRoutes.join(', ') : '-'}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next Card</p>
              {selectedStage.nextCard ? (
                <div className="mt-2 space-y-1 text-sm text-slate-900">
                  <p>
                    <span className="font-semibold">Title:</span> {selectedStage.nextCard.title || '-'}
                  </p>
                  <p>
                    <span className="font-semibold">Description:</span>{' '}
                    {selectedStage.nextCard.description || '-'}
                  </p>
                  <p>
                    <span className="font-semibold">CTA Label:</span> {selectedStage.nextCard.ctaLabel || '-'}
                  </p>
                  <p>
                    <span className="font-semibold">CTA Path:</span> {selectedStage.nextCard.ctaPath || '-'}
                  </p>
                  <p>
                    <span className="font-semibold">CTA Stage:</span> {selectedStage.nextCard.ctaStage || '-'}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No next card configured.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

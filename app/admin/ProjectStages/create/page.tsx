'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, Plus } from 'lucide-react';
import axiosInstance from '@/app/lib/axiosinstance';
import {
  ICON_OPTIONS,
  buildProjectStagePayload,
  normalizeStageListResponse,
  splitLegacyRoutes,
  type IconKey,
  type StageDefinition,
  type StageNextCard,
} from '../stage-storage';

type StageDraft = {
  label: string;
  iconKey: IconKey;
  priority: string;
  route: string;
  legacyRoutesInput: string;
  isInitialStage: boolean;
  nextTitle: string;
  nextDescription: string;
  nextCtaLabel: string;
  nextCtaPath: string;
  ctaStage: string;
};

const createEmptyDraft = (): StageDraft => ({
  label: '',
  iconKey: 'CreditCard',
  priority: '1',
  route: '',
  legacyRoutesInput: '',
  isInitialStage: false,
  nextTitle: '',
  nextDescription: '',
  nextCtaLabel: '',
  nextCtaPath: '',
  ctaStage: '',
});

const ICON_HELP_TEXT: Record<IconKey, string> = {
  CreditCard: 'Payments and billing stage',
  ClipboardCheck: 'Verification and checks',
  Handshake: 'Consultation and agreement',
  Users: 'Team assignment',
  BriefcaseBusiness: 'Work package preparation',
  FolderKanban: 'Execution workflow',
  FileText: 'Documents and records',
  Send: 'Submission and handoff',
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || fallback;
};

const hasAnyNextCardInput = (nextCard: StageNextCard) =>
  Boolean(
    (nextCard.title ?? '').trim() ||
      (nextCard.description ?? '').trim() ||
      (nextCard.ctaLabel ?? '').trim() ||
      (nextCard.ctaPath ?? '').trim() ||
      (nextCard.ctaStage ?? '').trim(),
  );

const formatStageLikeObject = (stage: Omit<StageDefinition, 'id' | 'isActive'>) =>
  JSON.stringify(buildProjectStagePayload(stage), null, 2);

function CreateProjectStagePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const iconDropdownRef = useRef<HTMLDivElement | null>(null);

  const [draft, setDraft] = useState<StageDraft>(createEmptyDraft);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [iconMenuOpen, setIconMenuOpen] = useState(false);

  const isEditMode = searchParams.get('mode') === 'edit';
  const editingId = searchParams.get('id') ?? '';
  const SelectedIcon = ICON_OPTIONS[draft.iconKey];

  const parsedPriority = useMemo(() => {
    const value = Number.parseInt(draft.priority, 10);
    if (!Number.isFinite(value) || value < 1) {
      return 1;
    }
    return Math.trunc(value);
  }, [draft.priority]);

  const normalizedNextCard = useMemo<StageNextCard>(
    () => ({
      ...(draft.nextTitle.trim() ? { title: draft.nextTitle.trim() } : {}),
      ...(draft.nextDescription.trim() ? { description: draft.nextDescription.trim() } : {}),
      ...(draft.nextCtaLabel.trim() ? { ctaLabel: draft.nextCtaLabel.trim() } : {}),
      ...(draft.nextCtaPath.trim() ? { ctaPath: draft.nextCtaPath.trim() } : {}),
      ...(draft.ctaStage.trim() ? { ctaStage: draft.ctaStage.trim() } : {}),
    }),
    [draft],
  );

  const previewObject = useMemo(
    () =>
      formatStageLikeObject({
        label: draft.label.trim(),
        iconKey: draft.iconKey,
        priority: parsedPriority,
        route: draft.route.trim(),
        legacyRoutes: splitLegacyRoutes(draft.legacyRoutesInput),
        isInitialStage: draft.isInitialStage,
        ...(hasAnyNextCardInput(normalizedNextCard) ? { nextCard: normalizedNextCard } : {}),
      }),
    [draft, normalizedNextCard, parsedPriority],
  );

  useEffect(() => {
    const loadStages = async () => {
      try {
        setLoading(true);
        setFormError('');

        if (!isEditMode) return;

        const response = await axiosInstance.get('/project-stage');
        const normalizedStages = normalizeStageListResponse(response.data);
        const stageToEdit = normalizedStages.find((stage) => stage.id === editingId);

        if (!stageToEdit) {
          setFormError('Stage not found for editing.');
          return;
        }

        setDraft({
          label: stageToEdit.label,
          iconKey: stageToEdit.iconKey,
          priority: String(stageToEdit.priority),
          route: stageToEdit.route,
          legacyRoutesInput: stageToEdit.legacyRoutes.join(', '),
          isInitialStage: stageToEdit.isInitialStage,
          nextTitle: stageToEdit.nextCard?.title ?? '',
          nextDescription: stageToEdit.nextCard?.description ?? '',
          nextCtaLabel: stageToEdit.nextCard?.ctaLabel ?? '',
          nextCtaPath: stageToEdit.nextCard?.ctaPath ?? '',
          ctaStage: stageToEdit.nextCard?.ctaStage ?? '',
        });
      } catch (error) {
        setFormError(getErrorMessage(error, 'Failed to load project stage data.'));
      } finally {
        setLoading(false);
      }
    };

    void loadStages();
  }, [editingId, isEditMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        iconDropdownRef.current &&
        !iconDropdownRef.current.contains(event.target as Node)
      ) {
        setIconMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (key: keyof StageDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (formError) {
      setFormError('');
    }
  };

  const handleToggleInitialStage = (checked: boolean) => {
    setDraft((prev) => ({ ...prev, isInitialStage: checked }));
    if (formError) {
      setFormError('');
    }
  };

  const handleSave = async () => {
    if (saving) return;

    const label = draft.label.trim();
    const route = draft.route.trim();
    const priority = Number.parseInt(draft.priority, 10);
    const legacyRoutes = splitLegacyRoutes(draft.legacyRoutesInput);
    const hasCtaPath = Boolean((normalizedNextCard.ctaPath ?? '').trim());
    const hasCtaStage = Boolean((normalizedNextCard.ctaStage ?? '').trim());
    const includeNextCard = hasAnyNextCardInput(normalizedNextCard);

    if (!label || !route || !Number.isFinite(priority) || priority < 1) {
      setFormError('Label, route, and valid priority are required.');
      return;
    }

    if (hasCtaPath && hasCtaStage) {
      setFormError('Provide only one: CTA Path or CTA Stage. Do not fill both.');
      return;
    }

    const stageForPayload: Omit<StageDefinition, 'id' | 'isActive'> = {
      label,
      iconKey: draft.iconKey,
      priority: Math.trunc(priority),
      route,
      legacyRoutes,
      isInitialStage: draft.isInitialStage,
      ...(includeNextCard ? { nextCard: normalizedNextCard } : {}),
    };

    const payload = buildProjectStagePayload(stageForPayload);

    setSaving(true);
    setFormError('');

    try {
      if (isEditMode) {
        try {
          await axiosInstance.put(`/project-stage/${editingId}`, payload);
        } catch {
          await axiosInstance.patch(`/project-stage/${editingId}`, payload);
        }
      } else {
        await axiosInstance.post('/project-stage', payload);
      }

      router.push('/admin/ProjectStages');
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          isEditMode ? 'Failed to update stage. Please try again.' : 'Failed to create stage. Please try again.',
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-2 md:p-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <button
              onClick={() => router.push('/admin/ProjectStages')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
              aria-label="Back to project stages"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                {isEditMode ? 'Edit Project Stage' : 'Create Project Stage'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {isEditMode ? 'Update stage content and save changes.' : 'Create a new project stage.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {saving ? 'Saving...' : isEditMode ? 'Update Stage' : 'Save Stage'}
          </button>
        </div>
      </div>

      <div className="gap-6 ">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Stage Details</h2>
          <p className="mt-1 text-sm text-slate-500">Payload fields for `/project-stage`.</p>

          {formError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}
          <div className='grid grid-cols-2 gap-4'>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Label</label>
              <input
                value={draft.label}
                onChange={(event) => handleChange('label', event.target.value)}
                placeholder="Service & Initial Payment"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Route</label>
              <input
                value={draft.route}
                onChange={(event) => handleChange('route', event.target.value)}
                placeholder="payment"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</label>
              <input
                type="number"
                min={1}
                step={1}
                value={draft.priority}
                onChange={(event) => handleChange('priority', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className=" flex items-center gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Initial Stage
              </label>
              <label className="inline-flex h-[42px] cursor-pointer items-center gap-3 rounded-xl  bg-white px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={draft.isInitialStage}
                  onChange={(event) => handleToggleInitialStage(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                />
                <span className="text-sm text-slate-700">Yes</span>
              </label>
            </div>

            <div className="space-y-2 md:col-span-2" ref={iconDropdownRef}>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Icon</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIconMenuOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition hover:bg-slate-50 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <SelectedIcon className="h-4 w-4" />
                    <span className="font-medium">{draft.iconKey}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform ${iconMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {iconMenuOpen && (
                  <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                    {(Object.keys(ICON_OPTIONS) as IconKey[]).map((iconName) => {
                      const Icon = ICON_OPTIONS[iconName];
                      const selected = draft.iconKey === iconName;

                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => {
                            handleChange('iconKey', iconName);
                            setIconMenuOpen(false);
                          }}
                          className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                            selected ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold">{iconName}</span>
                            <span className={`block text-[11px] ${selected ? 'text-slate-200' : 'text-slate-500'}`}>
                              {ICON_HELP_TEXT[iconName]}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Legacy Routes (comma separated)
              </label>
              <input
                value={draft.legacyRoutesInput}
                onChange={(event) => handleChange('legacyRoutesInput', event.target.value)}
                placeholder="pay"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </div>

          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Next Card (Optional)</h3>
            <p className="mt-1 text-xs text-slate-500">
              Leave all fields empty to skip next card. If used, fill either `ctaPath` or `ctaStage` (not both).
            </p>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Title</label>
                <input
                  value={draft.nextTitle}
                  onChange={(event) => handleChange('nextTitle', event.target.value)}
                  placeholder="Select Service & Commit"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">CTA Label</label>
                <input
                  value={draft.nextCtaLabel}
                  onChange={(event) => handleChange('nextCtaLabel', event.target.value)}
                  placeholder="Choose Your Service"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">CTA Path</label>
                <input
                  value={draft.nextCtaPath}
                  onChange={(event) => handleChange('nextCtaPath', event.target.value)}
                  placeholder="/services"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">CTA Stage</label>
                <input
                  value={draft.ctaStage}
                  onChange={(event) => handleChange('ctaStage', event.target.value)}
                  placeholder="eligibility-check"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  value={draft.nextDescription}
                  onChange={(event) => handleChange('nextDescription', event.target.value)}
                  placeholder="Choose your package to trigger payment..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateProjectStagePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 p-2 md:p-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Loading project stage form...</p>
          </div>
        </div>
      }
    >
      <CreateProjectStagePageContent />
    </Suspense>
  );
}

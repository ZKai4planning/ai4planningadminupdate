import {
  BriefcaseBusiness,
  ClipboardCheck,
  CreditCard,
  FileText,
  FolderKanban,
  Handshake,
  Send,
  Users,
} from 'lucide-react';

export const ICON_OPTIONS = {
  CreditCard,
  ClipboardCheck,
  Handshake,
  Users,
  BriefcaseBusiness,
  FolderKanban,
  FileText,
  Send,
} as const;

export type IconKey = keyof typeof ICON_OPTIONS;

export type StageNextCard = {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaPath?: string;
  ctaStage?: string;
};

export type StageDefinition = {
  id: string;
  label: string;
  iconKey: IconKey;
  priority: number;
  route: string;
  legacyRoutes: string[];
  isInitialStage: boolean;
  isActive: boolean;
  nextCard?: StageNextCard;
};

type ApiStage = {
  id?: string;
  _id?: string;
  projectStageId?: string;
  stageId?: string;
  label?: string;
  route?: string;
  icon?: string;
  iconKey?: string;
  priority?: unknown;
  initialStage?: unknown;
  isInitialStage?: unknown;
  status?: unknown;
  isActive?: unknown;
  deletedAt?: unknown;
  legacyRoutes?: unknown;
  nextCard?: unknown;
};

const isIconKey = (value: string): value is IconKey =>
  Object.prototype.hasOwnProperty.call(ICON_OPTIONS, value);

const normalizePriority = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(1, Math.trunc(value));
  }

  if (typeof value === 'string') {
    const numeric = Number.parseInt(value, 10);
    if (Number.isFinite(numeric)) {
      return Math.max(1, numeric);
    }
  }

  return 1;
};

const normalizeBoolean = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'active';
  }
  return false;
};

const normalizeIsActive = (candidate: ApiStage) => {
  if (typeof candidate.isActive === 'boolean') {
    return candidate.isActive;
  }

  if (typeof candidate.status === 'boolean') {
    return candidate.status;
  }

  if (typeof candidate.status === 'string') {
    const normalized = candidate.status.trim().toLowerCase();
    if (normalized === 'inactive' || normalized === 'deleted' || normalized === 'false' || normalized === '0') {
      return false;
    }
    return true;
  }

  if (candidate.deletedAt) {
    return false;
  }

  return true;
};

const normalizeLegacyRoutes = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeNextCard = (value: unknown): StageNextCard | undefined => {
  let input: Record<string, unknown> = {};

  if (value && typeof value === 'object') {
    input = value as Record<string, unknown>;
  } else if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === 'object') {
        input = parsed as Record<string, unknown>;
      }
    } catch {
      input = {};
    }
  }

  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  const ctaLabel = typeof input.ctaLabel === 'string' ? input.ctaLabel.trim() : '';
  const ctaPath = typeof input.ctaPath === 'string' ? input.ctaPath.trim() : '';
  const ctaStageRaw = input.ctaStage ?? input.nextStage;
  const ctaStage = typeof ctaStageRaw === 'string' ? ctaStageRaw.trim() : '';

  const hasAny = Boolean(title || description || ctaLabel || ctaPath || ctaStage);
  if (!hasAny) {
    return undefined;
  }

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(ctaLabel ? { ctaLabel } : {}),
    ...(ctaPath ? { ctaPath } : {}),
    ...(ctaStage ? { ctaStage } : {}),
  };
};

export const normalizeStage = (input: unknown): StageDefinition | null => {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const candidate = input as ApiStage;
  const id = candidate.projectStageId ?? candidate.stageId ?? candidate.id ?? candidate._id ?? '';
  const iconValue = candidate.icon ?? candidate.iconKey ?? 'CreditCard';

  if (!id || typeof candidate.label !== 'string' || typeof candidate.route !== 'string') {
    return null;
  }

  return {
    id: id.trim(),
    label: candidate.label.trim(),
    iconKey: typeof iconValue === 'string' && isIconKey(iconValue) ? iconValue : 'CreditCard',
    priority: normalizePriority(candidate.priority),
    route: candidate.route.trim(),
    legacyRoutes: normalizeLegacyRoutes(candidate.legacyRoutes),
    isInitialStage: normalizeBoolean(candidate.initialStage ?? candidate.isInitialStage),
    isActive: normalizeIsActive(candidate),
    nextCard: normalizeNextCard(candidate.nextCard),
  };
};

export const normalizeStageListResponse = (input: unknown): StageDefinition[] => {
  const tryArray = (value: unknown) =>
    Array.isArray(value)
      ? value.map(normalizeStage).filter((stage): stage is StageDefinition => Boolean(stage))
      : null;

  const direct = tryArray(input);
  if (direct) return direct;

  if (!input || typeof input !== 'object') {
    return [];
  }

  const container = input as Record<string, unknown>;
  const candidates = [
    container.data,
    container.items,
    container.results,
    container.projectStages,
    (container.data as Record<string, unknown> | undefined)?.data,
  ];

  for (const candidate of candidates) {
    const normalized = tryArray(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return [];
};

export const splitLegacyRoutes = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const buildProjectStagePayload = (stage: Omit<StageDefinition, 'id' | 'isActive'>) => {
  const nextCard = stage.nextCard;
  const title = nextCard?.title?.trim() ?? '';
  const description = nextCard?.description?.trim() ?? '';
  const ctaLabel = nextCard?.ctaLabel?.trim() ?? '';
  const ctaPath = nextCard?.ctaPath?.trim() ?? '';
  const ctaStage = nextCard?.ctaStage?.trim() ?? '';
  const hasNextCard = Boolean(title || description || ctaLabel || ctaPath || ctaStage);

  return {
    label: stage.label.trim(),
    route: stage.route.trim(),
    icon: stage.iconKey,
    priority: stage.priority,
    initialStage: stage.isInitialStage,
    legacyRoutes: stage.legacyRoutes,
    ...(hasNextCard
      ? {
          nextCard: {
            ...(title ? { title } : {}),
            ...(description ? { description } : {}),
            ...(ctaLabel ? { ctaLabel } : {}),
            ...(ctaPath ? { ctaPath } : {}),
            ...(ctaStage ? { ctaStage } : {}),
          },
        }
      : {}),
  };
};

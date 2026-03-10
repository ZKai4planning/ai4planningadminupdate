'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight, Plus, Zap } from 'lucide-react';
import axiosInstance from '@/app/lib/axiosinstance';
import DataTable, { Column } from '@/components/datatable';
import { type ToastType } from '@/components/ui/bottom-toast';
import { useAdminToast } from '@/components/admin/AdminToastProvider';

type SubService = {
  id: string;
  serviceId: string;
  title: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string;
  isActive: boolean;
};

type Service = {
  id: string;
  title: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string;
  isActive: boolean;
  subServices: SubService[];
};

type ApiSubService = {
  image: null;
  id?: string;
  _id?: string;
  subServiceId?: string;
  serviceId?: string;
  title?: string;
  name?: string;
  subServiceName?: string;
  slug?: string;
  subServiceSlug?: string;
  images?: string[] | string | null;
  description?: string;
  isActive?: boolean;
  status?: boolean;
};

type ApiService = {
  image: string | null;
  id?: string;
  _id?: string;
  serviceId?: string;
  title?: string;
  name?: string;
  serviceName?: string;
  slug?: string;
  serviceSlug?: string;
  images?: string[] | string | null;
  description?: string;
  isActive?: boolean;
  status?: boolean;
  subServices?: ApiSubService[];
};

type ServiceTableRow = {
  id: string;
  rowKind: 'service' | 'subservice' | 'meta';
  serviceId: string;
  entityId?: string;
  parentServiceId?: string;
  title: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description: string;
  isActive?: boolean;
  isExpanded?: boolean;
  subIndex?: number;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || fallback;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'n-a';


const normalizeSubService = (subService: ApiSubService, fallbackServiceId = ''): SubService => ({
  id: subService.subServiceId ?? subService.id ?? subService._id ?? '',
  serviceId: subService.serviceId ?? fallbackServiceId,
  title: subService.title ?? '',
  name: subService.name ?? subService.subServiceName ?? '',
  slug:
    subService.slug ??
    subService.subServiceSlug ??
    slugify(subService.name ?? subService.subServiceName ?? subService.title ?? ''),
  imageUrl: subService.image ?? null,
  description: subService.description ?? '',
  isActive: subService.isActive ?? subService.status ?? true,
});

const normalizeService = (service: ApiService): Service => ({
  id: service.serviceId ?? service.id ?? service._id ?? '',
  title: service.title ?? '',
  name: service.name ?? service.serviceName ?? '',
  slug:
    service.slug ??
    service.serviceSlug ??
    slugify(service.name ?? service.serviceName ?? service.title ?? ''),
  imageUrl:service.image,
  description: service.description ?? '',
  isActive: service.isActive ?? service.status ?? true,
  subServices: Array.isArray(service.subServices)
    ? service.subServices
        .map((subService) =>
          normalizeSubService(subService, service.serviceId ?? service.id ?? service._id ?? ''),
        )
        .filter((subService) => subService.id)
    : [],
});

const getLabel = (title: string, name: string) => title || name || 'Untitled';
const getDescription = (description: string) => description || 'No description';
const getAvatarText = (title: string, name: string) => (title || name || 'S').charAt(0).toUpperCase();

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToast } = useAdminToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusUpdatingByService, setStatusUpdatingByService] = useState<Record<string, boolean>>(
    {},
  );
  const [statusUpdatingBySubService, setStatusUpdatingBySubService] = useState<
    Record<string, boolean>
  >({});

  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [subServicesByService, setSubServicesByService] = useState<Record<string, SubService[]>>({});
  const [subServicesLoadingByService, setSubServicesLoadingByService] = useState<
    Record<string, boolean>
  >({});
  const [subServicesErrorByService, setSubServicesErrorByService] = useState<
    Record<string, string>
  >({});

  const fetchServices = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get('/services?includeDeleted=true');
      const payload = (res.data?.data ?? res.data ?? []) as ApiService[];
      const normalized = Array.isArray(payload)
        ? payload.map(normalizeService).filter((service) => service.id)
        : [];

      setServices(normalized);
    } catch (error) {
      setToast({
        type: 'error',
        message: getErrorMessage(error, 'Failed to load services.'),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchServices();
  }, []);

  useEffect(() => {
    const toastMessage = searchParams.get('toast');
    if (!toastMessage) return;

    const toastTypeParam = searchParams.get('toastType');
    const toastType: ToastType =
      toastTypeParam === 'success' || toastTypeParam === 'error' || toastTypeParam === 'info'
        ? toastTypeParam
        : 'info';

    setToast({ message: toastMessage, type: toastType });
    router.replace('/admin/services');
  }, [router, searchParams]);

  const navigateToEditPage = (params: {
    type: 'service' | 'subservice';
    id: string;
    title: string;
    name: string;
    description: string;
    parentServiceId?: string;
    imageUrl?: string | null;
  }) => {
    const query = new URLSearchParams({
      mode: 'edit',
      type: params.type,
      id: params.id,
      title: params.title,
      name: params.name,
      description: params.description,
    });

    if (params.parentServiceId) {
      query.set('parentServiceId', params.parentServiceId);
    }
    if (params.imageUrl) {
      query.set('imageUrl', params.imageUrl);
    }

    router.push(`/admin/services/create?${query.toString()}`);
  };

  const handleEditService = (service: Service) => {
    navigateToEditPage({
      type: 'service',
      id: service.id,
      title: service.title,
      name: service.name,
      description: service.description,
      imageUrl: service.imageUrl,
    });
  };

  const handleEditSubService = (subService: SubService) => {
    navigateToEditPage({
      type: 'subservice',
      id: subService.id,
      title: subService.title,
      name: subService.name,
      description: subService.description,
      parentServiceId: subService.serviceId,
      imageUrl: subService.imageUrl,
    });
  };

  const toggleServiceStatus = async (serviceId: string, nextActive: boolean) => {
    if (statusUpdatingByService[serviceId]) return;

    setStatusUpdatingByService((prev) => ({ ...prev, [serviceId]: true }));

    const previousServices = services;
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId ? { ...service, isActive: nextActive } : service,
      ),
    );

    try {
      if (nextActive) {
        try {
          await axiosInstance.patch(`/services/${serviceId}/restore`);
        } catch {
          await axiosInstance.post(`/services/${serviceId}/restore`);
        }
      } else {
        try {
          await axiosInstance.patch(`/services/${serviceId}/soft-delete`);
        } catch {
          await axiosInstance.post(`/services/${serviceId}/soft-delete`);
        }
      }
      setToast({
        type: 'success',
        message: nextActive ? 'Service activated successfully.' : 'Service deactivated successfully.',
      });
    } catch (error) {
      setServices(previousServices);
      setToast({
        type: 'error',
        message: getErrorMessage(
          error,
          nextActive
            ? 'Failed to activate service. Please try again.'
            : 'Failed to deactivate service. Please try again.',
        ),
      });
    } finally {
      setStatusUpdatingByService((prev) => {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      });
    }
  };

  const toggleSubServiceStatus = async (
    subServiceId: string,
    parentServiceId: string,
    nextActive: boolean,
  ) => {
    if (!subServiceId || statusUpdatingBySubService[subServiceId]) return;

    setStatusUpdatingBySubService((prev) => ({ ...prev, [subServiceId]: true }));

    const previousServices = services;
    const previousSubServicesByService = subServicesByService;

    setServices((prev) =>
      prev.map((service) => ({
        ...service,
        subServices: service.subServices.map((subService) =>
          subService.id === subServiceId ? { ...subService, isActive: nextActive } : subService,
        ),
      })),
    );
    setSubServicesByService((prev) => {
      const scoped = prev[parentServiceId];
      if (!scoped) return prev;

      return {
        ...prev,
        [parentServiceId]: scoped.map((subService) =>
          subService.id === subServiceId ? { ...subService, isActive: nextActive } : subService,
        ),
      };
    });

    try {
      if (nextActive) {
        await axiosInstance.patch(`/subservices/${subServiceId}/restore`);
      } else {
        await axiosInstance.patch(`/subservices/${subServiceId}/soft-delete`);
      }

      setToast({
        type: 'success',
        message: nextActive
          ? 'Sub service activated successfully.'
          : 'Sub service deactivated successfully.',
      });
    } catch (error) {
      setServices(previousServices);
      setSubServicesByService(previousSubServicesByService);
      setToast({
        type: 'error',
        message: getErrorMessage(
          error,
          nextActive
            ? 'Failed to activate sub service. Please try again.'
            : 'Failed to deactivate sub service. Please try again.',
        ),
      });
    } finally {
      setStatusUpdatingBySubService((prev) => {
        const next = { ...prev };
        delete next[subServiceId];
        return next;
      });
    }
  };

  const fetchSubServicesByService = async (serviceId: string) => {
    try {
      setSubServicesLoadingByService((prev) => ({ ...prev, [serviceId]: true }));
      setSubServicesErrorByService((prev) => ({ ...prev, [serviceId]: '' }));

      let res;
      try {
        res = await axiosInstance.get(`/subservices/service/${serviceId}?includeDeleted=true`);
      } catch {
        res = await axiosInstance.get(`/subservices/service/${serviceId}`);
      }
      const payload = (res.data?.data ?? res.data ?? []) as ApiSubService[];
      const normalized = Array.isArray(payload)
        ? payload
            .map((subService) => normalizeSubService(subService, serviceId))
            .filter((subService) => subService.id)
        : [];

      setSubServicesByService((prev) => ({ ...prev, [serviceId]: normalized }));
      setServices((prev) =>
        prev.map((service) =>
          service.id === serviceId ? { ...service, subServices: normalized } : service,
        ),
      );
    } catch (error) {
      setSubServicesErrorByService((prev) => ({
        ...prev,
        [serviceId]: getErrorMessage(error, 'Failed to load sub services.'),
      }));
      setSubServicesByService((prev) => ({ ...prev, [serviceId]: [] }));
    } finally {
      setSubServicesLoadingByService((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  const handleToggleAccordion = (serviceId: string) => {
    if (expandedServiceId === serviceId) {
      setExpandedServiceId(null);
      return;
    }

    setExpandedServiceId(serviceId);
    void fetchSubServicesByService(serviceId);
  };

  const tableRows = useMemo<ServiceTableRow[]>(() => {
    const rows: ServiceTableRow[] = [];

    services.forEach((service) => {
      const isExpanded = expandedServiceId === service.id;
      const subServices = subServicesByService[service.id] ?? service.subServices;
      const subServicesLoading = subServicesLoadingByService[service.id] ?? false;
      const subServicesError = subServicesErrorByService[service.id] ?? '';

      rows.push({
        id: `service-${service.id}`,
        rowKind: 'service',
        serviceId: service.id,
        entityId: service.id,
        title: service.title,
        name: service.name,
        slug: service.slug,
        imageUrl: service.imageUrl,
        description: service.description,
        isActive: service.isActive,
        isExpanded,
      });

      if (!isExpanded) {
        return;
      }

      if (subServicesLoading) {
        rows.push({
          id: `service-${service.id}-loading`,
          rowKind: 'meta',
          serviceId: service.id,
          title: '',
          name: '',
          slug: '',
          description: 'Loading sub services...',
        });
        return;
      }

      if (subServicesError) {
        rows.push({
          id: `service-${service.id}-error`,
          rowKind: 'meta',
          serviceId: service.id,
          title: '',
          name: '',
          slug: '',
          description: subServicesError,
        });
        return;
      }

      if (subServices.length === 0) {
        rows.push({
          id: `service-${service.id}-empty`,
          rowKind: 'meta',
          serviceId: service.id,
          title: '',
          name: '',
          slug: '',
          description: 'No sub services found.',
        });
        return;
      }

      subServices.forEach((subService, index) => {
        rows.push({
          id: `subservice-${subService.id}`,
          rowKind: 'subservice',
          serviceId: service.id,
          parentServiceId: subService.serviceId,
          entityId: subService.id,
          title: subService.title,
          name: subService.name,
          slug: subService.slug,
          imageUrl: subService.imageUrl,
          description: subService.description,
          isActive: subService.isActive,
          subIndex: index + 1,
        });
      });
    });

    return rows;
  }, [
    expandedServiceId,
    services,
    subServicesByService,
    subServicesErrorByService,
    subServicesLoadingByService,
  ]);

  const columns: Column<ServiceTableRow>[] = [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        render: (_value, row) => {
          if (row.rowKind === 'meta') {
            return <span className="pl-8 text-sm text-slate-500">{row.description}</span>;
          }

          if (row.rowKind === 'subservice') {
            return (
              <div className="flex min-w-[260px] items-center gap-3 pl-8">
                <span className="w-6 text-sm text-slate-500">{row.subIndex}</span>
                {row.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.imageUrl}
                    alt={getLabel(row.title, row.name)}
                    className="h-10 w-10 rounded-xl border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    {getAvatarText(row.title, row.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{getLabel(row.title, row.name)}</p>
                  <p className="text-xs text-slate-500">Sub Service</p>
                </div>
              </div>
            );
          }

          return (
            <div className="flex min-w-[260px] items-center gap-3">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggleAccordion(row.serviceId);
                }}
                className="rounded-md p-1.5 text-slate-700 hover:bg-slate-100"
                aria-label={row.isExpanded ? 'Collapse sub services' : 'Expand sub services'}
              >
                {row.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {row.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.imageUrl}
                  alt={getLabel(row.title, row.name)}
                  className="h-10 w-10 rounded-xl border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
                  {getAvatarText(row.title, row.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{getLabel(row.title, row.name)}</p>
                <p className="text-xs text-slate-500">Service</p>
              </div>
            </div>
          );
        },
      },
      {
        key: 'slug',
        label: 'Service Name',
        sortable: true,
        render: (value, row) =>
          row.rowKind === 'meta' ? (
            '-'
          ) : (
            <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700">
              {value}
            </span>
          ),
      },
      {
        key: 'description',
        label: 'Description',
        sortable: true,
        render: (value, row) =>
          row.rowKind === 'meta' ? (
            <span className="text-sm text-slate-500">{value}</span>
          ) : (
            <span className="line-clamp-1 text-slate-600">{getDescription(String(value ?? ''))}</span>
          ),
      },
      {
        key: 'isActive',
        label: 'Status',
        sortable: true,
        render: (_value, row) => {
          if (row.rowKind === 'meta' || typeof row.isActive !== 'boolean') {
            return '-';
          }

          const isServiceRow = row.rowKind === 'service';
          const isSubServiceRow = row.rowKind === 'subservice';
          const subServiceId = row.entityId ?? '';
          const isServiceUpdating = isServiceRow ? !!statusUpdatingByService[row.serviceId] : false;
          const isSubServiceUpdating = isSubServiceRow
            ? !!statusUpdatingBySubService[subServiceId]
            : false;
          const isUpdating = isServiceUpdating || isSubServiceUpdating;

          return (
            <div className="flex items-center gap-2">
              {isServiceRow ? (
                <button
                  type="button"
                  onClick={() => void toggleServiceStatus(row.serviceId, !row.isActive)}
                  disabled={isUpdating}
                  aria-busy={isUpdating}
                  className={`inline-flex h-6 w-10 items-center rounded-full p-1 transition-opacity ${
                    row.isActive ? 'bg-slate-900' : 'bg-slate-300'
                  } ${isUpdating ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-white transition ${
                        row.isActive ? 'ml-auto' : ''
                      }`}
                    />
                  </button>
              ) : isSubServiceRow ? (
                <button
                  type="button"
                  onClick={() =>
                    void toggleSubServiceStatus(
                      subServiceId,
                      row.parentServiceId ?? row.serviceId,
                      !row.isActive,
                    )
                  }
                  disabled={isUpdating || !subServiceId}
                  aria-busy={isUpdating}
                  className={`inline-flex h-6 w-10 items-center rounded-full p-1 transition-opacity ${
                    row.isActive ? 'bg-slate-900' : 'bg-slate-300'
                  } ${isUpdating ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white transition ${
                      row.isActive ? 'ml-auto' : ''
                    }`}
                  />
                </button>
              ) : (
                '-'
              )}
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {row.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          );
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_value, row) => {
          if (row.rowKind === 'meta') {
            return '-';
          }

          if (row.rowKind === 'subservice') {
            const subService: SubService = {
              id: row.entityId ?? '',
              serviceId: row.parentServiceId ?? row.serviceId,
              title: row.title,
              name: row.name,
              slug: row.slug,
              imageUrl: row.imageUrl ?? null,
              description: row.description,
              isActive: row.isActive ?? true,
            };

            return (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEditSubService(subService)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View
                </button>
                {subService.isActive && (
                  <button
                    type="button"
                    onClick={() => handleEditSubService(subService)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                )}
              </div>
            );
          }

          const service: Service = {
            id: row.entityId ?? '',
            title: row.title,
            name: row.name,
            slug: row.slug,
            imageUrl: row.imageUrl ?? null,
            description: row.description,
            isActive: row.isActive ?? true,
            subServices: [],
          };

          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleEditService(service)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                View
              </button>
              {service.isActive && (
                <button
                  type="button"
                  onClick={() => handleEditService(service)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
              )}
            </div>
          );
        },
      },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Services</h1>
      </div>

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => router.push('/admin/services/create')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          <Plus size={18} />
          Create Service
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Loading services...
        </div>
      ) : (
        <DataTable data={tableRows} columns={columns} />
      )}
    </div>
  );
}

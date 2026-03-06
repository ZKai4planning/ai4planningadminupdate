'use client';

import { Fragment, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Search, Plus, Zap, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '@/app/lib/axiosinstance';

type SubService = {
  id: string;
  serviceId: string;
  title: string;
  name: string;
  description: string;
  isActive: boolean;
};

type Service = {
  id: string;
  title: string;
  name: string;
  description: string;
  isActive: boolean;
  subServices: SubService[];
};

type ServiceFormState = {
  title: string;
  name: string;
  description: string;
  image: File | null;
};

type ApiSubService = {
  id?: string;
  _id?: string;
  subServiceId?: string;
  serviceId?: string;
  title?: string;
  name?: string;
  subServiceName?: string;
  description?: string;
  isActive?: boolean;
  status?: boolean;
};

type ApiService = {
  id?: string;
  _id?: string;
  serviceId?: string;
  title?: string;
  name?: string;
  serviceName?: string;
  description?: string;
  isActive?: boolean;
  status?: boolean;
  subServices?: ApiSubService[];
};

const EMPTY_SERVICE_FORM: ServiceFormState = {
  title: '',
  name: '',
  description: '',
  image: null,
};

const FALLBACK_UPDATE_STATUS_CODES = [404, 405, 415];

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || fallback;
};

const getStatusCode = (error: unknown) => {
  const err = error as { response?: { status?: number } };
  return err?.response?.status;
};

const normalizeSubService = (subService: ApiSubService, fallbackServiceId = ''): SubService => ({
  id: subService.subServiceId ?? subService.id ?? subService._id ?? '',
  serviceId: subService.serviceId ?? fallbackServiceId,
  title: subService.title ?? '',
  name: subService.name ?? subService.subServiceName ?? '',
  description: subService.description ?? '',
  isActive: subService.isActive ?? subService.status ?? true,
});

const normalizeService = (service: ApiService): Service => ({
  id: service.serviceId ?? service.id ?? service._id ?? '',
  title: service.title ?? '',
  name: service.name ?? service.serviceName ?? '',
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

const buildServiceFormData = (formData: ServiceFormState, useMethodOverride = false) => {
  const data = new FormData();

  data.append('title', formData.title.trim());
  data.append('serviceName', formData.name.trim());
  data.append('name', formData.name.trim());
  data.append('description', formData.description.trim());

  if (useMethodOverride) {
    data.append('_method', 'PUT');
  }

  if (formData.image) {
    data.append('images', formData.image);
  }

  return data;
};

const buildCreateSubServiceFormData = (
  parentServiceId: string,
  formData: ServiceFormState,
) => {
  const data = new FormData();
  data.append('serviceId', parentServiceId);
  data.append('title', formData.title.trim());
  data.append('serviceName', formData.name.trim());
  data.append('description', formData.description.trim());

  if (formData.image) {
    data.append('images', formData.image);
  }

  return data;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [modalEntityType, setModalEntityType] = useState<'service' | 'subservice'>('service');
  const [selectedParentServiceId, setSelectedParentServiceId] = useState('');

  const [serviceFormData, setServiceFormData] = useState<ServiceFormState>(EMPTY_SERVICE_FORM);
  const [serviceFormError, setServiceFormError] = useState('');
  const [serviceSaving, setServiceSaving] = useState(false);
  const [serviceImagePreview, setServiceImagePreview] = useState<string | null>(null);

  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [subServicesByService, setSubServicesByService] = useState<Record<string, SubService[]>>({});
  const [subServicesLoadingByService, setSubServicesLoadingByService] = useState<
    Record<string, boolean>
  >({});
  const [subServicesErrorByService, setSubServicesErrorByService] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (!serviceFormData.image) {
      setServiceImagePreview(null);
      return;
    }

    const preview = URL.createObjectURL(serviceFormData.image);
    setServiceImagePreview(preview);

    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [serviceFormData.image]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setListError('');

      const res = await axiosInstance.get('/services');
      const payload = (res.data?.data ?? res.data ?? []) as ApiService[];
      const normalized = Array.isArray(payload)
        ? payload.map(normalizeService).filter((service) => service.id)
        : [];

      setServices(normalized);
    } catch (error) {
      setListError(getErrorMessage(error, 'Failed to load services.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return services;

    return services.filter((service) => {
      const title = service.title.toLowerCase();
      const name = service.name.toLowerCase();
      const description = service.description.toLowerCase();
      return title.includes(term) || name.includes(term) || description.includes(term);
    });
  }, [services, searchTerm]);

  const resetServiceForm = () => {
    setEditingServiceId(null);
    setModalEntityType('service');
    setSelectedParentServiceId('');
    setServiceFormData(EMPTY_SERVICE_FORM);
    setServiceFormError('');
  };

  const closeServiceModal = () => {
    setShowServiceModal(false);
    resetServiceForm();
  };

  const openCreateServiceModal = () => {
    resetServiceForm();
    setShowServiceModal(true);
  };

  const openCreateSubServiceModal = () => {
    resetServiceForm();
    setModalEntityType('subservice');
    setSelectedParentServiceId(services[0]?.id ?? '');
    setShowServiceModal(true);
  };

  const handleServiceInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setServiceFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setServiceFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const createService = async (payload: ServiceFormState) => {
    await axiosInstance.post('/services', buildServiceFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const updateService = async (id: string, payload: ServiceFormState) => {
    const url = `/services/${id}`;
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };

    try {
      await axiosInstance.put(url, buildServiceFormData(payload), config);
      return;
    } catch (error) {
      const status = getStatusCode(error);
      if (!status || !FALLBACK_UPDATE_STATUS_CODES.includes(status)) {
        throw error;
      }
    }

    try {
      await axiosInstance.patch(url, buildServiceFormData(payload), config);
      return;
    } catch (error) {
      const status = getStatusCode(error);
      if (!status || !FALLBACK_UPDATE_STATUS_CODES.includes(status)) {
        throw error;
      }
    }

    await axiosInstance.post(url, buildServiceFormData(payload, true), config);
  };

  const handleSaveService = async () => {
    if (serviceSaving) return;

    const isCreatingSubServiceFromModal =
      !editingServiceId && modalEntityType === 'subservice';

    if (isCreatingSubServiceFromModal && !selectedParentServiceId) {
      setServiceFormError('Please choose a main service.');
      return;
    }

    const title = serviceFormData.title.trim();
    const name = serviceFormData.name.trim();
    const description = serviceFormData.description.trim();
    if (!title || !name || !description) {
      setServiceFormError('Title, service name, and description are required.');
      return;
    }

    const payload: ServiceFormState = {
      ...serviceFormData,
      title,
      name,
      description,
    };

    setServiceSaving(true);
    setServiceFormError('');

    try {
      if (isCreatingSubServiceFromModal) {
        await createSubService(selectedParentServiceId, payload);
      } else if (editingServiceId) {
        await updateService(editingServiceId, payload);
      } else {
        await createService(payload);
      }

      await fetchServices();
      if (isCreatingSubServiceFromModal && expandedServiceId === selectedParentServiceId) {
        await fetchSubServicesByService(selectedParentServiceId);
      }
      closeServiceModal();
    } catch (error) {
      setServiceFormError(
        getErrorMessage(
          error,
          isCreatingSubServiceFromModal
            ? 'Failed to add sub service. Please try again.'
            : editingServiceId
            ? 'Failed to update service. Please try again.'
            : 'Failed to add service. Please try again.',
        ),
      );
    } finally {
      setServiceSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;

    try {
      await axiosInstance.patch(`/services/${id}/soft-delete`);
      await fetchServices();
    } catch (error) {
      setListError(getErrorMessage(error, 'Failed to delete service.'));
    }
  };

  const handleEditService = (service: Service) => {
    setServiceFormData({
      title: service.title,
      name: service.name,
      description: service.description,
      image: null,
    });
    setModalEntityType('service');
    setSelectedParentServiceId('');
    setServiceFormError('');
    setEditingServiceId(service.id);
    setShowServiceModal(true);
  };

  const fetchSubServicesByService = async (serviceId: string) => {
    try {
      setSubServicesLoadingByService((prev) => ({ ...prev, [serviceId]: true }));
      setSubServicesErrorByService((prev) => ({ ...prev, [serviceId]: '' }));

      const res = await axiosInstance.get(`/subservices/service/${serviceId}`);
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
      return normalized;
    } catch (error) {
      setSubServicesErrorByService((prev) => ({
        ...prev,
        [serviceId]: getErrorMessage(error, 'Failed to load sub services.'),
      }));
      setSubServicesByService((prev) => ({ ...prev, [serviceId]: [] }));
      return [];
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

  const createSubService = async (serviceId: string, payload: ServiceFormState) => {
    await axiosInstance.post('/services', buildCreateSubServiceFormData(serviceId, payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Services</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border py-2 pl-10 pr-4"
          />
        </div>

        <button
          onClick={openCreateServiceModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          <Plus size={18} />
          Add Service
        </button>

        <button
          onClick={openCreateSubServiceModal}
          className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-white"
        >
          <Plus size={18} />
          Add Sub Service
        </button>
      </div>

      {listError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {listError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-white">
        {loading ? (
          <div className="p-6 text-center">Loading services...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-left">S.No</th>
                <th className="p-4 text-left">Service</th>
                <th className="p-4 text-left">Sub Services</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredServices.map((service, index) => {
                const isExpanded = expandedServiceId === service.id;
                const subServices = subServicesByService[service.id] ?? service.subServices;
                const subServicesLoading = subServicesLoadingByService[service.id] ?? false;
                const subServicesError = subServicesErrorByService[service.id] ?? '';

                return (
                  <Fragment key={service.id}>
                    <tr className="border-b">
                      <td className="p-4">{index + 1}</td>

                      <td className="p-4">
                        <p className="font-bold">{service.title}</p>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <p className="text-xs text-gray-500">Service ID: {service.id}</p>
                      </td>

                      <td className="p-4">{subServices.length}</td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            service.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleToggleAccordion(service.id)}
                            className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                          >
                            {isExpanded ? 'Hide' : 'Sub Services'}
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          <button
                            onClick={() => handleEditService(service)}
                            className="rounded bg-blue-100 p-2 text-blue-600"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="rounded bg-red-100 p-2 text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="border-b bg-slate-50/60">
                        <td colSpan={5} className="p-4">
                          <div className="rounded-lg border bg-white p-4">
                            <h3 className="mb-3 text-base font-semibold">Sub Services</h3>

                            {subServicesError && (
                              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {subServicesError}
                              </div>
                            )}

                            <div className="mt-4 overflow-hidden rounded-lg border">
                              {subServicesLoading ? (
                                <div className="p-4 text-sm text-gray-600">Loading sub services...</div>
                              ) : subServices.length === 0 ? (
                                <div className="p-4 text-sm text-gray-600">No sub services found.</div>
                              ) : (
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b bg-gray-50">
                                      <th className="p-3 text-left text-xs">Title</th>
                                      <th className="p-3 text-left text-xs">Name</th>
                                      <th className="p-3 text-left text-xs">Description</th>
                                      <th className="p-3 text-left text-xs">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {subServices.map((subService) => (
                                      <tr key={subService.id} className="border-b">
                                        <td className="p-3 text-sm">
                                          <p className="font-medium">{subService.title}</p>
                                          <p className="text-xs text-gray-500">ID: {subService.id}</p>
                                        </td>
                                        <td className="p-3 text-sm">{subService.name}</td>
                                        <td className="p-3 text-sm text-gray-600">
                                          {subService.description}
                                        </td>
                                        <td className="p-3 text-sm">
                                          <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                              subService.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-600'
                                            }`}
                                          >
                                            {subService.isActive ? 'Active' : 'Inactive'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-sm text-gray-500">
                    No services found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showServiceModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">
              {editingServiceId
                ? 'Edit Service'
                : modalEntityType === 'subservice'
                  ? 'Add Sub Service'
                  : 'Add Service'}
            </h2>

            <div className="space-y-4">
              {!editingServiceId && (
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">Create Type</p>
                  <select
                    value={modalEntityType}
                    onChange={(e) => {
                      const nextType = e.target.value as 'service' | 'subservice';
                      setModalEntityType(nextType);
                      setServiceFormError('');
                      if (nextType === 'subservice' && !selectedParentServiceId) {
                        setSelectedParentServiceId(services[0]?.id ?? '');
                      }
                      if (nextType === 'service') {
                        setSelectedParentServiceId('');
                      }
                    }}
                    className="w-full rounded-lg border px-4 py-2"
                  >
                    <option value="service">Main Service</option>
                    <option value="subservice">Sub Service</option>
                  </select>
                </div>
              )}

              {!editingServiceId && modalEntityType === 'subservice' && (
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">Main Service</p>
                  <select
                    value={selectedParentServiceId}
                    onChange={(e) => setSelectedParentServiceId(e.target.value)}
                    className="w-full rounded-lg border px-4 py-2"
                  >
                    <option value="">Select Main Service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.title} - {service.name} ({service.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <input
                name="title"
                value={serviceFormData.title}
                onChange={handleServiceInputChange}
                placeholder="Title"
                className="w-full rounded-lg border px-4 py-2"
              />

              <input
                name="name"
                value={serviceFormData.name}
                onChange={handleServiceInputChange}
                placeholder={modalEntityType === 'subservice' ? 'Sub Service Name' : 'Service Name'}
                className="w-full rounded-lg border px-4 py-2"
              />

              <textarea
                name="description"
                value={serviceFormData.description}
                onChange={handleServiceInputChange}
                placeholder="Description"
                rows={4}
                className="w-full rounded-lg border px-4 py-2"
              />

              <input type="file" accept="image/*" onChange={handleServiceImageChange} />

              {serviceImagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={serviceImagePreview} alt="Selected service" className="h-24 rounded" />
              )}
            </div>

            {serviceFormError && (
              <p className="mt-4 text-sm font-medium text-red-600">{serviceFormError}</p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => void handleSaveService()}
                disabled={serviceSaving}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-white disabled:opacity-60"
              >
                {serviceSaving
                  ? editingServiceId
                    ? 'Saving...'
                    : 'Adding...'
                  : editingServiceId
                    ? 'Save'
                    : modalEntityType === 'subservice'
                      ? 'Add Sub Service'
                      : 'Add Service'}
              </button>

              <button
                onClick={closeServiceModal}
                disabled={serviceSaving}
                className="flex-1 rounded-lg border py-2 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

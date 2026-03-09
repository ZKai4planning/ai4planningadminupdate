'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, FolderTree, ImageUp, Loader2, Upload } from 'lucide-react';
import axiosInstance from '@/app/lib/axiosinstance';

type CreateMode = 'service' | 'subservice';

type ServiceFormState = {
  title: string;
  name: string;
  description: string;
  image: File | null;
};

type ApiService = {
  id?: string;
  _id?: string;
  serviceId?: string;
  title?: string;
  name?: string;
  serviceName?: string;
};

type ParentServiceOption = {
  id: string;
  title: string;
  name: string;
};

const EMPTY_SERVICE_FORM: ServiceFormState = {
  title: '',
  name: '',
  description: '',
  image: null,
};

const MAX_DESCRIPTION_LENGTH = 500;
const FALLBACK_UPDATE_STATUS_CODES = [404, 405, 415];

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || fallback;
};

const getStatusCode = (error: unknown) => {
  const err = error as { response?: { status?: number } };
  return err?.response?.status;
};

const normalizeServiceOption = (service: ApiService): ParentServiceOption => ({
  id: service.serviceId ?? service.id ?? service._id ?? '',
  title: service.title ?? '',
  name: service.name ?? service.serviceName ?? '',
});

const buildCreateServiceFormData = (formData: ServiceFormState) => {
  const data = new FormData();
  data.append('title', formData.title.trim());
  data.append('serviceName', formData.name.trim());
  data.append('name', formData.name.trim());
  data.append('description', formData.description.trim());

  if (formData.image) {
    data.append('images', formData.image);
  }

  return data;
};

const buildCreateSubServiceFormData = (parentServiceId: string, formData: ServiceFormState) => {
  const data = new FormData();
  data.append('serviceId', parentServiceId);
  data.append('title', formData.title.trim());
  data.append('serviceName', formData.name.trim());
  data.append('name', formData.name.trim());
  data.append('description', formData.description.trim());

  if (formData.image) {
    data.append('images', formData.image);
  }

  return data;
};

const buildUpdateFormData = (
  formData: ServiceFormState,
  useMethodOverride = false,
  parentServiceId?: string,
) => {
  const data = new FormData();
  data.append('title', formData.title.trim());
  data.append('serviceName', formData.name.trim());
  data.append('name', formData.name.trim());
  data.append('description', formData.description.trim());

  if (parentServiceId) {
    data.append('serviceId', parentServiceId);
  }

  if (useMethodOverride) {
    data.append('_method', 'PUT');
  }

  if (formData.image) {
    data.append('images', formData.image);
  }

  return data;
};

export default function CreateServicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const modeFromQuery =
    searchParams.get('type') === 'subservice' ? ('subservice' as CreateMode) : ('service' as CreateMode);
  const isEditMode = searchParams.get('mode') === 'edit';
  const editingId = searchParams.get('id') ?? '';
  const initialParentFromQuery = searchParams.get('parentServiceId') ?? '';

  const prefillTitle = searchParams.get('title') ?? '';
  const prefillName = searchParams.get('name') ?? '';
  const prefillDescription = searchParams.get('description') ?? '';
  const prefillImageUrl = searchParams.get('imageUrl') ?? '';

  const [createType, setCreateType] = useState<CreateMode>(modeFromQuery);
  const [serviceFormData, setServiceFormData] = useState<ServiceFormState>(EMPTY_SERVICE_FORM);
  const [selectedParentServiceId, setSelectedParentServiceId] = useState(initialParentFromQuery);
  const [parentServices, setParentServices] = useState<ParentServiceOption[]>([]);
  const [parentServicesLoading, setParentServicesLoading] = useState(false);
  const [parentServicesError, setParentServicesError] = useState('');

  const [serviceSaving, setServiceSaving] = useState(false);
  const [serviceFormError, setServiceFormError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [serviceImagePreview, setServiceImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(prefillImageUrl || null);

  const isSubService = createType === 'subservice';

  useEffect(() => {
    setCreateType(modeFromQuery);
  }, [modeFromQuery]);

  useEffect(() => {
    if (!isEditMode) {
      setServiceFormData(EMPTY_SERVICE_FORM);
      setExistingImageUrl(null);
      return;
    }

    setServiceFormData({
      title: prefillTitle,
      name: prefillName,
      description: prefillDescription,
      image: null,
    });
    setExistingImageUrl(prefillImageUrl || null);

    if (modeFromQuery === 'subservice') {
      setSelectedParentServiceId(initialParentFromQuery);
    }
  }, [
    initialParentFromQuery,
    isEditMode,
    modeFromQuery,
    prefillDescription,
    prefillImageUrl,
    prefillName,
    prefillTitle,
  ]);

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

  useEffect(() => {
    if (!isSubService) {
      setParentServices([]);
      setParentServicesError('');
      setSelectedParentServiceId('');
      return;
    }

    const fetchParentServices = async () => {
      try {
        setParentServicesLoading(true);
        setParentServicesError('');
        const res = await axiosInstance.get('/services');
        const payload = (res.data?.data ?? res.data ?? []) as ApiService[];
        const normalized = Array.isArray(payload)
          ? payload.map(normalizeServiceOption).filter((service) => service.id)
          : [];
        setParentServices(normalized);

        setSelectedParentServiceId((prev) => {
          if (normalized.some((service) => service.id === prev)) {
            return prev;
          }

          return normalized.some((service) => service.id === initialParentFromQuery)
            ? initialParentFromQuery
            : normalized[0]?.id ?? '';
        });
      } catch (error) {
        setParentServices([]);
        setParentServicesError(getErrorMessage(error, 'Failed to load main services.'));
      } finally {
        setParentServicesLoading(false);
      }
    };

    void fetchParentServices();
  }, [initialParentFromQuery, isSubService]);

  const pageTitle = useMemo(() => {
    if (isEditMode) {
      return isSubService ? 'Edit Sub Service' : 'Edit Service';
    }

    return isSubService ? 'Create Sub Service' : 'Create Service';
  }, [isEditMode, isSubService]);

  const pageDescription = useMemo(() => {
    if (isEditMode) {
      return isSubService
        ? 'Update sub service details and parent mapping.'
        : 'Update main service information.';
    }

    return isSubService
      ? 'Add a sub service and connect it to a main service.'
      : 'Add a new main service for your offering catalog.';
  }, [isEditMode, isSubService]);

  const descriptionLength = serviceFormData.description.length;

  const handleServiceInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'description' && value.length > MAX_DESCRIPTION_LENGTH) {
      return;
    }

    setServiceFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateSelectedImage = (file: File | null) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setServiceFormError('Please choose a valid image file.');
      return;
    }

    setServiceFormError('');
    setServiceFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleServiceImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    updateSelectedImage(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    updateSelectedImage(file);
  };

  const updateEntity = async (
    id: string,
    payload: ServiceFormState,
    entityType: CreateMode,
    parentServiceId?: string,
  ) => {
    const basePath = entityType === 'subservice' ? '/subservices' : '/services';
    const url = `${basePath}/${id}`;
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };

    try {
      await axiosInstance.put(url, buildUpdateFormData(payload, false, parentServiceId), config);
      return;
    } catch (error) {
      const status = getStatusCode(error);
      if (!status || !FALLBACK_UPDATE_STATUS_CODES.includes(status)) {
        throw error;
      }
    }

    try {
      await axiosInstance.patch(url, buildUpdateFormData(payload, false, parentServiceId), config);
      return;
    } catch (error) {
      const status = getStatusCode(error);
      if (!status || !FALLBACK_UPDATE_STATUS_CODES.includes(status)) {
        throw error;
      }
    }

    await axiosInstance.post(url, buildUpdateFormData(payload, true, parentServiceId), config);
  };

  const handleSaveService = async () => {
    if (serviceSaving) return;

    const title = serviceFormData.title.trim();
    const name = serviceFormData.name.trim();
    const description = serviceFormData.description.trim();

    if (!title || !name || !description) {
      setServiceFormError('Title, service name, and description are required.');
      return;
    }

    if (isSubService && !selectedParentServiceId) {
      setServiceFormError('Please choose a parent service.');
      return;
    }

    if (isEditMode && !editingId) {
      setServiceFormError('Missing item id for editing.');
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
      if (isEditMode) {
        await updateEntity(
          editingId,
          payload,
          isSubService ? 'subservice' : 'service',
          isSubService ? selectedParentServiceId : undefined,
        );
      } else if (isSubService) {
        await axiosInstance.post('/services', buildCreateSubServiceFormData(selectedParentServiceId, payload), {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axiosInstance.post('/services', buildCreateServiceFormData(payload), {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      router.push('/admin/services');
    } catch (error) {
      setServiceFormError(
        getErrorMessage(
          error,
          isEditMode
            ? isSubService
              ? 'Failed to update sub service. Please try again.'
              : 'Failed to update service. Please try again.'
            : isSubService
              ? 'Failed to create sub service. Please try again.'
              : 'Failed to create service. Please try again.',
        ),
      );
    } finally {
      setServiceSaving(false);
    }
  };

  const displayedImagePreview = serviceImagePreview ?? existingImageUrl;

  return (
    <div className="space-y-6 p-2 md:p-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <button
              onClick={() => router.push('/admin/services')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
              aria-label="Back to services"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">{pageTitle}</h1>
              <p className="mt-1 text-sm text-slate-500">{pageDescription}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/admin/services')}
              disabled={serviceSaving}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleSaveService()}
              disabled={serviceSaving || (isSubService && !selectedParentServiceId)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {serviceSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {serviceSaving
                ? 'Saving...'
                : isEditMode
                  ? isSubService
                    ? 'Update Sub Service'
                    : 'Update Service'
                  : isSubService
                    ? 'Save Sub Service'
                    : 'Save Service'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                <ImageUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Upload Image</h2>
                <p className="mt-1 text-sm text-slate-500">Upload a service image (Max 10MB, JPG/PNG/GIF)</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleServiceImageChange}
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
              }}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition md:p-14 ${
                dragActive ? 'border-slate-400 bg-slate-50' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              {displayedImagePreview ? (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayedImagePreview}
                    alt="Selected service"
                    className="mx-auto h-48 max-h-48 rounded-xl border border-slate-200 object-cover"
                  />
                  <p className="text-sm text-slate-600">
                    {serviceFormData.image?.name ?? 'Current image'}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Upload className="h-4 w-4" />
                    Change Image
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200/70 text-slate-500">
                    <ImageUp className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-medium text-slate-700">Drag and drop your image here, or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Upload className="h-4 w-4" />
                    Browse Files
                  </button>
                  <p className="text-sm text-slate-500">Supported formats: JPG, PNG, GIF - Max size: 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Service Details</h2>
                <p className="mt-1 text-sm text-slate-500">Basic information about this service</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                Create Type <span className="text-red-500">*</span>
              </label>
              <select
                value={createType}
                onChange={(e) => {
                  const nextType = e.target.value as CreateMode;
                  setCreateType(nextType);
                  setServiceFormError('');
                }}
                disabled={isEditMode}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
              >
                <option value="service">Main Service</option>
                <option value="subservice">Sub Service</option>
              </select>
            </div>

            {isSubService && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FolderTree className="h-4 w-4 text-slate-500" />
                  Parent Service
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedParentServiceId}
                  onChange={(e) => setSelectedParentServiceId(e.target.value)}
                  disabled={parentServicesLoading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                >
                  <option value="">
                    {parentServicesLoading ? 'Loading main services...' : 'Select Main Service'}
                  </option>
                  {parentServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title} - {service.name} ({service.id})
                    </option>
                  ))}
                </select>
                {parentServicesError && <p className="text-sm text-red-600">{parentServicesError}</p>}
                {!parentServicesLoading && !parentServicesError && parentServices.length === 0 && (
                  <p className="text-sm text-amber-700">
                    No main services found. Please create a main service first.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={serviceFormData.title}
                onChange={handleServiceInputChange}
                placeholder={isSubService ? 'Enter sub service title' : 'Enter service title'}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                {isSubService ? 'Sub Service Name' : 'Service Name'} <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={serviceFormData.name}
                onChange={handleServiceInputChange}
                placeholder={isSubService ? 'Enter sub service name' : 'Enter service name'}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-900">
                  Description <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500">
                  {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
                </p>
              </div>
              <textarea
                name="description"
                value={serviceFormData.description}
                onChange={handleServiceInputChange}
                placeholder={isSubService ? 'Enter sub service description...' : 'Enter service description...'}
                rows={5}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {serviceFormError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {serviceFormError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

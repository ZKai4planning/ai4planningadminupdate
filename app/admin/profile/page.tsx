'use client';

import { useEffect, useMemo, useState } from 'react';
import { Camera, Loader2, Save } from 'lucide-react';
import axiosInstance from '@/app/lib/axiosinstance';
import {
  readCurrentAuth,
  resolveAuthEmail,
  resolveAuthName,
  resolveAuthUserId,
} from '@/app/lib/auth-session';

type ProfileData = {
  profileId?: string;
  userRefId?: string;
  name: string;
  email: string;
  phoneNumber: string;
  profilePicture: string;
};

const PROFILE_CACHE_KEY = 'adminProfile';

const emptyProfile: ProfileData = {
  name: '',
  email: '',
  phoneNumber: '',
  profilePicture: '',
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || fallback;
};

const getStatusCode = (error: unknown) => {
  const err = error as { response?: { status?: number } };
  return err?.response?.status;
};

const normalizeProfileData = (
  source: Record<string, unknown> | null | undefined,
  fallback: ProfileData,
): ProfileData => ({
  profileId: typeof source?.profileId === 'string' ? source.profileId : fallback.profileId,
  userRefId: typeof source?.userRefId === 'string' ? source.userRefId : fallback.userRefId,
  name: typeof source?.name === 'string' ? source.name : fallback.name,
  email: typeof source?.email === 'string' ? source.email : fallback.email,
  phoneNumber:
    typeof source?.phoneNumber === 'string' ? source.phoneNumber : fallback.phoneNumber,
  profilePicture:
    typeof source?.profilePicture === 'string' ? source.profilePicture : fallback.profilePicture,
});

const persistProfileCache = (profile: ProfileData) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event('admin-profile-updated'));
};

export default function ProfilePage() {
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const auth = readCurrentAuth();
      const resolvedUserId = resolveAuthUserId(auth);
      const fallbackProfile: ProfileData = {
        ...emptyProfile,
        name: resolveAuthName(auth),
        email: resolveAuthEmail(auth),
      };

      if (!resolvedUserId) {
        if (!isMounted) return;
        setProfile(fallbackProfile);
        setErrorMessage('Unable to resolve user ID from the current session.');
        setLoading(false);
        return;
      }

      if (!isMounted) return;
      setUserId(resolvedUserId);
      setProfile(fallbackProfile);
      setErrorMessage('');

      try {
        const response = await axiosInstance.get(`/admin/profile/${resolvedUserId}`);
        const data = (response?.data?.data ?? response?.data ?? {}) as Record<string, unknown>;
        const nextProfile = normalizeProfileData(data, fallbackProfile);
        if (!isMounted) return;
        setProfile(nextProfile);
        persistProfileCache(nextProfile);
      } catch (error) {
        if (!isMounted) return;
        if (getStatusCode(error) !== 404) {
          setErrorMessage(getErrorMessage(error, 'Failed to fetch profile.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const displayPicture = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (profile.profilePicture) return profile.profilePicture;
    return '';
  }, [previewUrl, profile.profilePicture]);

  const saveProfileDetails = async () => {
    const payload = {
      name: profile.name.trim(),
      email: profile.email.trim(),
      phoneNumber: profile.phoneNumber.trim(),
    };

    try {
      return await axiosInstance.put(`/admin/profile/${userId}`, payload);
    } catch (error) {
      const status = getStatusCode(error);
      if (status === 404 || status === 405) {
        return axiosInstance.post(`/admin/profile/${userId}`, payload);
      }
      throw error;
    }
  };

  const uploadPictureByField = async (field: string, file: File) => {
    const formData = new FormData();
    formData.append(field, file);

    try {
      return await axiosInstance.post(`/admin/profile/${userId}/picture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      const status = getStatusCode(error);
      if (status === 404 || status === 405) {
        return axiosInstance.put(`/admin/profile/${userId}/picture`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      throw error;
    }
  };

  const handleDetailsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || saving) return;

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await saveProfileDetails();
      const data = (response?.data?.data ?? response?.data ?? {}) as Record<string, unknown>;
      const nextProfile = normalizeProfileData(data, profile);
      setProfile(nextProfile);
      persistProfileCache(nextProfile);
      setSuccessMessage('Profile details saved successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to save profile details.'));
    } finally {
      setSaving(false);
    }
  };

  const handlePictureUpload = async () => {
    if (!userId || !selectedFile || uploading) return;

    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let response;
      try {
        response = await uploadPictureByField('profilePicture', selectedFile);
      } catch (error) {
        const status = getStatusCode(error);
        if (status === 400 || status === 422) {
          response = await uploadPictureByField('picture', selectedFile);
        } else {
          throw error;
        }
      }

      const data = (response?.data?.data ?? response?.data ?? {}) as Record<string, unknown>;
      const imageFromApi =
        (typeof data?.profilePicture === 'string' && data.profilePicture) ||
        (typeof data?.picture === 'string' && data.picture) ||
        (typeof data?.url === 'string' && data.url) ||
        '';

      const nextProfile = {
        ...profile,
        profilePicture: imageFromApi || profile.profilePicture,
      };

      setProfile(nextProfile);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
      persistProfileCache(nextProfile);
      setSuccessMessage('Profile picture updated successfully.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to upload profile picture.'));
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        <p className="mt-2 text-slate-600">
          Update your personal details and profile picture.
        </p>
      </div>

      {(errorMessage || successMessage) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            errorMessage
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {errorMessage || successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Profile Picture</p>
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-2xl font-semibold text-slate-700">
              {displayPicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayPicture}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                (profile.name || profile.email || 'A').charAt(0).toUpperCase()
              )}
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Camera className="h-4 w-4" />
              Select Picture
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <p className="text-xs text-slate-500">{selectedFile.name}</p>
            )}

            <button
              type="button"
              onClick={handlePictureUpload}
              disabled={!selectedFile || uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {uploading ? 'Uploading...' : 'Upload Picture'}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <p className="text-sm font-semibold text-slate-900">Profile Details</p>
          <form onSubmit={handleDetailsSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="John Doe"
                required
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="john@example.com"
                required
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={profile.phoneNumber}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, phoneNumber: event.target.value }))
                }
                placeholder="+15551234567"
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

          

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

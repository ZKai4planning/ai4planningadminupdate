'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { mockServices } from '@/app/lib/mock-data';
import type { Service } from '@/types';

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [expandedServices, setExpandedServices] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'residential' as const,
    price: '',
    duration: '',
    images: [] as File[],
  });

  const filteredServices = mockServices.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'extension', label: 'Extension' },
    { value: 'consultation', label: 'Consultation' },
  ];

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      residential: 'bg-blue-100 text-blue-700',
      commercial: 'bg-purple-100 text-purple-700',
      extension: 'bg-orange-100 text-orange-700',
      consultation: 'bg-emerald-100 text-emerald-700',
    };
    return colors[category] || colors.residential;
  };

  const toggleExpand = (serviceId: string) => {
    setExpandedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleAddService = () => {
    if (formData.name && formData.category && formData.price && formData.duration && formData.images.length > 0) {
      alert('Service added successfully!');
      setFormData({ name: '', description: '', category: 'residential', price: '', duration: '', images: [] });
      setShowAddModal(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFormData((prev) => {
      const combined = [...prev.images, ...files];
      const limited = combined.slice(0, 5);
      return { ...prev, images: limited };
    });
    e.target.value = '';
  };

  const removeImageAt = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const imagePreviews = useMemo(
    () => formData.images.map((file) => URL.createObjectURL(file)),
    [formData.images]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Services</h1>
        </div>
        <p className="text-slate-600">Manage all planning services and sub-services.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase">Total Services</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{mockServices.length}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{mockServices.filter(s => s.isActive).length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase">Sub-Services</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{mockServices.reduce((sum, s) => sum + s.subServices.length, 0)}</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase">Avg Price</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">£{Math.round(mockServices.reduce((sum, s) => sum + s.price, 0) / mockServices.length)}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Service</span>
          </button>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500">No services found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Service Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Sub-Services</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service, idx) => (
                  <>
                    <tr key={service.id} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{service.name}</p>
                        <p className="text-sm text-slate-600 line-clamp-1">{service.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getCategoryBadge(service.category)}`}>
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-emerald-600">£{service.price.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-900">{service.duration}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{service.subServices.length}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          service.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleExpand(service.id)}
                          className="p-2 hover:bg-slate-200 rounded-lg transition-colors inline-flex"
                        >
                          {expandedServices.includes(service.id) ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Sub-Services Expansion */}
                    {expandedServices.includes(service.id) && (
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <td colSpan={7} className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-900 mb-3">Sub-Services:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {service.subServices.map((subService) => (
                              <div key={subService.id} className="bg-white border border-slate-200 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <p className="font-medium text-slate-900">{subService.name}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                                    subService.isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {subService.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mb-2">{subService.description}</p>
                                <div className="flex items-center justify-between text-sm text-slate-700">
                                  <span>£{subService.price}</span>
                                  <span>{subService.estimatedHours}h</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Service</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Residential Planning Application"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Price (£)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 599"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 4-6 weeks"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Service description..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Images</label>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const preview = imagePreviews[idx];
                    return (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center text-xs text-slate-400 relative"
                      >
                        {preview ? (
                          <div className="relative w-full h-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={preview} alt={`Selected image ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImageAt(idx)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center hover:bg-red-700"
                              aria-label={`Remove image ${idx + 1}`}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-full flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-600">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImagesChange}
                              className="hidden"
                            />
                            <span>Upload</span>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.images.length > 0
                    ? `${formData.images.length} image${formData.images.length !== 1 ? 's' : ''} selected`
                    : 'Select one or more images (up to 5).'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleAddService}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={18} />
                Create Service
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-900"
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

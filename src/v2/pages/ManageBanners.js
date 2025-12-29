import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiEye, FiEyeOff, FiFlag, FiFilter } from 'react-icons/fi';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useTheme } from '../contexts/ThemeContext';
import SquaresApiService from '../services/squaresApiService';
import ConfirmModal from '../components/ui/ConfirmModal';
import Banner from '../components/ui/Banner';

/**
 * Manage Banners Page - V2 Implementation
 * Admin interface for creating and managing dynamic banners
 */
const ManageBanners = () => {
  const axiosService = useAxios();
  const { colors, isDark } = useTheme();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [message, setMessage] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPage, setFilterPage] = useState('');

  // Confirm modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'warning',
    onConfirm: () => {},
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    variant: 'primary',
    page: 'all',
    start_date: '',
    end_date: '',
    status: 'active',
    priority: 0,
    dismissible: false,
    action_text: '',
    action_url: '',
  });

  const pageOptions = [
    { value: 'all', label: 'All Pages' },
    { value: 'home', label: 'Home' },
    { value: 'squares', label: 'Squares' },
    { value: 'pools', label: 'Pools' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'leagues', label: 'Leagues' },
  ];

  const variantOptions = [
    { value: 'primary', label: 'Primary', color: colors.brand.primary },
    { value: 'success', label: 'Success', color: colors.success },
    { value: 'warning', label: 'Warning', color: colors.warning },
    { value: 'info', label: 'Info', color: colors.info },
    { value: 'promo', label: 'Promo', color: '#F59E0B' },
  ];

  const commonEmojis = ['🎉', '📢', '⚠️', '✨', '🏆', '🎁', '🔥', '💡', '📣', '🚀', 'ℹ️', '⭐'];

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const apiService = new SquaresApiService(axiosService);
      const result = await apiService.getBannersForAdmin();
      if (result.success) {
        setBanners(result.data || []);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to load banners' });
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      setMessage({ type: 'error', text: 'Failed to load banners. Please try again.' });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const apiService = new SquaresApiService(axiosService);
      const submitData = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      const result = editingBanner
        ? await apiService.updateBanner(editingBanner.id, submitData)
        : await apiService.createBanner(submitData);

      if (result.success) {
        setMessage({ type: 'success', text: editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!' });
        setShowModal(false);
        resetForm();
        loadBanners();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save banner' });
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving the banner' });
    }
    setLoading(false);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      icon: banner.icon || '',
      variant: banner.variant || 'primary',
      page: banner.page || 'all',
      start_date: banner.start_date ? banner.start_date.slice(0, 16) : '',
      end_date: banner.end_date ? banner.end_date.slice(0, 16) : '',
      status: banner.status || 'active',
      priority: banner.priority || 0,
      dismissible: banner.dismissible || false,
      action_text: banner.action_text || '',
      action_url: banner.action_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = (bannerId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Banner',
      message: 'Are you sure you want to delete this banner? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const apiService = new SquaresApiService(axiosService);
          const result = await apiService.deleteBanner(bannerId);
          if (result.success) {
            setMessage({ type: 'success', text: 'Banner deleted successfully!' });
            loadBanners();
            setTimeout(() => setMessage(null), 3000);
          } else {
            setMessage({ type: 'error', text: result.error || 'Failed to delete banner' });
          }
        } catch (error) {
          console.error('Error deleting banner:', error);
          setMessage({ type: 'error', text: 'An error occurred while deleting the banner' });
        }
      },
    });
  };

  const handleToggleStatus = async (banner) => {
    try {
      const apiService = new SquaresApiService(axiosService);
      const result = await apiService.toggleBannerStatus(banner.id);
      if (result.success) {
        setMessage({ type: 'success', text: `Banner ${banner.status === 'active' ? 'hidden' : 'activated'}!` });
        loadBanners();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to toggle banner status' });
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      setMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: '',
      variant: 'primary',
      page: 'all',
      start_date: '',
      end_date: '',
      status: 'active',
      priority: 0,
      dismissible: false,
      action_text: '',
      action_url: '',
    });
    setEditingBanner(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setMessage(null);
    resetForm();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const isCurrentlyActive = (banner) => {
    if (banner.status !== 'active') return false;
    const now = new Date();
    if (banner.start_date && new Date(banner.start_date) > now) return false;
    if (banner.end_date && new Date(banner.end_date) < now) return false;
    return true;
  };

  // Filter banners
  const filteredBanners = banners.filter(banner => {
    if (filterStatus && banner.status !== filterStatus) return false;
    if (filterPage && banner.page !== filterPage) return false;
    return true;
  });

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-900/50 border-green-500 text-green-200'
              : 'bg-red-900/50 border-red-500 text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6" style={{ color: colors.text }}>Banner Management</h1>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <FiFilter style={{ color: colors.text }} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: isDark ? '#374151' : '#E5E7EB',
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <select
                value={filterPage}
                onChange={(e) => setFilterPage(e.target.value)}
                className="px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: isDark ? '#374151' : '#E5E7EB',
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <option value="">All Pages</option>
                {pageOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Create Banner Button */}
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
              style={{ backgroundColor: colors.brand.primary }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.brand.primaryHover}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.brand.primary}
            >
              <FiPlus size={20} />
              Create Banner
            </button>
          </div>
        </div>

        {/* Banners List */}
        {loading && banners.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderTopColor: colors.brand.primary, borderBottomColor: colors.brand.primary }}></div>
            <p className="mt-4" style={{ color: colors.text }}>Loading banners...</p>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <FiFlag size={64} className="mx-auto mb-4" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }} />
            <p className="text-lg" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              No banners found. Create your first banner!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBanners.map((banner) => (
              <div
                key={banner.id}
                className="rounded-xl shadow-lg overflow-hidden"
                style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
              >
                {/* Banner Card Header */}
                <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }}>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        banner.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {banner.status === 'active' ? 'Active' : 'Hidden'}
                    </span>
                    {isCurrentlyActive(banner) && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                        Currently Visible
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB', color: colors.text }}>
                      {pageOptions.find(p => p.value === banner.page)?.label || banner.page}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB', color: colors.text }}>
                      Priority: {banner.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}
                      title={banner.status === 'active' ? 'Hide Banner' : 'Show Banner'}
                    >
                      {banner.status === 'active' ? <FiEyeOff style={{ color: colors.text }} /> : <FiEye style={{ color: colors.text }} />}
                    </button>
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: colors.brand.primary }}
                    >
                      <FiEdit2 className="text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      <FiTrash2 className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Banner Preview */}
                <div className="p-4">
                  <Banner
                    icon={banner.icon}
                    title={banner.title}
                    description={banner.description}
                    variant={banner.variant}
                  />

                  {/* Banner Details */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    <div>
                      <span className="font-semibold">Start:</span> {formatDate(banner.start_date)}
                    </div>
                    <div>
                      <span className="font-semibold">End:</span> {formatDate(banner.end_date)}
                    </div>
                    <div>
                      <span className="font-semibold">Dismissible:</span> {banner.dismissible ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <span className="font-semibold">Variant:</span> {banner.variant}
                    </div>
                    {banner.action_text && (
                      <div className="col-span-2">
                        <span className="font-semibold">Action:</span> {banner.action_text} → {banner.action_url}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={handleModalClose}
          >
            <div
              className="rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: colors.card, border: `2px solid ${colors.brand.primary}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-6" style={{ color: colors.text }}>
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                    placeholder="e.g., Special Launch Promotion!"
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                    placeholder="Banner description..."
                    rows={3}
                  />
                </div>

                {/* Icon */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                    Icon/Emoji
                  </label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {commonEmojis.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`p-2 text-2xl rounded-lg transition-all ${formData.icon === emoji ? 'ring-2 ring-offset-2' : ''}`}
                        style={{
                          backgroundColor: isDark ? '#374151' : '#E5E7EB',
                          ringColor: colors.brand.primary,
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                    placeholder="Or type custom emoji/icon"
                  />
                </div>

                {/* Variant */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                    Style Variant
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {variantOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, variant: opt.value })}
                        className="px-4 py-2 rounded-lg font-semibold transition-all"
                        style={{
                          backgroundColor: formData.variant === opt.value ? opt.color : (isDark ? '#374151' : '#E5E7EB'),
                          color: formData.variant === opt.value ? '#FFFFFF' : colors.text,
                          border: `2px solid ${formData.variant === opt.value ? opt.color : colors.border}`,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Page Target */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                    Display On Page
                  </label>
                  <select
                    value={formData.page}
                    onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg"
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                  >
                    {pageOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                      Start Date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                      Leave empty to show immediately
                    </p>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                      End Date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                      Leave empty to show permanently
                    </p>
                  </div>
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                      Priority (higher = shown first)
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2" style={{ color: colors.text }}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                </div>

                {/* Dismissible */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dismissible}
                      onChange={(e) => setFormData({ ...formData, dismissible: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span style={{ color: colors.text }}>Allow users to dismiss this banner</span>
                  </label>
                </div>

                {/* Action Button */}
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }}>
                  <label className="block font-semibold mb-3" style={{ color: colors.text }}>
                    Action Button (optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.action_text}
                      onChange={(e) => setFormData({ ...formData, action_text: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        backgroundColor: isDark ? '#374151' : '#FFFFFF',
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                      placeholder="Button text (e.g., Learn More)"
                    />
                    <input
                      type="text"
                      value={formData.action_url}
                      onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        backgroundColor: isDark ? '#374151' : '#FFFFFF',
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                      placeholder="URL (e.g., /squares or https://...)"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="mb-6">
                  <label className="block font-semibold mb-3" style={{ color: colors.text }}>
                    Preview
                  </label>
                  <Banner
                    icon={formData.icon}
                    title={formData.title || 'Banner Title'}
                    description={formData.description || 'Banner description will appear here'}
                    variant={formData.variant}
                    dismissible={formData.dismissible}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200"
                  >
                    <FiX size={20} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: colors.brand.primary }}
                    onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = colors.brand.primaryHover)}
                    onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = colors.brand.primary)}
                  >
                    <FiCheck size={20} />
                    {loading ? 'Saving...' : (editingBanner ? 'Update Banner' : 'Create Banner')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          variant={confirmModal.variant}
        />
      </div>
    </div>
  );
};

export default ManageBanners;

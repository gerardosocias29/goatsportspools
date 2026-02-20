import React, { useState, useEffect } from 'react';
import PageBreadcrumb from '../../components/admin/common/PageBreadcrumb';
import { useAxios } from '../../../app/contexts/AxiosContext';

const AdminSettings = () => {
  const { get, post } = useAxios();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [editValues, setEditValues] = useState({});

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await get('/api/settings');
      const data = res.data || [];
      setSettings(data);
      const values = {};
      data.forEach((s) => { values[s.key] = s.value; });
      setEditValues(values);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = async (key) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await post(`/api/settings/${key}/toggle`);
      setEditValues((prev) => ({ ...prev, [key]: res.data.value }));
      fetchSettings();
    } catch (err) {
      console.error('Failed to toggle setting:', err);
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleSave = async (key) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      await post(`/api/settings/${key}`, { value: editValues[key] });
      fetchSettings();
    } catch (err) {
      console.error('Failed to update setting:', err);
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const formatKey = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Settings" />

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
              <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : settings.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-white/[0.03] text-center">
          <p className="text-gray-500 dark:text-gray-400">No settings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.key} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-1">
                    {formatKey(setting.key)}
                  </h4>
                  {setting.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{setting.description}</p>
                  )}
                  <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {setting.type}
                  </span>
                </div>

                <div className="shrink-0">
                  {setting.type === 'boolean' ? (
                    <button
                      onClick={() => handleToggle(setting.key)}
                      disabled={saving[setting.key]}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        editValues[setting.key] ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'
                      } ${saving[setting.key] ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editValues[setting.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type={setting.type === 'integer' ? 'number' : 'text'}
                        value={editValues[setting.key] ?? ''}
                        onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                        className="h-9 w-48 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                      <button
                        onClick={() => handleSave(setting.key)}
                        disabled={saving[setting.key]}
                        className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition"
                      >
                        {saving[setting.key] ? '...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AdminSettings;

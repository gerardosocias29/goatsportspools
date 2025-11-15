import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAxios } from '../../../app/contexts/AxiosContext';
import { useToast } from '../../../app/contexts/ToastContext';
import Button from '../ui/Button';

const LeagueCreateModal = ({ visible, onHide, onSuccess, currentUser, leagueData }) => {
  const { colors } = useTheme();
  const axiosService = useAxios();
  const showToast = useToast();

  const [leagueName, setLeagueName] = useState('');
  const [leaguePassword, setLeaguePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [leagueAdmins, setLeagueAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const isEditMode = leagueData && leagueData.id;

  // Fetch league admins if Super Admin (role_id = 1)
  useEffect(() => {
    if (visible && currentUser?.user?.role_id === 1) {
      fetchLeagueAdmins();
    }

    // Pre-fill form if editing
    if (visible && leagueData) {
      setLeagueName(leagueData.name || '');
      setLeaguePassword(leagueData.password || '');

      // Set selected admin if editing and have admins
      if (leagueData.user_id && leagueAdmins.length > 0) {
        const admin = leagueAdmins.find(a => a.id === leagueData.user_id);
        setSelectedAdmin(admin || null);
      }
    }

    if (!visible) {
      setLeagueName('');
      setLeaguePassword('');
      setSelectedAdmin(null);
    }
  }, [visible, leagueData, leagueAdmins]);

  const fetchLeagueAdmins = async () => {
    try {
      const response = await axiosService.get('/api/users/league-admins');
      setLeagueAdmins(response.data || []);
    } catch (error) {
      console.error('Error fetching league admins:', error);
      setLeagueAdmins([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!leagueName.trim()) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter league name',
      });
      return;
    }

    if (!leaguePassword.trim()) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter league password',
      });
      return;
    }

    // Get user ID - handle nested structure from API response
    const userId = currentUser?.user?.id || currentUser?.id || currentUser?.user_id || currentUser?.ID;

    if (!userId) {
      console.error('No user ID found in currentUser:', currentUser);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'User ID not found. Please try logging in again.',
      });
      return;
    }

    setLoading(true);
    try {
      // Use selected admin if Super Admin chose one, otherwise use current user
      const adminId = selectedAdmin?.id || userId;

      const endpoint = isEditMode
        ? `/api/leagues/update/${leagueData.id}`
        : '/api/leagues/store';

      const response = await axiosService.post(endpoint, {
        name: leagueName,
        user_id: adminId,
        password: leaguePassword,
      });

      if (response.data.status) {
        showToast({
          severity: 'success',
          summary: 'Success!',
          detail: response.data.message || `League ${isEditMode ? 'updated' : 'created'} successfully`,
        });
        setLeagueName('');
        setLeaguePassword('');
        onSuccess();
        onHide();
      } else {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: response.data.message || `Failed to ${isEditMode ? 'update' : 'create'} league`,
        });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} league:`, error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: `Failed to ${isEditMode ? 'update' : 'create'} league`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  };

  const modalStyles = {
    backgroundColor: colors.card,
    borderRadius: '1rem',
    padding: '2rem',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: `1px solid ${colors.border}`,
  };

  const headerStyles = {
    fontSize: '1.75rem',
    fontWeight: 700,
    fontFamily: '"Hubot Sans", sans-serif',
    color: colors.text,
    marginBottom: '1.5rem',
  };

  const labelStyles = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '0.5rem',
  };

  const inputStyles = {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    backgroundColor: colors.highlight,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    outline: 'none',
    transition: 'border-color 150ms ease',
  };

  const buttonContainerStyles = {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
  };

  return (
    <div style={overlayStyles} onClick={onHide}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <h2 style={headerStyles}>{isEditMode ? 'Update League' : 'Create League'}</h2>

        <form onSubmit={handleSubmit}>
          {/* League Admin Dropdown - Only for Super Admin */}
          {currentUser?.user?.role_id === 1 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyles}>League Admin</label>
              <select
                value={selectedAdmin?.id || ''}
                onChange={(e) => {
                  const admin = leagueAdmins.find(a => a.id === parseInt(e.target.value));
                  setSelectedAdmin(admin || null);
                }}
                style={inputStyles}
                disabled={loading}
                onFocus={(e) => e.target.style.borderColor = colors.brand.primary}
                onBlur={(e) => e.target.style.borderColor = colors.border}
              >
                <option value="">Select League Admin</option>
                {leagueAdmins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name}
                  </option>
                ))}
              </select>
              <p style={{
                fontSize: '0.75rem',
                color: colors.text,
                opacity: 0.6,
                marginTop: '0.5rem'
              }}>
                Leave empty to assign to yourself
              </p>
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyles}>League Name *</label>
            <input
              type="text"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              style={inputStyles}
              placeholder="Enter league name"
              required
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = colors.brand.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyles}>Password *</label>
            <input
              type="password"
              value={leaguePassword}
              onChange={(e) => setLeaguePassword(e.target.value)}
              style={inputStyles}
              placeholder="Enter password"
              required
              disabled={loading}
              autoComplete="new-password"
              onFocus={(e) => e.target.style.borderColor = colors.brand.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
            <p style={{
              fontSize: '0.75rem',
              color: colors.text,
              opacity: 0.6,
              marginTop: '0.5rem'
            }}>
              This password will be required for other users to join your league
            </p>
          </div>

          <div style={buttonContainerStyles}>
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              onClick={onHide}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading
                ? (isEditMode ? 'Updating...' : 'Creating...')
                : (isEditMode ? 'Update League' : 'Create League')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeagueCreateModal;

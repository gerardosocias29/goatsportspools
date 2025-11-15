import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAxios } from '../../../app/contexts/AxiosContext';
import { useToast } from '../../../app/contexts/ToastContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const LeagueManageMembersModal = ({ visible, onHide, onSuccess, league }) => {
  const { colors } = useTheme();
  const axiosService = useAxios();
  const showToast = useToast();

  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null); // 'rebuy-30k', 'rebuy-6k', 'buyin-3k'
  const [selectedMember, setSelectedMember] = useState(null);

  const handleRebuy = async (member, amount) => {
    setLoading(true);
    setActionType(amount === 'BGV60' ? 'rebuy-6k' : 'rebuy-30k');
    setSelectedMember(member);

    try {
      const response = await axiosService.post('/api/leagues/rebuy', {
        league_id: league?.league_id || league?.id,
        user_id: member.user.id,
        amount: amount,
      });

      if (response.data.status) {
        showToast({
          severity: 'success',
          summary: 'Success!',
          detail: response.data.message || 'Rebuy successful',
        });
        onSuccess();
      } else {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: response.data.message || 'Rebuy failed',
        });
      }
    } catch (error) {
      console.error('Error processing rebuy:', error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to process rebuy',
      });
    } finally {
      setLoading(false);
      setActionType(null);
      setSelectedMember(null);
    }
  };

  const handleBuyin = async (member) => {
    setLoading(true);
    setActionType('buyin-3k');
    setSelectedMember(member);

    try {
      const response = await axiosService.post('/api/leagues/buyin', {
        league_id: league?.league_id || league?.id,
        user_id: member.user.id,
      });

      if (response.data.status) {
        showToast({
          severity: 'success',
          summary: 'Success!',
          detail: response.data.message || 'Buyin successful',
        });
        onSuccess();
      } else {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: response.data.message || 'Buyin failed',
        });
      }
    } catch (error) {
      console.error('Error processing buyin:', error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to process buyin',
      });
    } finally {
      setLoading(false);
      setActionType(null);
      setSelectedMember(null);
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
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
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

  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyles = {
    textAlign: 'left',
    padding: '0.75rem',
    borderBottom: `2px solid ${colors.border}`,
    fontWeight: 600,
    color: colors.text,
    fontSize: '0.875rem',
  };

  const tdStyles = {
    padding: '0.75rem',
    borderBottom: `1px solid ${colors.border}`,
    color: colors.text,
  };

  const buttonGroupStyles = {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  };

  const members = league?.league_users || [];

  return (
    <div style={overlayStyles} onClick={onHide}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <h2 style={headerStyles}>Manage League Members - {league?.name}</h2>

        {members.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: colors.text, opacity: 0.7 }}>No members in this league yet</p>
          </Card>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table style={tableStyles}>
              <thead>
                <tr>
                  <th style={thStyles}>Member</th>
                  <th style={{ ...thStyles, textAlign: 'center' }}>Balance</th>
                  <th style={{ ...thStyles, textAlign: 'center' }}>Rebuys</th>
                  <th style={{ ...thStyles, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td style={tdStyles}>{member.user?.name || 'Unknown'}</td>
                    <td style={{ ...tdStyles, textAlign: 'center' }}>
                      ${(member.balance || 0).toFixed(2)}
                    </td>
                    <td style={{ ...tdStyles, textAlign: 'center' }}>
                      {member.rebuys || 0}
                    </td>
                    <td style={{ ...tdStyles, textAlign: 'right' }}>
                      <div style={buttonGroupStyles}>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRebuy(member, 'BGV03')}
                          disabled={loading}
                        >
                          {loading && selectedMember?.id === member.id && actionType === 'rebuy-30k'
                            ? 'Processing...'
                            : '30K Rebuy'}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRebuy(member, 'BGV60')}
                          disabled={loading}
                        >
                          {loading && selectedMember?.id === member.id && actionType === 'rebuy-6k'
                            ? 'Processing...'
                            : '6K Rebuy'}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleBuyin(member)}
                          disabled={loading}
                        >
                          {loading && selectedMember?.id === member.id && actionType === 'buyin-3k'
                            ? 'Processing...'
                            : '3K Buyin'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outline" size="lg" onClick={onHide} disabled={loading}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeagueManageMembersModal;

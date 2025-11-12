import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAxios } from '../../../app/contexts/AxiosContext';
import { useToast } from '../../../app/contexts/ToastContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const LeagueJoinModal = ({ visible, league, onHide, onSuccess }) => {
  const { colors } = useTheme();
  const axiosService = useAxios();
  const showToast = useToast();

  const [leagueId, setLeagueId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const postData = {
        league_id: league ? (league.league_id || league.id) : leagueId,
        password: password,
      };

      const response = await axiosService.post('/api/leagues/join', postData);

      if (response.data.status) {
        showToast({
          severity: 'success',
          summary: 'Success',
          detail: response.data.message || 'Successfully joined the league!',
        });

        // Reset form
        setPassword('');
        setLeagueId('');

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      } else {
        showToast({
          severity: 'error',
          summary: 'Unable to Complete',
          detail: response.data.message || 'Failed to join league',
        });
      }
    } catch (error) {
      console.error('Error joining league:', error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred while joining the league',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setLeagueId('');
    onHide();
  };

  if (!visible) return null;

  // Modal styles
  const backdropStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  };

  const modalStyles = {
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflow: 'auto',
  };

  const headerStyles = {
    marginBottom: '1.5rem',
  };

  const titleStyles = {
    fontSize: '1.75rem',
    fontWeight: 700,
    fontFamily: '"Hubot Sans", sans-serif',
    color: colors.text,
    marginBottom: '0.5rem',
  };

  const subtitleStyles = {
    fontSize: '0.875rem',
    color: colors.text,
    opacity: 0.7,
    lineHeight: 1.5,
  };

  const formStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  };

  const buttonRowStyles = {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  };

  return (
    <div style={backdropStyles} onClick={handleClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <Card padding="lg">
          <div style={headerStyles}>
            <h2 style={titleStyles}>
              {league ? `Join ${league.name}` : 'Join a League'}
            </h2>
            <p style={subtitleStyles}>
              {league
                ? `Enter the password to join ${league.name}`
                : 'Enter the League ID and password to join a league'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={formStyles}>
            {!league && (
              <Input
                label="League ID"
                type="text"
                placeholder="XXXXX-XXX-XXXXX"
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
                required
                fullWidth
                size="lg"
              />
            )}

            <Input
              label="Password"
              type="password"
              placeholder="Enter league password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              size="lg"
            />

            <div style={buttonRowStyles}>
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Joining...' : 'Join League'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LeagueJoinModal;

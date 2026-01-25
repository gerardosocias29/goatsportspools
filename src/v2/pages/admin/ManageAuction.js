import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAxios } from '../../../app/contexts/AxiosContext';
import { useToast } from '../../../app/contexts/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import moment from 'moment';

const ManageAuction = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const axiosService = useAxios();
  const showToast = useToast();

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('auctions');
  const [refreshTable, setRefreshTable] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);

  // Team/User details states
  const [teamDetails, setTeamDetails] = useState(null);
  const [auctionDetails, setAuctionDetails] = useState(null);
  const [owners, setOwners] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('East');

  const regions = ['East', 'West', 'Midwest', 'South'];

  // Fetch auctions
  useEffect(() => {
    fetchAuctions();
  }, [refreshTable]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await axiosService.get('/api/auctions/all');
      setAuctions(response.data || []);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (auctionId) => {
    if (!auctionId) return;
    try {
      const q = process.env.REACT_APP_USER_QUERY || 0;
      let param = q == 1 ? '?query=true' : '';
      const response = await axiosService.get(`/api/auctions/${auctionId}/users${param}`);
      setOwners(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (auctionDetails) {
      fetchUsers(auctionDetails.id);
    }
  }, [auctionDetails]);

  const handleEndAuction = async (id) => {
    if (!window.confirm('Are you sure you want to end this auction?')) return;
    try {
      await axiosService.get(`/api/auctions/${id}/end`);
      showToast({ severity: 'success', summary: 'Auction Ended', detail: 'Auction has been ended successfully' });
      setRefreshTable(prev => !prev);
    } catch (error) {
      showToast({ severity: 'error', summary: 'Error', detail: 'Failed to end auction' });
    }
  };

  const handleCancelAuction = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this auction?')) return;
    try {
      await axiosService.get(`/api/auctions/${id}/cancel`);
      showToast({ severity: 'success', summary: 'Auction Cancelled', detail: 'Auction has been cancelled' });
      setRefreshTable(prev => !prev);
    } catch (error) {
      showToast({ severity: 'error', summary: 'Error', detail: 'Failed to cancel auction' });
    }
  };

  const handleStartAuction = (auction) => {
    if (auction.is_finalized !== 1) {
      showToast({ severity: 'warn', summary: 'Cannot Start', detail: 'Please finalize the team bracket first' });
      return;
    }
    setSelectedAuction(auction);
    setShowStreamModal(true);
  };

  const handleSetStreamUrl = async (streamUrl) => {
    try {
      await axiosService.post(`/api/auctions/${selectedAuction.id}/set-stream-url`, { stream_url: streamUrl });
      await axiosService.get(`/api/auctions/${selectedAuction.id}/start`);
      showToast({ severity: 'success', summary: 'Auction Started', detail: 'Auction is now live!' });
      setShowStreamModal(false);
      navigate(`/admin/auction/live?auction_id=${selectedAuction.id}`);
    } catch (error) {
      showToast({ severity: 'error', summary: 'Error', detail: 'Failed to start auction' });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: '⏳' },
      live: { variant: 'danger', icon: '⚡' },
      completed: { variant: 'success', icon: '✅' },
      cancelled: { variant: 'default', icon: '❌' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant}>
        {config.icon} {status}
      </Badge>
    );
  };

  // Styles
  const containerStyles = {
    maxWidth: '1536px',
    margin: '0 auto',
    padding: '2rem',
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  };

  const titleStyles = {
    fontSize: '2rem',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    color: colors.text,
  };

  const tabStyles = (isActive) => ({
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: isActive ? colors.brand.primary : colors.text,
    backgroundColor: isActive ? `${colors.brand.primary}15` : 'transparent',
    border: 'none',
    borderBottom: isActive ? `2px solid ${colors.brand.primary}` : '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const tableStyles = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontSize: '0.875rem',
  };

  const thStyles = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: colors.highlight,
    borderBottom: `1px solid ${colors.border}`,
  };

  const tdStyles = {
    padding: '0.75rem 1rem',
    borderBottom: `1px solid ${colors.border}`,
    color: colors.text,
  };

  const actionButtonStyles = {
    padding: '0.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
  };

  return (
    <div style={containerStyles} className="v2-fade-in">
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Manage Auctions</h1>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Create Auction
        </Button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: `1px solid ${colors.border}` }}>
        <button style={tabStyles(activeTab === 'auctions')} onClick={() => { setActiveTab('auctions'); setTeamDetails(null); setAuctionDetails(null); }}>
          Auctions
        </button>
        <button style={tabStyles(activeTab === 'teams')} onClick={() => setActiveTab('teams')} disabled={!teamDetails}>
          Team Details
        </button>
        <button style={tabStyles(activeTab === 'users')} onClick={() => setActiveTab('users')} disabled={!auctionDetails}>
          User Details
        </button>
      </div>

      {/* Auctions Tab */}
      {activeTab === 'auctions' && (
        <Card padding="none" hover={false}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: colors.text }}>Loading auctions...</div>
          ) : auctions.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: colors.text, opacity: 0.6 }}>
              No auctions found. Create your first auction!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyles}>
                <thead>
                  <tr>
                    <th style={thStyles}>Event Name</th>
                    <th style={thStyles}>Date</th>
                    <th style={thStyles}>Items</th>
                    <th style={thStyles}>Status</th>
                    <th style={thStyles}>Stream URL</th>
                    <th style={{ ...thStyles, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {auctions.map((auction) => (
                    <tr key={auction.id} style={{ transition: 'background 0.2s' }}>
                      <td style={tdStyles}>
                        <strong>{auction.name}</strong>
                      </td>
                      <td style={tdStyles}>
                        {auction.event_date ? moment(auction.event_date).format('MMM DD, YYYY h:mm A') : '-'}
                      </td>
                      <td style={tdStyles}>
                        <Badge variant="default">{auction.items?.length || 0} items</Badge>
                      </td>
                      <td style={tdStyles}>{getStatusBadge(auction.status)}</td>
                      <td style={{ ...tdStyles, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {auction.stream_url || '-'}
                      </td>
                      <td style={{ ...tdStyles, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {/* Team Details */}
                          <button
                            style={{ ...actionButtonStyles, backgroundColor: colors.highlight, color: colors.text }}
                            onClick={() => { setTeamDetails(auction.items); setAuctionDetails(auction); setActiveTab('teams'); }}
                            title="Team Details"
                          >
                            👥
                          </button>

                          {/* User Details */}
                          <button
                            style={{ ...actionButtonStyles, backgroundColor: colors.highlight, color: colors.text }}
                            onClick={() => { setTeamDetails(auction.items); setAuctionDetails(auction); setActiveTab('users'); }}
                            title="User Details"
                          >
                            📋
                          </button>

                          {/* Start Auction (pending only) */}
                          {auction.status === 'pending' && (
                            <button
                              style={{ ...actionButtonStyles, backgroundColor: auction.is_finalized === 1 ? '#10B981' : '#9CA3AF', color: '#fff' }}
                              onClick={() => handleStartAuction(auction)}
                              title={auction.is_finalized === 1 ? 'Start Auction' : 'Finalize team first'}
                            >
                              ▶️
                            </button>
                          )}

                          {/* Open Live Auction (live only) */}
                          {auction.status === 'live' && (
                            <>
                              <button
                                style={{ ...actionButtonStyles, backgroundColor: colors.brand.primary, color: '#fff' }}
                                onClick={() => navigate(`/admin/auction/live?auction_id=${auction.id}`)}
                                title="Open Live Control"
                              >
                                🔗
                              </button>
                              <button
                                style={{ ...actionButtonStyles, backgroundColor: '#EF4444', color: '#fff' }}
                                onClick={() => handleEndAuction(auction.id)}
                                title="End Auction"
                              >
                                ⏹️
                              </button>
                            </>
                          )}

                          {/* Cancel (pending only) */}
                          {auction.status === 'pending' && (
                            <button
                              style={{ ...actionButtonStyles, backgroundColor: '#FEE2E2', color: '#EF4444' }}
                              onClick={() => handleCancelAuction(auction.id)}
                              title="Cancel Auction"
                            >
                              ❌
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Team Details Tab */}
      {activeTab === 'teams' && teamDetails && (
        <Card padding="lg" hover={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.text }}>
              Team Details - {auctionDetails?.name}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${selectedRegion === region ? colors.brand.primary : colors.border}`,
                    backgroundColor: selectedRegion === region ? colors.brand.primary : 'transparent',
                    color: selectedRegion === region ? '#fff' : colors.text,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyles}>
              <thead>
                <tr>
                  <th style={thStyles}>Region</th>
                  <th style={thStyles}>Seed</th>
                  <th style={thStyles}>School</th>
                  <th style={thStyles}>Nickname</th>
                  <th style={thStyles}>Team Owner</th>
                  <th style={thStyles}>Final Bid Price</th>
                </tr>
              </thead>
              <tbody>
                {teamDetails
                  .filter((item) => item?.region === selectedRegion)
                  .map((team) => (
                    <tr key={team.id}>
                      <td style={tdStyles}>{team.region}</td>
                      <td style={tdStyles}>#{team.seed}</td>
                      <td style={tdStyles}>{team.ncaa_team?.school || team.name}</td>
                      <td style={tdStyles}>{team.ncaa_team?.nickname || '-'}</td>
                      <td style={tdStyles}>{team.owner?.name || '-'}</td>
                      <td style={{ ...tdStyles, color: team.sold_amount ? '#10B981' : colors.text, fontWeight: 600 }}>
                        {team.sold_amount ? `$${Number(team.sold_amount).toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* User Details Tab */}
      {activeTab === 'users' && auctionDetails && (
        <Card padding="lg" hover={false}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.text, marginBottom: '1.5rem' }}>
            User Details - {auctionDetails?.name}
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyles}>
              <thead>
                <tr>
                  <th style={thStyles}>Owner</th>
                  <th style={thStyles}>Amount Escrowed</th>
                  <th style={thStyles}>Total Budget</th>
                  <th style={thStyles}>Budget Used</th>
                  <th style={thStyles}>Last Team</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((owner) => (
                  <tr key={owner.id}>
                    <td style={tdStyles}>
                      <div>
                        <strong>#{owner.id} {owner.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: colors.text, opacity: 0.6 }}>{owner.email}</div>
                      </div>
                    </td>
                    <td style={tdStyles}>{owner.auctions?.[0]?.escrow_amount || '∞'}</td>
                    <td style={tdStyles}>{owner.auctions?.[0]?.total_budget || '∞'}</td>
                    <td style={{ ...tdStyles, color: '#10B981', fontWeight: 600 }}>
                      {owner.total_sold_amount ? `$${Number(owner.total_sold_amount).toFixed(2)}` : '-'}
                    </td>
                    <td style={tdStyles}>
                      {owner.auction_items?.length > 0 && (
                        <Badge variant="default">{owner.auction_items[0]?.name}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Auction Modal */}
      {showCreateModal && (
        <CreateAuctionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setRefreshTable((prev) => !prev);
          }}
          colors={colors}
        />
      )}

      {/* Stream URL Modal */}
      {showStreamModal && (
        <StreamUrlModal
          auction={selectedAuction}
          onClose={() => setShowStreamModal(false)}
          onSubmit={handleSetStreamUrl}
          colors={colors}
        />
      )}
    </div>
  );
};

// Create Auction Modal Component
const CreateAuctionModal = ({ onClose, onSuccess, colors }) => {
  const axiosService = useAxios();
  const showToast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    event_date: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosService.post('/api/auctions/create', formData);
      showToast({
        severity: response.data.status ? 'success' : 'error',
        summary: response.data.status ? 'Success' : 'Error',
        detail: response.data.message,
      });
      if (response.data.status) {
        onSuccess();
      }
    } catch (error) {
      showToast({ severity: 'error', summary: 'Error', detail: 'Failed to create auction' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: colors.card,
        borderRadius: '1rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: colors.text }}>
          Create Auction Event
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: colors.text }}>
              Auction Name
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter auction name"
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: colors.text }}>
              Event Date
            </label>
            <Input
              type="datetime-local"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Auction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Stream URL Modal Component
const StreamUrlModal = ({ auction, onClose, onSubmit, colors }) => {
  const [streamUrl, setStreamUrl] = useState(auction?.stream_url || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(streamUrl);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: colors.card,
        borderRadius: '1rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: colors.text }}>
          Start Auction
        </h2>
        <p style={{ color: colors.text, opacity: 0.7, marginBottom: '1.5rem' }}>
          Set the livestream URL before starting the auction
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: colors.text }}>
              Stream URL (YouTube or Twitch)
            </label>
            <Input
              type="url"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              required
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Starting...' : 'Start Auction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageAuction;

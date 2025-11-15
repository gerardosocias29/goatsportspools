import React, { useState, useEffect, useContext } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAxios } from '../../app/contexts/AxiosContext';
import { AuthContext } from '../../app/contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LeagueJoinModal from '../components/leagues/LeagueJoinModal';
import LeagueCreateModal from '../components/leagues/LeagueCreateModal';
import LeagueManageMembersModal from '../components/leagues/LeagueManageMembersModal';

const Leagues = () => {
  const { colors } = useTheme();
  const axiosService = useAxios();
  const { user: authUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-leagues'); // 'all' | 'my-leagues' - Default to my-leagues for better UX
  const [allLeagues, setAllLeagues] = useState([]);
  const [joinedLeagues, setJoinedLeagues] = useState([]);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [manageMembersModalVisible, setManageMembersModalVisible] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [leagueToEdit, setLeagueToEdit] = useState(null);

  // Stats
  const [totalLeagues, setTotalLeagues] = useState(0);
  const [leaguesCreated, setLeaguesCreated] = useState(0);
  const [leaguesJoined, setLeaguesJoined] = useState(0);

  useEffect(() => {
    fetchUserData();
    fetchLeagues();
    fetchStats();
  }, []);

  useEffect(() => {
    // Fetch stats when user data is loaded
    if (currentUser?.user) {
      fetchStats();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      const response = await axiosService.get('/api/me_user');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Fallback to authUser if API fails
      setCurrentUser(authUser);
    }
  };

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      // Fetch all leagues
      const allResponse = await axiosService.get('/api/leagues');
      // The API returns paginated data with 'data' array
      if (allResponse.data && allResponse.data.data) {
        const leagues = allResponse.data.data || [];
        setAllLeagues(leagues);
        setTotalLeagues(leagues.length);
      } else if (Array.isArray(allResponse.data)) {
        setAllLeagues(allResponse.data);
        setTotalLeagues(allResponse.data.length);
      }

      // Fetch joined leagues
      const joinedResponse = await axiosService.get('/api/leagues/joined');

      // Handle different response structures
      if (joinedResponse.data.status && joinedResponse.data.leagues_joined) {
        const leagues = joinedResponse.data.leagues_joined;
        setJoinedLeagues(leagues);
      } else if (Array.isArray(joinedResponse.data)) {
        setJoinedLeagues(joinedResponse.data);
      } else {
        setJoinedLeagues([]);
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
      // Set empty arrays on error to prevent crashes
      setAllLeagues([]);
      setJoinedLeagues([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!currentUser?.user) return;

    const roleId = currentUser.user.role_id;

    try {
      // Fetch joined leagues count for non-super-admins
      if (roleId !== 1) {
        const joinedResponse = await axiosService.get('/api/leagues/leagues-joined');
        setLeaguesJoined(joinedResponse.data.leagues_joined || 0);
      }

      // Fetch created leagues count for league admins
      if (roleId === 2) {
        const createdResponse = await axiosService.get('/api/leagues/leagues-created');
        setLeaguesCreated(createdResponse.data.leagues_created || 0);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleJoinClick = (league) => {
    setSelectedLeague(league);
    setJoinModalVisible(true);
  };

  const handleJoinSuccess = () => {
    setJoinModalVisible(false);
    setSelectedLeague(null);
    fetchLeagues(); // Refresh leagues
    fetchStats(); // Refresh stats
  };

  const handleEditLeague = (league) => {
    setLeagueToEdit({
      id: league.id || league.league_id,
      name: league.name,
      password: league.old_password || league.password,
      user_id: league.user_id,
    });
    setCreateModalVisible(true);
  };

  const handleManageMembers = async (league) => {
    try {
      // Fetch full league data with members
      const response = await axiosService.get(`/api/leagues/get/${league.id || league.league_id}`);
      setSelectedLeague(response.data);
      setManageMembersModalVisible(true);
    } catch (error) {
      console.error('Error fetching league members:', error);
    }
  };

  const handleManageMembersSuccess = async () => {
    // Refresh league data after rebuy/buyin
    if (selectedLeague) {
      try {
        const response = await axiosService.get(`/api/leagues/get/${selectedLeague.id || selectedLeague.league_id}`);
        setSelectedLeague(response.data);
      } catch (error) {
        console.error('Error refreshing league data:', error);
      }
    }
    fetchLeagues();
    fetchStats();
  };

  // Container styles
  const containerStyles = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '3rem 2rem',
  };

  const headerStyles = {
    textAlign: 'center',
    marginBottom: '3rem',
  };

  const titleStyles = {
    fontSize: '3rem',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    marginBottom: '1rem',
    color: colors.text,
  };

  const descStyles = {
    fontSize: '1.25rem',
    color: colors.text,
    opacity: 0.7,
    maxWidth: '600px',
    margin: '0 auto',
  };

  const tabContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const tabButtonStyles = (isActive) => ({
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    fontWeight: 600,
    fontSize: '1rem',
    border: `2px solid ${isActive ? colors.brand.primary : colors.border}`,
    backgroundColor: isActive ? colors.brand.primary : 'transparent',
    color: isActive ? '#FFFFFF' : colors.text,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  });

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
  };

  const leagueCardContentStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const leagueHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
  };

  const leagueTitleStyles = {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: '"Hubot Sans", sans-serif',
    color: colors.text,
    marginBottom: '0.25rem',
  };

  const leagueIdStyles = {
    fontSize: '0.875rem',
    color: colors.text,
    opacity: 0.6,
    fontFamily: 'monospace',
  };

  const statRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: colors.highlight,
    borderRadius: '0.5rem',
  };

  const statLabelStyles = {
    fontSize: '0.875rem',
    color: colors.text,
    opacity: 0.7,
  };

  const statValueStyles = {
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.text,
  };

  const balanceStyles = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.brand.primary,
  };

  // Filter leagues based on active tab
  // For 'my-leagues', merge joined leagues data with all leagues data to get member counts
  const displayLeagues = activeTab === 'all'
    ? allLeagues
    : joinedLeagues.map(joinedLeague => {
        // Find the matching league in allLeagues to get league_users data
        const fullLeagueData = allLeagues.find(
          league => (league.league_id === joinedLeague.league_id) || (league.id === joinedLeague.id)
        );
        // Merge the data, preferring fullLeagueData for member info
        return fullLeagueData ? { ...joinedLeague, ...fullLeagueData, balance: joinedLeague.balance } : joinedLeague;
      });

  // Check if user has joined a league
  const isLeagueJoined = (leagueId) => {
    return joinedLeagues.some(league => league.league_id === leagueId);
  };

  // Get user balance for a league
  const getLeagueBalance = (leagueId) => {
    const joined = joinedLeagues.find(league => league.league_id === leagueId);
    return joined ? joined.balance : 0;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        gap: '2rem',
      }}>
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg
            style={{
              position: 'absolute',
              width: '120px',
              height: '120px',
              animation: 'spin 1.5s linear infinite'
            }}
            viewBox="0 0 120 120"
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#D47A3E"
              strokeWidth="4"
              strokeDasharray="300 360"
              strokeLinecap="round"
            />
          </svg>
          <img
            src="/assets/images/favicon.png"
            alt="Loading"
            style={{
              width: '64px',
              height: '64px',
              position: 'relative',
              zIndex: 1,
              animation: 'bounce 1s ease-in-out infinite'
            }}
          />
        </div>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: colors.text,
          fontFamily: '"Hubot Sans", sans-serif',
        }}>
          Loading leagues...
        </div>
      </div>
    );
  }

  const buttonRowStyles = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const centeredHeaderStyles = {
    textAlign: 'center',
    marginBottom: '3rem',
  };

  const handleCreateSuccess = () => {
    fetchLeagues();
    fetchStats();
    setLeagueToEdit(null); // Clear edit data
  };

  const roleId = currentUser?.user?.role_id;

  return (
    <div style={containerStyles} className="v2-fade-in">
      {/* Stats Cards - Role Based */}
      {roleId && roleId !== 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.text, opacity: 0.7, marginBottom: '0.5rem' }}>
                Total Leagues
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: colors.text }}>
                {roleId === 1 ? totalLeagues : leaguesCreated}
              </div>
            </div>
          </Card>
          {roleId !== 1 && (
            <Card>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.text, opacity: 0.7, marginBottom: '0.5rem' }}>
                  Joined Leagues
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: colors.text }}>
                  {leaguesJoined}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      <div style={buttonRowStyles}>
        {/* Create League Button - Only for Super Admin and League Admin */}
        {roleId && roleId !== 3 && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setLeagueToEdit(null);
              setCreateModalVisible(true);
            }}
          >
            Create League
          </Button>
        )}
        {/* Join League Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            setSelectedLeague(null);
            setJoinModalVisible(true);
          }}
        >
          Join A League
        </Button>
      </div>

      <div style={centeredHeaderStyles}>
        <h1 style={titleStyles}>Leagues</h1>
        <p style={descStyles}>
          Join a league to start betting on NFL games. Enter the league ID and password to join.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={tabContainerStyles}>
        <button
          style={tabButtonStyles(activeTab === 'all')}
          onClick={() => setActiveTab('all')}
        >
          All Leagues
        </button>
        <button
          style={tabButtonStyles(activeTab === 'my-leagues')}
          onClick={() => setActiveTab('my-leagues')}
        >
          My Leagues ({joinedLeagues.length})
        </button>
      </div>

      {/* Leagues Grid */}
      {displayLeagues.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏈</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: colors.text }}>
            {activeTab === 'all' ? 'No leagues available' : 'No leagues joined yet'}
          </h3>
          <p style={{ color: colors.text, opacity: 0.7, marginBottom: '1.5rem' }}>
            {activeTab === 'all'
              ? 'Check back later for available leagues.'
              : 'Join a league to start betting on NFL games.'}
          </p>
          {activeTab === 'my-leagues' && (
            <Button variant="primary" onClick={() => setActiveTab('all')}>
              Browse All Leagues
            </Button>
          )}
        </Card>
      ) : (
        <div style={gridStyles}>
          {displayLeagues.map((league) => {
            const joined = isLeagueJoined(league.league_id || league.id);
            const balance = getLeagueBalance(league.league_id || league.id);

            // Count members from league_users array if available, otherwise use total_users
            const memberCount = league.league_users?.length || league.total_users || league.member_count || 0;

            return (
              <Card key={league.id || league.league_id} hover={!joined}>
                <div style={leagueCardContentStyles}>
                  <div style={leagueHeaderStyles}>
                    <div>
                      <h3 style={leagueTitleStyles}>{league.name}</h3>
                      <p style={leagueIdStyles}>ID: {league.league_id || league.id}</p>
                    </div>
                    {joined && <Badge variant="success">Joined</Badge>}
                  </div>

                  {joined && (
                    <div style={statRowStyles}>
                      <span style={statLabelStyles}>Your Balance:</span>
                      <span style={balanceStyles}>${balance.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Member Count */}
                  <div style={statRowStyles}>
                    <span style={statLabelStyles}>Members:</span>
                    <span style={statValueStyles}>{memberCount}</span>
                  </div>

                  {/* Action Buttons Based on Role */}
                  {roleId && roleId !== 3 ? (
                    // Admin buttons (Edit & Manage Members)
                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                      <Button
                        variant="outline"
                        size="lg"
                        fullWidth
                        onClick={() => handleEditLeague(league)}
                      >
                        Edit League
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => handleManageMembers(league)}
                      >
                        Manage Members
                      </Button>
                    </div>
                  ) : (
                    // Regular user - Join/Joined button
                    !joined ? (
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => handleJoinClick(league)}
                      >
                        Join League
                      </Button>
                    ) : (
                      <Button variant="outline" size="lg" fullWidth disabled>
                        Already Joined
                      </Button>
                    )
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Join League Modal */}
      <LeagueJoinModal
        visible={joinModalVisible}
        league={selectedLeague}
        onHide={() => {
          setJoinModalVisible(false);
          setSelectedLeague(null);
        }}
        onSuccess={handleJoinSuccess}
      />

      {/* Create/Edit League Modal */}
      <LeagueCreateModal
        visible={createModalVisible}
        onHide={() => {
          setCreateModalVisible(false);
          setLeagueToEdit(null);
        }}
        onSuccess={handleCreateSuccess}
        currentUser={currentUser}
        leagueData={leagueToEdit}
      />

      {/* Manage Members Modal */}
      <LeagueManageMembersModal
        visible={manageMembersModalVisible}
        onHide={() => {
          setManageMembersModalVisible(false);
          setSelectedLeague(null);
        }}
        onSuccess={handleManageMembersSuccess}
        league={selectedLeague}
      />
    </div>
  );
};

export default Leagues;

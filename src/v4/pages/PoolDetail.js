import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import useSquaresPool from '../hooks/useSquaresPool';
import usePaymentMethod from '../hooks/usePaymentMethod';
import SquaresGrid from '../components/pools/SquaresGrid';
import SelectionFooter from '../components/pools/SelectionFooter';
import WinnersDisplay from '../components/pools/WinnersDisplay';
import JoinPoolModal from '../components/pools/JoinPoolModal';
import Modal from '../components/admin/common/Modal';
import PageLoader from '../components/common/PageLoader';

const PoolDetail = () => {
  const { poolNumber } = useParams();
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded, isSuperadmin, isSquareAdmin } = useUserContext();

  const {
    pool, squares, winners, teams, loading, error,
    hasJoined, isPoolOpen, maxPerPlayer, costPerSquare,
    numbersAssigned, claimedCount, mySquaresCount, poolId,
    getTeamName, getTeamLogo, joinPool, claimSquares, leavePool, loadPool,
    updateGameScores, calculateWinners, closePool, reopenPool,
    assignNumbers, assignNumbersAscending, updatePassword,
  } = useSquaresPool(poolNumber);

  const { hasPaymentMethod } = usePaymentMethod();

  const [selectedSquares, setSelectedSquares] = useState([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [claimProgress, setClaimProgress] = useState({ current: 0, total: 0 });
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leavingPool, setLeavingPool] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [howItWorksExpanded, setHowItWorksExpanded] = useState(false);

  // Admin state
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [scoreHome, setScoreHome] = useState('');
  const [scoreVisitor, setScoreVisitor] = useState('');
  const [calculatingWinners, setCalculatingWinners] = useState(false);
  const [updatingPool, setUpdatingPool] = useState(false);
  const [assigningNumbers, setAssigningNumbers] = useState(false);
  const [adminMessage, setAdminMessage] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate(`/sign-in?redirect_url=/pools/${poolNumber}`);
    }
  }, [isLoaded, isSignedIn, poolNumber, navigate]);

  // Auto-show winner modal when user has wins
  useEffect(() => {
    if (winners.length > 0 && user?.id) {
      const myWins = winners.filter(w => w.player_id && parseInt(w.player_id) === parseInt(user.id));
      if (myWins.length > 0) {
        setShowWinnerModal(true);
      }
    }
  }, [winners, user?.id]);

  const handleConfirmClaim = async () => {
    if (selectedSquares.length === 0) return;
    setIsConfirming(true);
    setClaimProgress({ current: 0, total: selectedSquares.length });
    await claimSquares(selectedSquares, (current, total) => {
      setClaimProgress({ current, total });
    });
    setIsConfirming(false);
    setSelectedSquares([]);
    setClaimProgress({ current: 0, total: 0 });
  };

  const handleLeavePool = async () => {
    setLeavingPool(true);
    await leavePool();
    setLeavingPool(false);
    setShowLeaveConfirm(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/pools/join?pool=${pool.pool_number}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  };

  const showAdminMsg = (type, text) => {
    setAdminMessage({ type, text });
    setTimeout(() => setAdminMessage(null), 4000);
  };

  // Admin handlers
  const handleOpenScoreModal = (quarter) => {
    setSelectedQuarter(quarter);
    const game = pool.game;
    if (quarter === 1) { setScoreHome(game?.q1_home?.toString() ?? ''); setScoreVisitor(game?.q1_visitor?.toString() ?? ''); }
    else if (quarter === 2) { setScoreHome(game?.half_home?.toString() ?? ''); setScoreVisitor(game?.half_visitor?.toString() ?? ''); }
    else if (quarter === 3) { setScoreHome(game?.q3_home?.toString() ?? ''); setScoreVisitor(game?.q3_visitor?.toString() ?? ''); }
    else { setScoreHome(game?.final_home?.toString() ?? ''); setScoreVisitor(game?.final_visitor?.toString() ?? ''); }
    setShowScoreModal(true);
  };

  const handleSaveScores = async () => {
    if (scoreHome === '' || scoreVisitor === '') return;
    setCalculatingWinners(true);
    const scoreUpdate = {};
    const h = parseInt(scoreHome), v = parseInt(scoreVisitor);
    if (selectedQuarter === 1) { scoreUpdate.q1_home = h; scoreUpdate.q1_visitor = v; }
    else if (selectedQuarter === 2) { scoreUpdate.half_home = h; scoreUpdate.half_visitor = v; }
    else if (selectedQuarter === 3) { scoreUpdate.q3_home = h; scoreUpdate.q3_visitor = v; }
    else { scoreUpdate.final_home = h; scoreUpdate.final_visitor = v; scoreUpdate.game_status = 'Final'; }
    const result = await updateGameScores(scoreUpdate);
    setCalculatingWinners(false);
    setShowScoreModal(false);
    if (result.success) showAdminMsg('success', 'Scores saved!');
    else showAdminMsg('error', result.error);
  };

  const handleCalculateWinner = async (quarter) => {
    setCalculatingWinners(true);
    const result = await calculateWinners(quarter);
    setCalculatingWinners(false);
    if (result.success) {
      showAdminMsg(result.unclaimed ? 'warning' : 'success', result.unclaimed ? 'Winning square is unclaimed' : 'Winner calculated!');
    } else showAdminMsg('error', result.error);
  };

  const handleClosePool = async () => {
    setUpdatingPool(true);
    const result = await closePool();
    setUpdatingPool(false);
    if (result.success) showAdminMsg('success', 'Pool closed');
    else showAdminMsg('error', result.error);
  };

  const handleReopenPool = async () => {
    setUpdatingPool(true);
    const result = await reopenPool();
    setUpdatingPool(false);
    if (result.success) showAdminMsg('success', 'Pool reopened');
    else showAdminMsg('error', result.error);
  };

  const handleAssignNumbers = async () => {
    setAssigningNumbers(true);
    const result = await assignNumbers();
    setAssigningNumbers(false);
    if (result.success) showAdminMsg('success', 'Numbers assigned randomly!');
    else showAdminMsg('error', result.error);
  };

  const handleAssignAscending = async () => {
    setAssigningNumbers(true);
    const result = await assignNumbersAscending();
    setAssigningNumbers(false);
    if (result.success) showAdminMsg('success', 'Numbers assigned (0-9)!');
    else showAdminMsg('error', result.error);
  };

  const handleUpdatePassword = async () => {
    setSavingPassword(true);
    const result = await updatePassword(newPassword || null);
    setSavingPassword(false);
    if (result.success) {
      showAdminMsg('success', newPassword ? 'Password updated!' : 'Password removed!');
      setShowPasswordModal(false);
      setNewPassword('');
    } else {
      showAdminMsg('error', result.error);
    }
  };

  if (loading || !isLoaded) return <PageLoader />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-error-50 dark:bg-error-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pool Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button onClick={() => navigate('/pools')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium !text-white bg-brand-500 hover:bg-brand-600 transition">
          Back to Pools
        </button>
      </div>
    );
  }

  if (!pool) return null;

  const visitorTeamId = pool.game?.visitor_team_id || pool.game?.visitorTeamId;
  const homeTeamId = pool.game?.home_team_id || pool.game?.homeTeamId;
  const visitorName = getTeamName(visitorTeamId);
  const homeName = getTeamName(homeTeamId);
  const league = pool.game?.league || 'NFL';
  const gameDate = pool.game?.game_datetime || pool.game?.game_time;
  const selectionMode = hasJoined && isPoolOpen;

  const gridData = {
    visitorTeamName: visitorName,
    homeTeamName: homeName,
    xAxisNumbers: pool.x_numbers || null,
    yAxisNumbers: pool.y_numbers || null,
    max_squares_per_player: maxPerPlayer,
    costPerSquare,
  };

  const leagueEmoji = league === 'NBA' ? '🏀' : league === 'NCAAB' ? '🏀' : league === 'PBA' ? '🎳' : '🏈';

  const isPoolClosed = pool.pool_status === 'closed' || pool.pool_status === 'SelectClosed';
  const isPoolInProgress = pool.pool_status === 'in_progress' || pool.pool_status === 'GameStarted';
  const isPoolCompleted = pool.pool_status === 'completed';

  const numbersType = pool.numbers_type || pool.numbersType || 'Random';
  const numbersTypeLabel = numbersType === 'Ascending' ? 'Ascending (0-9 in order)'
    : numbersType === 'AdminTrigger' ? 'Manual (assigned by admin)'
    : numbersType === 'TimeSet' ? 'Timed (auto-assigned at scheduled time)'
    : 'Random (shuffled after pool closes)';

  const game = pool.game;
  const hasScores = game && (
    game.q1_home != null || game.half_home != null ||
    game.q3_home != null || game.final_home != null
  );

  // Role-based access
  const isPoolOwner = pool && (pool.admin_id == user?.id || pool.created_by == user?.id);
  const canManagePool = isSuperadmin || (isSquareAdmin && isPoolOwner) || isPoolOwner;
  const canSetScores = isSuperadmin;
  const canCalculateWinners = isSuperadmin || isPoolOwner;
  const canAssignNums = !numbersAssigned && canManagePool;

  const getUserCreditBalance = () => {
    if (pool.player_pool_type === 'FREE' || pool.player_pool_type === 'OPEN') return null;
    return pool.user_credits || pool.userCredits || '0.00';
  };

  // Quarter score helper
  const getQuarterScores = (quarter) => {
    if (!game) return { home: null, visitor: null };
    if (quarter === 1) return { home: game.q1_home, visitor: game.q1_visitor };
    if (quarter === 2) return { home: game.half_home, visitor: game.half_visitor };
    if (quarter === 3) return { home: game.q3_home, visitor: game.q3_visitor };
    return { home: game.final_home, visitor: game.final_visitor };
  };

  const quarterLabels = { 1: 'Q1', 2: 'Half', 3: 'Q3', 4: 'Final' };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${selectedSquares.length > 0 ? 'pb-28' : ''}`}>

      {/* Admin Toast Message */}
      {adminMessage && (
        <div className={`fixed top-4 right-4 z-[99999] px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top ${
          adminMessage.type === 'success' ? 'bg-success-500 !text-white' :
          adminMessage.type === 'warning' ? 'bg-warning-500 !text-white' :
          'bg-error-500 !text-white'
        }`}>
          {adminMessage.type === 'success' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          )}
          {adminMessage.text}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/pools')} className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{pool.pool_name || 'Pool'}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">#{pool.pool_number}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasJoined ? (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-50 border border-success-200 dark:bg-success-500/10 dark:border-success-500/30">
                <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-sm font-semibold text-success-600 dark:text-success-400">Joined</span>
              </div>
              {isPoolOpen && !numbersAssigned && (
                <button onClick={() => setShowLeaveConfirm(true)} disabled={leavingPool} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-error-50 border border-error-200 text-error-600 hover:bg-error-100 transition dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Leave
                </button>
              )}
            </>
          ) : isPoolClosed ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error-500 opacity-80">
              <svg className="w-4 h-4 !text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span className="text-sm font-semibold !text-white">Closed</span>
            </div>
          ) : (
            <button onClick={() => setShowJoinModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold !text-white bg-brand-500 hover:bg-brand-600 transition">
              Join Pool
            </button>
          )}
          <button onClick={handleCopyLink} className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition" title="Copy join link">
            {copySuccess ? (
              <svg className="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Pool Closed Notification */}
      {isPoolClosed && (
        <div className="rounded-xl border border-error-300 bg-error-50 p-4 mb-5 flex items-center gap-3 dark:border-error-500/30 dark:bg-error-500/10">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error-100 dark:bg-error-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-error-700 dark:text-error-400">Pool Closed</h3>
            <p className="text-xs text-error-600 dark:text-error-400/80">This pool is no longer accepting new players or square selections.</p>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {(() => {
        if (!winners.length || !user?.id) return null;
        const myWins = winners.filter(w => w.player_id && parseInt(w.player_id) === parseInt(user.id));
        if (myWins.length === 0) return null;
        const quarterLabelsMap = { 1: 'Q1', 2: 'Halftime', 3: 'Q3', 4: 'Final' };
        const allPaid = myWins.every(w => w.is_paid);
        const totalPrize = myWins.reduce((sum, w) => sum + parseFloat(w.prize_amount || 0), 0);

        return (
          <Modal
            isOpen={showWinnerModal}
            onClose={() => setShowWinnerModal(false)}
            title={allPaid ? 'Prizes Paid' : 'Congratulations!'}
            maxWidth="max-w-md"
          >
            <div className="text-center mb-5">
              <div className="mx-auto w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-3">
                <span className="text-3xl">{allPaid ? '🎉' : '👑'}</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {allPaid ? 'Your prizes have been paid!' : 'You Won!'}
              </h4>
              <p className="text-3xl font-bold text-brand-500">
                {totalPrize % 1 === 0 ? totalPrize.toFixed(0) : totalPrize.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {myWins.length > 1 ? `${myWins.length} quarters won` : 'Total prize'}
              </p>
            </div>

            <div className="space-y-2 mb-5">
              {myWins.map((w, i) => {
                const q = typeof w.quarter === 'number' ? w.quarter : parseInt(w.quarter);
                const prize = parseFloat(w.prize_amount || 0);
                return (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                        {quarterLabelsMap[q] || `Q${q}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gray-900 dark:text-white">
                        {prize % 1 === 0 ? prize.toFixed(0) : prize.toFixed(2)}
                      </span>
                      {w.is_paid ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {!hasPaymentMethod && !allPaid && (
              <div className="flex items-center gap-2 rounded-xl bg-warning-50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-500/20 px-4 py-3 mb-5">
                <svg className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-warning-700 dark:text-warning-300">Payment method not set</p>
                  <p className="text-xs text-warning-600 dark:text-warning-400">Set up your payment method to receive your prize.</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {!hasPaymentMethod && !allPaid ? (
                <>
                  <button
                    onClick={() => setShowWinnerModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition"
                  >
                    Close
                  </button>
                  <Link
                    to={`/settings/payment?redirect_url=/pools/${poolNumber}`}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-center !text-white bg-brand-500 hover:bg-brand-600 transition"
                  >
                    Set Up Payment
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => setShowWinnerModal(false)}
                  className="w-full px-4 py-3 rounded-xl font-bold text-sm !text-white bg-brand-500 hover:bg-brand-600 transition"
                >
                  {allPaid ? 'Awesome!' : 'Got It'}
                </button>
              )}
            </div>
          </Modal>
        );
      })()}

      {/* Pool Info Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 mb-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col md:flex-row justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-2xl flex-shrink-0">{leagueEmoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">{league}</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{visitorName} vs {homeName}</div>
              {pool.pool_description ? (
                <div className="mt-1">
                  <div className={`text-sm text-gray-500 dark:text-gray-400 ${descriptionExpanded ? '' : 'line-clamp-2'}`} dangerouslySetInnerHTML={{ __html: pool.pool_description.replace(/\n/g, '<br>') }} />
                  {(pool.pool_description.length > 100 || (pool.pool_description.match(/\n/g) || []).length >= 2) && (
                    <button onClick={() => setDescriptionExpanded(!descriptionExpanded)} className="text-xs font-semibold text-brand-500 hover:underline mt-0.5">{descriptionExpanded ? 'See less' : 'See more'}</button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">-----</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end justify-center gap-1 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {formatDate(gameDate)}
            </div>
            {pool.close_datetime && <p className="text-xs text-gray-500 dark:text-gray-400">Closes: {formatDate(pool.close_datetime)}</p>}
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      {hasScores && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 mb-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Scoreboard</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[{ q: 1, label: '1st Quarter', key: 'q1' }, { q: 2, label: 'Halftime', key: 'half' }, { q: 3, label: '3rd Quarter', key: 'q3' }, { q: 4, label: 'Final', key: 'final' }].map(({ q, label, key }) => {
              const scores = getQuarterScores(q);
              const has = scores.home != null;
              const isFinal = q === 4 && has;
              return (
                <div key={q} className={`rounded-xl p-3 text-center ${isFinal ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30' : has ? 'bg-gray-50 dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50 opacity-50'}`}>
                  <p className={`text-xs font-medium mb-1 ${isFinal ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}`}>{label}</p>
                  <p className={`text-lg font-bold ${isFinal ? 'text-brand-600 dark:text-brand-400' : has ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                    {has ? `${scores.visitor} - ${scores.home}` : '—'}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">{visitorName}</span><span>vs</span><span className="font-medium">{homeName}</span>
          </div>
        </div>
      )}

      {/* Admin Controls Panel */}
      {canManagePool && (
        <div className="rounded-2xl border-2 border-brand-200 bg-white mb-5 overflow-hidden dark:border-brand-500/30 dark:bg-white/[0.03]">
          {/* Toggle Header */}
          <button
            onClick={() => setShowAdminControls(!showAdminControls)}
            className="w-full flex items-center justify-between px-4 py-3 bg-brand-50/50 dark:bg-brand-500/5 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
                <svg className="w-5 h-5 !text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Admin Controls</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {canSetScores ? 'Manage scores, winners & pool settings' : 'Calculate winners & manage pool'}
                </p>
              </div>
            </div>
            <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showAdminControls ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>

          {showAdminControls && (
            <div className="p-4 space-y-4 border-t border-brand-100 dark:border-brand-500/20">

              {/* Quarter Cards — Scores & Winners */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {canSetScores ? 'Scores & Winners' : 'Calculate Winners'}
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((quarter) => {
                    const scores = getQuarterScores(quarter);
                    const qHasScores = scores.home != null && scores.visitor != null;
                    const quarterWinner = winners.find(w => (w.quarter || w.Quarter) === quarter);
                    const hasWinner = !!quarterWinner;

                    const scoresChanged = hasWinner && qHasScores &&
                      (quarterWinner.home_score !== scores.home || quarterWinner.visitor_score !== scores.visitor);

                    return (
                      <div key={quarter} className={`rounded-xl border-2 p-3 transition ${
                        scoresChanged ? 'border-error-400 bg-error-50/50 dark:bg-error-500/5 dark:border-error-500/50' :
                        hasWinner ? 'border-success-400 bg-success-50/50 dark:bg-success-500/5 dark:border-success-500/50' :
                        'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                      }`}>
                        <p className={`text-xs font-bold text-center uppercase tracking-wider mb-2 ${
                          hasWinner ? 'text-success-600 dark:text-success-400' : 'text-brand-500'
                        }`}>{quarterLabels[quarter]}</p>

                        {/* Score display */}
                        <div className="text-center mb-2">
                          {qHasScores ? (
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{scores.visitor} - {scores.home}</p>
                          ) : (
                            <p className="text-lg font-bold text-gray-300 dark:text-gray-600">— - —</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-1.5">
                          {/* Superadmin: Set/Edit Scores */}
                          {canSetScores && (
                            <button
                              onClick={() => handleOpenScoreModal(quarter)}
                              disabled={calculatingWinners}
                              className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg transition bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 disabled:opacity-50"
                            >
                              {qHasScores ? 'Edit Scores' : 'Set Scores'}
                            </button>
                          )}

                          {/* Waiting for scores (pool owner, not superadmin) */}
                          {!qHasScores && canCalculateWinners && !canSetScores && (
                            <div className="text-xs px-2 py-1.5 rounded-lg text-center bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400">
                              Waiting for scores
                            </div>
                          )}

                          {/* Scores changed warning */}
                          {scoresChanged && (
                            <div className="text-xs px-2 py-1 rounded-lg text-center bg-error-100 text-error-600 dark:bg-error-500/15 dark:text-error-400">
                              Scores changed
                            </div>
                          )}

                          {/* Calculate/Recalculate Winner */}
                          {qHasScores && canCalculateWinners && (!hasWinner || scoresChanged) && (
                            <button
                              onClick={() => handleCalculateWinner(quarter)}
                              disabled={calculatingWinners}
                              className={`w-full text-xs font-semibold px-2 py-1.5 rounded-lg transition disabled:opacity-50 !text-white ${
                                scoresChanged ? 'bg-error-500 hover:bg-error-600' : 'bg-brand-500 hover:bg-brand-600'
                              }`}
                            >
                              {calculatingWinners ? 'Calculating...' : scoresChanged ? 'Recalculate' : 'Calculate Winner'}
                            </button>
                          )}

                          {/* Winner info */}
                          {hasWinner && !scoresChanged && (
                            <div className={`text-xs font-semibold px-2 py-1.5 rounded-lg text-center ${
                              quarterWinner.player_id
                                ? 'bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-400'
                                : 'bg-error-100 text-error-600 dark:bg-error-500/15 dark:text-error-400'
                            }`}>
                              {quarterWinner.player_id ? (
                                <>{quarterWinner.player?.name?.split(' ')[0] || quarterWinner.player_name?.split(' ')[0] || 'Winner'}</>
                              ) : 'Unclaimed'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pool Tools */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Pool Tools</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Close / Reopen Pool */}
                  {pool.pool_status === 'open' ? (
                    <button
                      onClick={handleClosePool}
                      disabled={updatingPool}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      {updatingPool ? 'Updating...' : 'Close Pool'}
                    </button>
                  ) : (
                    <button
                      onClick={handleReopenPool}
                      disabled={updatingPool}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                      {updatingPool ? 'Updating...' : 'Reopen Pool'}
                    </button>
                  )}

                  {/* Assign Numbers - Random */}
                  {canAssignNums && (
                    <button
                      onClick={handleAssignNumbers}
                      disabled={assigningNumbers}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      {assigningNumbers ? 'Assigning...' : 'Randomize Numbers'}
                    </button>
                  )}

                  {/* Assign Numbers - Ascending */}
                  {canAssignNums && (
                    <button
                      onClick={handleAssignAscending}
                      disabled={assigningNumbers}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                      {assigningNumbers ? 'Assigning...' : 'Ascending (0-9)'}
                    </button>
                  )}

                  {/* Set / Change Password */}
                  <button
                    onClick={() => { setNewPassword(''); setShowPasswordModal(true); }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    {pool.has_password ? 'Change Password' : 'Set Password'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 10x10 Grid */}
      <div className="mb-6">
        <SquaresGrid
          grid={gridData} squares={squares} currentPlayerId={user?.id}
          disabled={!hasJoined || !isPoolOpen} selectionMode={selectionMode}
          selectedSquares={selectedSquares} onSquareSelect={setSelectedSquares}
          onLimitReached={() => {}}
        />
      </div>

      {/* Winners Section */}
      {(winners.length > 0 || isPoolCompleted || isPoolInProgress) && (
        <div className="mb-6"><WinnersDisplay pool={pool} winners={winners} game={pool.game} /></div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">% Filled</p>
          <p className="text-xl font-bold text-brand-500">{claimedCount}%</p>
        </div>
        {getUserCreditBalance() !== null && (
          <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Your Credits</p>
            <p className="text-xl font-bold text-success-500">{getUserCreditBalance()}</p>
          </div>
        )}
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Type</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white uppercase">{pool.player_pool_type || 'N/A'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Status</p>
          <p className={`text-lg font-bold capitalize ${isPoolOpen ? 'text-success-500' : isPoolClosed ? 'text-error-500' : 'text-warning-500'}`}>{pool.pool_status || 'N/A'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Entry / square</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{pool.player_pool_type === 'FREE' || parseFloat(pool.entry_fee || pool.credit_cost || 0) === 0 ? 'FREE' : parseFloat(pool.entry_fee || pool.credit_cost || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Payout</p>
          <p className="text-xl font-bold text-brand-500">{parseFloat(pool.custom_payout || pool.total_pot || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Total Players</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{pool.players_count || pool.players?.length || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Max per player</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{maxPerPlayer || '∞'}</p>
        </div>
      </div>

      {/* Pool Rules & How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <button onClick={() => setRulesExpanded(!rulesExpanded)} className="w-full flex items-center justify-between md:cursor-default">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Pool Rules</h3>
            <div className="md:hidden"><svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${rulesExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${rulesExpanded ? 'max-h-[500px] mt-3' : 'max-h-0 md:max-h-none md:mt-3'}`}>
            <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-3"><span className="text-brand-500 font-bold mt-0.5">•</span><p>Max {maxPerPlayer ? `${maxPerPlayer} squares per player` : 'Unlimited squares per player'}</p></div>
              {pool.player_pool_type !== 'FREE' && pool.player_pool_type !== 'OPEN' && parseFloat(pool.entry_fee || pool.credit_cost || 0) > 0 && (
                <div className="flex items-start gap-3"><span className="text-brand-500 font-bold mt-0.5">•</span><p>Cost: {parseFloat(pool.entry_fee || pool.credit_cost || 0).toFixed(2)} per square</p></div>
              )}
              <div className="flex items-start gap-3"><span className="text-brand-500 font-bold mt-0.5">•</span><p>Numbers assignment: {numbersTypeLabel}</p></div>
              {(pool.close_datetime || pool.closeDate) && (
                <div className="flex items-start gap-3"><span className="text-brand-500 font-bold mt-0.5">•</span><p>Pool closes: {formatDate(pool.close_datetime || pool.closeDate)}</p></div>
              )}
              {pool.pool_description && (
                <div className="flex items-start gap-3">
                  <span className="text-brand-500 font-bold mt-0.5">•</span>
                  <div className="flex-1">
                    <div className={descriptionExpanded ? '' : 'line-clamp-3'} dangerouslySetInnerHTML={{ __html: pool.pool_description.replace(/\n/g, '<br>') }} />
                    {(pool.pool_description.length > 150 || (pool.pool_description.match(/\n/g) || []).length >= 3) && (
                      <button onClick={(e) => { e.stopPropagation(); setDescriptionExpanded(!descriptionExpanded); }} className="text-xs font-semibold text-brand-500 hover:underline mt-1">{descriptionExpanded ? 'See less' : 'See more'}</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <button onClick={() => setHowItWorksExpanded(!howItWorksExpanded)} className="w-full flex items-center justify-between md:cursor-default">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">How It Works</h3>
            <div className="md:hidden"><svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${howItWorksExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${howItWorksExpanded ? 'max-h-[500px] mt-3' : 'max-h-0 md:max-h-none md:mt-3'}`}>
            <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-3"><span className="text-brand-500 font-bold mt-0.5">1.</span><p>Select your squares on the 10x10 grid{maxPerPlayer ? ` (max ${maxPerPlayer} per player)` : ''}.</p></div>
              <div className="flex items-start gap-3"><span className="text-brand-500 font-bold mt-0.5">2.</span><p>Numbers (0-9) are assigned to each axis{numbersType === 'Ascending' ? ' in ascending order' : numbersType === 'AdminTrigger' ? ' by admin' : ' randomly'}.</p></div>
              <div className="flex items-start gap-3"><span className="text-brand-500 font-bold mt-0.5">3.</span><p>X-axis = Visitor team's last digit, Y-axis = Home team's last digit.</p></div>
              <div className="flex items-start gap-3"><span className="text-brand-500 font-bold mt-0.5">4.</span><p>Prizes distributed based on reward structure.</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Distribution */}
      {(() => {
        const r1 = parseFloat(pool.reward1_percent || 0);
        const r2 = parseFloat(pool.reward2_percent || 0);
        const r3 = parseFloat(pool.reward3_percent || 0);
        const r4 = parseFloat(pool.reward4_percent || 0);
        if (r1 + r2 + r3 + r4 === 0) return null;

        const totalPayout = pool.custom_payout ? parseFloat(pool.custom_payout) : parseFloat(pool.entry_fee || 0) * 100;
        const quarters = [
          { label: '1st Quarter', percent: r1 },
          { label: 'Halftime', percent: r2 },
          { label: '3rd Quarter', percent: r3 },
          { label: 'Final Score', percent: r4 },
        ].filter(q => q.percent > 0);

        if (quarters.length === 0) return null;

        const colsClass = quarters.length === 1 ? 'grid-cols-1' : quarters.length === 2 ? 'grid-cols-2' : quarters.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4';

        return (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 mb-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Payout Distribution</h3>
            <div className={`grid ${colsClass} gap-3`}>
              {quarters.map((q, i) => {
                const prize = totalPayout > 0 ? (totalPayout * q.percent / 100) : 0;
                return (
                  <div key={i} className="p-3 rounded-xl text-center bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{q.label}</p>
                    {totalPayout > 0 && (
                      <p className="text-2xl font-bold text-brand-500 mt-1">
                        {prize % 1 === 0 ? prize.toFixed(0) : prize.toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{q.percent}%</p>
                  </div>
                );
              })}
            </div>
            {totalPayout > 0 && (
              <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                Total Payout: {totalPayout % 1 === 0 ? totalPayout.toFixed(0) : totalPayout.toFixed(2)}
              </p>
            )}
          </div>
        );
      })()}

      {/* Selection Footer */}
      <SelectionFooter selectedSquares={selectedSquares} onConfirm={handleConfirmClaim} onCancel={() => setSelectedSquares([])} costPerSquare={costPerSquare} maxPerPlayer={maxPerPlayer} currentOwnedCount={mySquaresCount} isConfirming={isConfirming} claimProgress={claimProgress} />

      {/* Join Pool Modal */}
      <JoinPoolModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />

      {/* Score Modal (Superadmin only) */}
      {showScoreModal && selectedQuarter && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowScoreModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowScoreModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 mb-3">
                <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                  {selectedQuarter === 4 ? 'FINAL' : selectedQuarter === 2 ? 'HALFTIME' : `QUARTER ${selectedQuarter}`}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enter Scores</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter the cumulative score at the end of {selectedQuarter === 4 ? 'the game' : selectedQuarter === 2 ? 'the first half' : `Q${selectedQuarter}`}
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex flex-col items-center flex-1">
                {getTeamLogo(visitorTeamId) ? (
                  <img src={getTeamLogo(visitorTeamId)} alt="Away" className="w-14 h-14 object-contain mb-2" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2 text-lg font-bold text-gray-500 dark:text-gray-400">A</div>
                )}
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">{visitorName}</p>
                <input
                  type="number" min="0" value={scoreVisitor}
                  onChange={(e) => setScoreVisitor(e.target.value)}
                  placeholder="0"
                  className="w-20 h-16 text-center text-3xl font-bold rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white transition"
                />
              </div>
              <div className="text-lg font-bold text-gray-300 dark:text-gray-600">vs</div>
              <div className="flex flex-col items-center flex-1">
                {getTeamLogo(homeTeamId) ? (
                  <img src={getTeamLogo(homeTeamId)} alt="Home" className="w-14 h-14 object-contain mb-2" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center mb-2 text-lg font-bold !text-white">H</div>
                )}
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">{homeName}</p>
                <input
                  type="number" min="0" value={scoreHome}
                  onChange={(e) => setScoreHome(e.target.value)}
                  placeholder="0"
                  className="w-20 h-16 text-center text-3xl font-bold rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white transition"
                />
              </div>
            </div>

            {/* Winning square preview */}
            {scoreHome !== '' && scoreVisitor !== '' && (
              <div className="text-center p-3 rounded-xl bg-brand-50 border border-brand-200 mb-4 dark:bg-brand-500/10 dark:border-brand-500/30">
                <p className="text-xs text-gray-500 dark:text-gray-400">Winning Last Digits</p>
                <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
                  {parseInt(scoreVisitor) % 10} × {parseInt(scoreHome) % 10}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowScoreModal(false)} className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition">
                Cancel
              </button>
              <button
                onClick={handleSaveScores}
                disabled={calculatingWinners || scoreHome === '' || scoreVisitor === ''}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-sm !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {calculatingWinners ? 'Saving...' : 'Save Scores'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-gray-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pool.has_password ? 'Change Password' : 'Set Password'}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {pool.has_password ? 'Update or remove the pool password' : 'Add a password to restrict access'}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">New Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={pool.has_password ? 'Enter new password (or leave empty to remove)' : 'Enter password (min 4 chars)'}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              {pool.has_password && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Leave empty and save to remove the password.</p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition">
                Cancel
              </button>
              <button
                onClick={handleUpdatePassword}
                disabled={savingPassword || (!pool.has_password && newPassword.length < 4)}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm !text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {savingPassword ? 'Saving...' : newPassword ? 'Save Password' : 'Remove Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Pool Confirm */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowLeaveConfirm(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-gray-900 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Leave Pool?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">You will lose all your selected squares. This action cannot be undone.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 transition">Cancel</button>
              <button onClick={handleLeavePool} disabled={leavingPool} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium !text-white bg-error-500 hover:bg-error-600 disabled:opacity-50 transition">{leavingPool ? 'Leaving...' : 'Leave Pool'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoolDetail;

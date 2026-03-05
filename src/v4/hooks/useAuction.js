import { useState, useCallback } from 'react';
import { useAxios } from '../../app/contexts/AxiosContext';

const useAuction = () => {
  const axiosService = useAxios();

  const [auctions, setAuctions] = useState([]);
  const [auction, setAuction] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [members, setMembers] = useState([]);
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ──── Admin Methods ────

  const fetchAllAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosService.get('/api/auctions/all');
      setAuctions(response.data || []);
      return response.data || [];
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch auctions');
      return [];
    } finally {
      setLoading(false);
    }
  }, [axiosService]);

  const createAuction = useCallback(async (data) => {
    try {
      const response = await axiosService.post('/api/auctions/create', data);
      return response.data;
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Failed to create auction' };
    }
  }, [axiosService]);

  const startAuction = useCallback(async (auctionId) => {
    try {
      const response = await axiosService.get(`/api/auctions/${auctionId}/start`);
      return { status: true, data: response.data };
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Failed to start auction' };
    }
  }, [axiosService]);

  const endAuction = useCallback(async (auctionId) => {
    try {
      const response = await axiosService.get(`/api/auctions/${auctionId}/end`);
      return { status: true, data: response.data };
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Failed to end auction' };
    }
  }, [axiosService]);

  const cancelAuction = useCallback(async (auctionId) => {
    try {
      const response = await axiosService.get(`/api/auctions/${auctionId}/cancel`);
      return { status: true, data: response.data };
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Failed to cancel auction' };
    }
  }, [axiosService]);

  const setStreamUrl = useCallback(async (auctionId, streamUrl) => {
    try {
      const response = await axiosService.post(`/api/auctions/${auctionId}/set-stream-url`, { stream_url: streamUrl });
      return { status: true, data: response.data };
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Failed to set stream URL' };
    }
  }, [axiosService]);

  const finalizeBracket = useCallback(async (auctionId, teams) => {
    try {
      const response = await axiosService.post(`/api/auctions/${auctionId}/brackets`, { teams });
      return { status: true, data: response.data };
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Failed to finalize bracket' };
    }
  }, [axiosService]);

  const setActiveItemOnServer = useCallback(async (auctionId, itemId) => {
    try {
      const response = await axiosService.get(`/api/auctions/${auctionId}/${itemId}/set-active-item`);
      return { status: true, data: response.data };
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Failed to set active item' };
    }
  }, [axiosService]);

  const endActiveItem = useCallback(async (auctionId, itemId, soldTo, soldAmount) => {
    try {
      const response = await axiosService.post(`/api/auctions/${auctionId}/${itemId}/end-active-item`, {
        sold_to: soldTo,
        sold_amount: soldAmount,
      });
      return { status: true, data: response.data };
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Failed to end item' };
    }
  }, [axiosService]);

  const placeBidAdmin = useCallback(async (auctionId, itemId, bidAmount, userId = null) => {
    const data = { bid_amount: bidAmount };
    if (userId) data.user_id = userId;
    try {
      const response = await axiosService.post(`/api/auctions/${auctionId}/${itemId}/bid`, data);
      return response.data;
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Failed to place bid' };
    }
  }, [axiosService]);

  const removeBid = useCallback(async (bidId) => {
    try {
      const response = await axiosService.post('/api/auctions/remove-bid', { bid_id: bidId });
      return { status: true, data: response.data };
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Failed to remove bid' };
    }
  }, [axiosService]);

  const setAmounts = useCallback(async (auctionId, data) => {
    try {
      const response = await axiosService.post(`/api/auctions/${auctionId}/set-amounts`, data);
      return response.data;
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Failed to set amounts' };
    }
  }, [axiosService]);

  const fetchAuctionUsers = useCallback(async (auctionId, filter = 'escrow') => {
    try {
      const response = await axiosService.get(`/api/auctions/${auctionId}/users?filter=${filter}`);
      return response.data || [];
    } catch (err) {
      return [];
    }
  }, [axiosService]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const q = process.env.REACT_APP_USER_QUERY || 0;
      // eslint-disable-next-line eqeqeq
      const param = q == 1 ? '?query=true' : '';
      const response = await axiosService.get(`/api/users/all${param}`);
      return response.data || [];
    } catch (err) {
      return [];
    }
  }, [axiosService]);

  // ──── Player Methods ────

  const fetchLiveAuctions = useCallback(async () => {
    try {
      const response = await axiosService.get('/api/auctions/live');
      const data = response.data || [];
      setLiveAuctions(data);
      return data;
    } catch (err) {
      setLiveAuctions([]);
      return [];
    }
  }, [axiosService]);

  const fetchUpcoming = useCallback(async () => {
    try {
      const response = await axiosService.get('/api/auctions/upcoming');
      setUpcomingAuctions(response.data || []);
      return response.data || [];
    } catch (err) {
      setUpcomingAuctions([]);
      return [];
    }
  }, [axiosService]);

  const fetchMyItems = useCallback(async () => {
    try {
      const response = await axiosService.get('/api/auctions/my-items');
      setMyItems(response.data || []);
      return response.data || [];
    } catch (err) {
      setMyItems([]);
      return [];
    }
  }, [axiosService]);

  const joinAuction = useCallback(async (auctionId) => {
    try {
      const response = await axiosService.get(`/api/auctions/${auctionId}/join`);
      return { status: true, data: response.data };
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Failed to join auction' };
    }
  }, [axiosService]);

  const leaveAuction = useCallback(async (auctionId, userId) => {
    try {
      const response = await axiosService.post(`/api/auctions/${auctionId}/${userId}/leave`);
      return { status: true, data: response.data };
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Failed to leave auction' };
    }
  }, [axiosService]);

  const placeBid = useCallback(async (auctionId, itemId, bidAmount) => {
    try {
      const response = await axiosService.post(`/api/auctions/${auctionId}/${itemId}/bid`, {
        bid_amount: bidAmount,
      });
      return response.data;
    } catch (err) {
      return { status: false, message: err.response?.data?.message || 'Unable to place bid' };
    }
  }, [axiosService]);

  const fetchAuctionById = useCallback(async (auctionId) => {
    try {
      const response = await axiosService.get(`/api/auctions/${auctionId}/get-by-id`);
      setAuction(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch auction');
      return null;
    }
  }, [axiosService]);

  const fetchActiveItem = useCallback(async (auctionId, itemId) => {
    try {
      const response = await axiosService.get(`/api/auctions/${auctionId}/${itemId}/get-active-item`);
      setActiveItem(response.data);
      return response.data;
    } catch (err) {
      setActiveItem(null);
      return null;
    }
  }, [axiosService]);

  const fetchMembers = useCallback(async (auctionId) => {
    try {
      const response = await axiosService.get(`/api/auctions/${auctionId}/members`);
      setMembers(response.data || []);
      return response.data || [];
    } catch (err) {
      return [];
    }
  }, [axiosService]);

  return {
    // State
    auctions,
    auction,
    activeItem,
    members,
    liveAuctions,
    upcomingAuctions,
    myItems,
    loading,
    error,
    // Setters
    setAuction,
    setActiveItem,
    setMembers,
    setAuctions,
    // Admin
    fetchAllAuctions,
    createAuction,
    startAuction,
    endAuction,
    cancelAuction,
    setStreamUrl,
    finalizeBracket,
    setActiveItemOnServer,
    endActiveItem,
    placeBidAdmin,
    removeBid,
    setAmounts,
    fetchAuctionUsers,
    fetchAllUsers,
    // Player
    fetchLiveAuctions,
    fetchUpcoming,
    fetchMyItems,
    joinAuction,
    leaveAuction,
    placeBid,
    fetchAuctionById,
    fetchActiveItem,
    fetchMembers,
  };
};

export default useAuction;

/**
 * Squares Pool API Service
 * Connects to Laravel backend for all squares pool operations
 *
 * NOTE: This service requires an authenticated axios instance from AxiosContext.
 * Create an instance by calling: new SquaresApiService(axiosInstance)
 */

class SquaresApiService {
  /**
   * @param {Object} axiosInstance - Authenticated axios instance from AxiosContext
   */
  constructor(axiosInstance) {
    this.axios = axiosInstance;
  }
  /**
   * Get all pools with optional filters
   * GET /api/squares-pools
   */
  async getPools(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.league) params.append('league', filters.league);

      const response = await this.axios.get(`/api/squares-pools?${params.toString()}`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error fetching pools:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch pools' };
    }
  }

  /**
   * Get single pool with details
   * GET /api/squares-pools/{id}
   */
  async getPool(poolId) {
    try {
      const response = await this.axios.get(`/api/squares-pools/${poolId}`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error fetching pool:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch pool' };
    }
  }

  /**
   * Create new pool
   * POST /api/squares-pools
   */
  async createPool(poolData) {
    try {
      // Map UI field names to backend field names
      const requestData = {
        pool_name: poolData.gridName,
        pool_description: poolData.poolDescription,
        game_id: poolData.gameID,
        pool_type: poolData.numbersType === 'Ascending' ? 'A' : 'B', // A = Ascending, B = TimeSet/AdminTrigger
        numbers_type: poolData.numbersType,
        player_pool_type: poolData.costType === 'Free' ? 'FREE' : 'CREDIT',
        reward_type: poolData.rewardsType || 'CreditsRewards',
        password: poolData.poolPassword,
        entry_fee: poolData.costPerSquare,
        credit_cost: poolData.costPerSquare,
        max_squares_per_player: poolData.maxSquaresPerPlayer,
        close_datetime: poolData.closeDate,
        number_assign_datetime: poolData.numbersAssignDate,
        game_reward_type_id: poolData.gameRewardTypeID,
        home_team_id: poolData.homeTeamId,
        visitor_team_id: poolData.visitorTeamId,
        game_nickname: poolData.gameNickname,
        external_pool_id: poolData.externalPoolId,
      };

      const response = await this.axios.post('/api/squares-pools', requestData);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error creating pool:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.errors || 'Failed to create pool'
      };
    }
  }

  /**
   * Join a pool
   * POST /api/squares-pools/join
   */
  async joinPool(poolNumber, password = '') {
    try {
      const response = await this.axios.post('/api/squares-pools/join', {
        pool_number: poolNumber,
        password: password,
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error joining pool:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to join pool' };
    }
  }

  /**
   * Claim/select squares
   * POST /api/squares-pools/{id}/claim-square
   */
  async claimSquares(poolId, coordinates) {
    try {
      // Backend expects individual square claims, but we can batch them
      const results = [];
      for (const coord of coordinates) {
        const response = await this.axios.post(`/api/squares-pools/${poolId}/claim-square`, {
          x_coordinate: coord.x,
          y_coordinate: coord.y,
        });
        results.push(response.data);
      }
      return { success: true, data: results };
    } catch (error) {
      console.error('Error claiming squares:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to claim squares' };
    }
  }

  /**
   * Release a square
   * POST /api/squares-pools/release-square
   */
  async releaseSquare(poolId, squareId) {
    try {
      const response = await this.axios.post('/api/squares-pools/release-square', {
        pool_id: poolId,
        square_id: squareId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error releasing square:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to release square' };
    }
  }

  /**
   * Calculate winners for a specific quarter
   * POST /api/squares-pools/{id}/calculate-winners
   */
  async calculateWinners(poolId, quarter) {
    try {
      const response = await this.axios.post(`/api/squares-pools/${poolId}/calculate-winners`, {
        quarter: quarter,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error calculating winners:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to calculate winners' };
    }
  }

  /**
   * Calculate all winners (all 4 quarters)
   * POST /api/squares-pools/{id}/calculate-all-winners
   */
  async calculateAllWinners(poolId) {
    try {
      const response = await this.axios.post(`/api/squares-pools/${poolId}/calculate-all-winners`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error calculating all winners:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to calculate all winners' };
    }
  }

  /**
   * Get winners for a pool
   * GET /api/squares-pools/{id}/winners
   */
  async getWinners(poolId) {
    try {
      const response = await this.axios.get(`/api/squares-pools/${poolId}/winners`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error fetching winners:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch winners' };
    }
  }

  /**
   * Manually assign numbers to a pool
   * POST /api/squares-pools/{id}/assign-numbers
   */
  async assignNumbers(poolId, payload = {}) {
    try {
      const response = await this.axios.post(`/api/squares-pools/${poolId}/assign-numbers`, payload);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error assigning numbers:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to assign numbers' };
    }
  }

  /**
   * Get games for pool creation
   * GET /api/games
   */
  async getGames(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.league) params.append('league', filters.league);

      const response = await this.axios.get(`/api/games?${params.toString()}`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error fetching games:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch games' };
    }
  }

  /**
   * Get game reward types
   * GET /api/game-reward-types
   */
  async getRewardTypes() {
    try {
      const response = await this.axios.get('/api/game-reward-types');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error fetching reward types:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch reward types' };
    }
  }

  /**
   * Get player's joined pools
   * GET /api/squares-pools/my-pools
   */
  async getMyPools() {
    try {
      const response = await this.axios.get('/api/squares-pools/my-pools');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error fetching my pools:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch my pools' };
    }
  }

  /**
   * Approve/Deny player join request (Admin only)
   * POST /api/squares-pools/approve-player
   */
  async approvePlayer(poolId, playerId, status) {
    try {
      const response = await this.axios.post('/api/squares-pools/approve-player', {
        pool_id: poolId,
        player_id: playerId,
        join_status: status, // 'Approved' or 'Denied'
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error approving player:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to approve player' };
    }
  }

  /**
   * Get pending join requests for a pool (Admin only)
   * GET /api/squares-pools/{id}/pending-requests
   */
  async getPendingRequests(poolId) {
    try {
      const response = await this.axios.get(`/api/squares-pools/${poolId}/pending-requests`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch pending requests' };
    }
  }

  /**
   * Get players who joined a pool
   * GET /api/squares-pools/{id}/players
   */
  async getPoolPlayers(poolId) {
    try {
      const response = await this.axios.get(`/api/squares-pools/${poolId}/players`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error fetching pool players:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch pool players' };
    }
  }

  /**
   * Grant credits to a pool player
   * POST /api/squares-pools/{id}/add-credits
   */
  async grantCredits(poolId, playerId, credits) {
    try {
      const response = await this.axios.post(`/api/squares-pools/${poolId}/add-credits`, {
        player_id: playerId,
        credits,
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error granting credits:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to grant credits' };
    }
  }

  /**
   * Delete pool (Admin only)
   * DELETE /api/squares-pools/{id}
   */
  async deletePool(poolId) {
    try {
      const response = await this.axios.delete(`/api/squares-pools/${poolId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting pool:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to delete pool' };
    }
  }

  /**
   * Create a new game (matches V1 API endpoint)
   * POST /api/games/create
   */
  async createGame(gameData) {
    try {
      const response = await this.axios.post('/api/games/create', gameData);
      return { success: response.data.status || false, data: response.data, message: response.data.message };
    } catch (error) {
      console.error('Error creating game:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to create game' };
    }
  }

  /**
   * Update an existing game (matches V1 API endpoint)
   * POST /api/games/update/{id}
   */
  async updateGame(gameId, gameData) {
    try {
      const response = await this.axios.post(`/api/games/update/${gameId}`, gameData);
      return { success: response.data.status || false, data: response.data, message: response.data.message };
    } catch (error) {
      console.error('Error updating game:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update game' };
    }
  }

  /**
   * Delete a game
   * DELETE /api/games/{id}
   */
  async deleteGame(gameId) {
    try {
      const response = await this.axios.delete(`/api/games/${gameId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting game:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to delete game' };
    }
  }

  /**
   * Get teams for game creation
   * GET /api/teams
   */
  async getTeams() {
    try {
      const response = await this.axios.get('/api/teams');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching teams:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch teams' };
    }
  }

  // ============================================
  // CREDIT REQUEST METHODS
  // ============================================

  /**
   * Request credits from pool commissioner (Player → Commissioner)
   * POST /api/credit-requests/pools/{poolId}/request
   */
  async requestCreditsFromCommissioner(poolId, amount, reason = '') {
    try {
      const response = await this.axios.post(`/api/credit-requests/pools/${poolId}/request`, {
        amount,
        reason,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error requesting credits from commissioner:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to request credits'
      };
    }
  }

  /**
   * Get credit requests for a specific pool (Commissioner only)
   * GET /api/credit-requests/pools/{poolId}
   */
  async getPoolCreditRequests(poolId) {
    try {
      const response = await this.axios.get(`/api/credit-requests/pools/${poolId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching pool credit requests:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch credit requests' };
    }
  }

  /**
   * Get all credit requests where current user is commissioner
   * GET /api/credit-requests/commissioner
   */
  async getCommissionerCreditRequests() {
    try {
      const response = await this.axios.get('/api/credit-requests/commissioner');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching commissioner credit requests:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch credit requests' };
    }
  }

  /**
   * Approve or deny a credit request (Commissioner or Superadmin)
   * PATCH /api/credit-requests/{requestId}
   */
  async updateCreditRequest(requestId, status, adminNote = '') {
    try {
      const response = await this.axios.patch(`/api/credit-requests/${requestId}`, {
        status, // 'approved' or 'denied'
        admin_note: adminNote,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating credit request:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update credit request' };
    }
  }

  /**
   * Request credits from Superadmin (Square Admin → Superadmin)
   * POST /api/credit-requests/admin/request
   */
  async requestCreditsFromSuperadmin(amount, reason) {
    try {
      const response = await this.axios.post('/api/credit-requests/admin/request', {
        amount,
        reason,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error requesting credits from superadmin:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to request credits'
      };
    }
  }

  /**
   * Get all admin credit requests (Superadmin only)
   * GET /api/credit-requests/admin
   */
  async getSuperadminCreditRequests() {
    try {
      const response = await this.axios.get('/api/credit-requests/admin');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching superadmin credit requests:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch credit requests' };
    }
  }

  /**
   * Approve or deny an admin credit request (Superadmin only)
   * PATCH /api/credit-requests/admin/{requestId}
   */
  async updateAdminCreditRequest(requestId, status, adminNote = '') {
    try {
      const response = await this.axios.patch(`/api/credit-requests/admin/${requestId}`, {
        status, // 'approved' or 'denied'
        admin_note: adminNote,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating admin credit request:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update credit request' };
    }
  }

  /**
   * Get current user's credit requests
   * GET /api/credit-requests/my-requests
   */
  async getMyCreditRequests() {
    try {
      const response = await this.axios.get('/api/credit-requests/my-requests');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching my credit requests:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch credit requests' };
    }
  }
}

export default SquaresApiService;

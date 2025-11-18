/**
 * Mock Data Service for Squares Pool Development
 * This simulates the backend API responses
 */

// Mock Games Data
export const mockGames = [
  {
    gameID: 1,
    league: 'NFL',
    homeTeam: 'Kansas City Chiefs',
    visitorTeam: 'Buffalo Bills',
    gameTime: '2025-11-20T18:00:00',
    gameStatus: 'NotStarted',
    gameDescription: 'AFC Championship Game',
    gameNickname: 'Chiefs vs Bills',
    homeFinalScore: null,
    visitorFinalScore: null,
    homeHalfTimeScore: null,
    visitorHalfTimeScore: null,
  },
  {
    gameID: 2,
    league: 'NFL',
    homeTeam: 'San Francisco 49ers',
    visitorTeam: 'Dallas Cowboys',
    gameTime: '2025-11-21T16:00:00',
    gameStatus: 'NotStarted',
    gameDescription: 'NFC Championship Game',
    gameNickname: '49ers vs Cowboys',
    homeFinalScore: null,
    visitorFinalScore: null,
  },
  {
    gameID: 3,
    league: 'NBA',
    homeTeam: 'Los Angeles Lakers',
    visitorTeam: 'Boston Celtics',
    gameTime: '2025-11-22T19:30:00',
    gameStatus: 'NotStarted',
    gameDescription: 'Classic Rivalry',
    gameNickname: 'Lakers vs Celtics',
  },
];

// Mock Reward Types
export const mockRewardTypes = [
  {
    id: 1,
    name: 'Default, One Winner',
    description: 'Single winner takes all',
    reward1Percent: 1.0,
  },
  {
    id: 2,
    name: 'Half and Final, 50-50',
    description: 'Half time and final score split evenly',
    reward1Percent: 0.5,
    reward2Percent: 0.5,
  },
  {
    id: 3,
    name: 'All Quarters Equal',
    description: 'Each quarter gets 25%',
    reward1Percent: 0.25,
    reward2Percent: 0.25,
    reward3Percent: 0.25,
    reward4Percent: 0.25,
  },
  {
    id: 4,
    name: 'Q1-Q2-Q3-Final (10-20-20-50)',
    description: 'Progressive rewards',
    reward1Percent: 0.1,
    reward2Percent: 0.2,
    reward3Percent: 0.2,
    reward4Percent: 0.5,
  },
];

// Generate empty 10x10 grid
export const generateEmptyGrid = (gridID) => {
  const squares = [];
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      squares.push({
        id: `${gridID}-${x}-${y}`,
        gridID,
        xCoordinate: x,
        yCoordinate: y,
        xNumber: null,
        yNumber: null,
        playerID: null,
        playerName: null,
        playerInitials: null,
      });
    }
  }
  return squares;
};

// Generate random numbers 0-9
export const generateRandomNumbers = () => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return numbers.sort(() => Math.random() - 0.5);
};

// Mock Grid Data
export const mockGrids = [
  {
    id: 1,
    gridName: 'Super Bowl LVIX Squares',
    poolNumber: 'SQ2025001',
    poolPassword: 'chiefs2025',
    gameID: 1,
    game: mockGames[0],
    owner: 1,
    admin: 1,
    numbersType: 'TimeSet',
    numbersAssignDate: '2025-11-20T17:00:00',
    costType: 'PasswordOpen',
    costPerSquare: 10.0,
    rewardsType: 'CreditsRewards',
    gameRewardTypeID: 3,
    rewardType: mockRewardTypes[2],
    pool_status: 'open',
    closeDate: '2025-11-20T17:00:00',
    gridFeeType: 'Free',
    maxSquaresPerPlayer: 10,
    xAxisTeam: 'Kansas City Chiefs',
    yAxisTeam: 'Buffalo Bills',
    axisType: 'HomeAway',
    xAxisNumbers: null,
    yAxisNumbers: null,
    totalSquares: 100,
    selectedSquares: 0,
    totalPot: 1000.0,
    createdAt: '2025-11-15T10:00:00',
  },
  {
    id: 2,
    gridName: '49ers vs Cowboys Pool',
    poolNumber: 'SQ2025002',
    poolPassword: 'nfc2025',
    gameID: 2,
    game: mockGames[1],
    owner: 1,
    admin: 1,
    numbersType: 'Ascending',
    numbersAssignDate: null,
    costType: 'PasswordOpen',
    costPerSquare: 5.0,
    rewardsType: 'CreditsRewards',
    gameRewardTypeID: 2,
    rewardType: mockRewardTypes[1],
    pool_status: 'open',
    closeDate: '2025-11-21T15:00:00',
    gridFeeType: 'Free',
    maxSquaresPerPlayer: 20,
    xAxisTeam: 'San Francisco 49ers',
    yAxisTeam: 'Dallas Cowboys',
    axisType: 'HomeAway',
    xAxisNumbers: '0,1,2,3,4,5,6,7,8,9',
    yAxisNumbers: '0,1,2,3,4,5,6,7,8,9',
    totalSquares: 100,
    selectedSquares: 45,
    totalPot: 500.0,
    createdAt: '2025-11-14T08:00:00',
  },
];

// Local Storage Keys
const STORAGE_KEYS = {
  GRIDS: 'squares_grids',
  SQUARES: 'squares_selections',
  PLAYER_GRIDS: 'squares_player_grids',
  CURRENT_USER: 'squares_current_user',
};

// Mock Current User (this should come from AuthContext in production)
export const mockCurrentUser = {
  playerID: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  displayName: 'JohnD',
  isAdmin: true,
  credits: 500.0,
  balance: 1000.0,
};

/**
 * Mock API Service
 */
class SquaresMockService {
  constructor() {
    this.initializeStorage();
  }

  initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.GRIDS)) {
      localStorage.setItem(STORAGE_KEYS.GRIDS, JSON.stringify(mockGrids));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(mockCurrentUser));
    }
  }

  // Simulate API delay
  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all grids
  async getGrids(filters = {}) {
    await this.delay();
    let grids = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIDS) || '[]');

    // Apply filters
    if (filters.status) {
      grids = grids.filter(g => g.pool_status === filters.status);
    }
    if (filters.league) {
      grids = grids.filter(g => g.game.league === filters.league);
    }

    return { success: true, data: grids };
  }

  // Get single grid with squares
  async getGrid(gridID) {
    await this.delay();
    const grids = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIDS) || '[]');
    const grid = grids.find(g => g.id === parseInt(gridID));

    if (!grid) {
      return { success: false, error: 'Grid not found' };
    }

    // Get squares for this grid
    const allSquares = JSON.parse(localStorage.getItem(STORAGE_KEYS.SQUARES) || '{}');
    const gridSquares = allSquares[gridID] || generateEmptyGrid(gridID);

    return {
      success: true,
      data: {
        ...grid,
        squares: gridSquares,
      },
    };
  }

  // Create new grid
  async createGrid(gridData) {
    await this.delay();
    const grids = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIDS) || '[]');

    const newGrid = {
      id: grids.length + 1,
      poolNumber: `SQ2025${String(grids.length + 1).padStart(3, '0')}`,
      owner: mockCurrentUser.playerID,
      admin: mockCurrentUser.playerID,
      totalSquares: 100,
      selectedSquares: 0,
      pool_status: 'open',
      gridFeeType: grids.length < 10 ? 'Free' : grids.length < 60 ? 'Min1' : 'Standard',
      createdAt: new Date().toISOString(),
      ...gridData,
    };

    // Calculate total pot
    newGrid.totalPot = newGrid.totalSquares * (newGrid.costPerSquare || 0);

    // Find and attach game details
    const game = mockGames.find(g => g.gameID === gridData.gameID);
    if (game) {
      newGrid.game = game;
    }

    // Find and attach reward type details
    const rewardType = mockRewardTypes.find(r => r.id === gridData.gameRewardTypeID);
    if (rewardType) {
      newGrid.rewardType = rewardType;
    }

    // Auto-assign numbers if type is Ascending
    if (gridData.numbersType === 'Ascending') {
      newGrid.xAxisNumbers = '0,1,2,3,4,5,6,7,8,9';
      newGrid.yAxisNumbers = '0,1,2,3,4,5,6,7,8,9';
    }

    grids.push(newGrid);
    localStorage.setItem(STORAGE_KEYS.GRIDS, JSON.stringify(grids));

    // Initialize empty squares
    const allSquares = JSON.parse(localStorage.getItem(STORAGE_KEYS.SQUARES) || '{}');
    allSquares[newGrid.id] = generateEmptyGrid(newGrid.id);
    localStorage.setItem(STORAGE_KEYS.SQUARES, JSON.stringify(allSquares));

    return { success: true, data: newGrid };
  }

  // Join a grid
  async joinGrid(gridID, password) {
    await this.delay();
    const grids = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIDS) || '[]');
    const grid = grids.find(g => g.id === parseInt(gridID));

    if (!grid) {
      return { success: false, error: 'Grid not found' };
    }

    if (grid.costType === 'PasswordOpen' && grid.poolPassword !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    if (grid.pool_status !== 'open') {
      return { success: false, error: 'Grid is not open for selection' };
    }

    // Add to player grids
    const playerGrids = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYER_GRIDS) || '{}');
    if (!playerGrids[mockCurrentUser.playerID]) {
      playerGrids[mockCurrentUser.playerID] = [];
    }

    if (!playerGrids[mockCurrentUser.playerID].includes(gridID)) {
      playerGrids[mockCurrentUser.playerID].push(gridID);
      localStorage.setItem(STORAGE_KEYS.PLAYER_GRIDS, JSON.stringify(playerGrids));
    }

    return { success: true, data: { gridID, joined: true } };
  }

  // Select squares
  async selectSquares(gridID, coordinates) {
    await this.delay();
    const grids = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIDS) || '[]');
    const gridIndex = grids.findIndex(g => g.id === parseInt(gridID));

    if (gridIndex === -1) {
      return { success: false, error: 'Grid not found' };
    }

    const grid = grids[gridIndex];

    // Check if grid is open
    if (grid.pool_status !== 'open') {
      return { success: false, error: 'Grid is not open for selection' };
    }

    // Get current squares
    const allSquares = JSON.parse(localStorage.getItem(STORAGE_KEYS.SQUARES) || '{}');
    let gridSquares = allSquares[gridID] || generateEmptyGrid(gridID);

    // Count current player selections
    const currentSelections = gridSquares.filter(s => s.playerID === mockCurrentUser.playerID).length;

    // Check max squares limit
    if (grid.maxSquaresPerPlayer && (currentSelections + coordinates.length) > grid.maxSquaresPerPlayer) {
      return {
        success: false,
        error: `Maximum ${grid.maxSquaresPerPlayer} squares per player. You have ${currentSelections} selected.`,
      };
    }

    // Select the squares
    const selectedSquares = [];
    for (const coord of coordinates) {
      const squareIndex = gridSquares.findIndex(
        s => s.xCoordinate === coord.x && s.yCoordinate === coord.y
      );

      if (squareIndex !== -1 && !gridSquares[squareIndex].playerID) {
        gridSquares[squareIndex] = {
          ...gridSquares[squareIndex],
          playerID: mockCurrentUser.playerID,
          playerName: `${mockCurrentUser.firstName} ${mockCurrentUser.lastName}`,
          playerInitials: `${mockCurrentUser.firstName[0]}${mockCurrentUser.lastName[0]}`,
        };
        selectedSquares.push(gridSquares[squareIndex]);
      }
    }

    // Update storage
    allSquares[gridID] = gridSquares;
    localStorage.setItem(STORAGE_KEYS.SQUARES, JSON.stringify(allSquares));

    // Update grid selected count
    grids[gridIndex].selectedSquares = gridSquares.filter(s => s.playerID).length;
    localStorage.setItem(STORAGE_KEYS.GRIDS, JSON.stringify(grids));

    return { success: true, data: selectedSquares };
  }

  // Assign numbers to grid
  async assignNumbers(gridID, numbers = null) {
    await this.delay();
    const grids = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIDS) || '[]');
    const gridIndex = grids.findIndex(g => g.id === parseInt(gridID));

    if (gridIndex === -1) {
      return { success: false, error: 'Grid not found' };
    }

    let xNumbers, yNumbers;

    if (numbers && numbers.xNumbers && numbers.yNumbers) {
      xNumbers = numbers.xNumbers;
      yNumbers = numbers.yNumbers;
    } else {
      // Generate random numbers
      xNumbers = generateRandomNumbers();
      yNumbers = generateRandomNumbers();
    }

    grids[gridIndex].xAxisNumbers = xNumbers.join(',');
    grids[gridIndex].yAxisNumbers = yNumbers.join(',');
    localStorage.setItem(STORAGE_KEYS.GRIDS, JSON.stringify(grids));

    // Update squares with numbers
    const allSquares = JSON.parse(localStorage.getItem(STORAGE_KEYS.SQUARES) || '{}');
    let gridSquares = allSquares[gridID] || [];

    gridSquares = gridSquares.map(square => ({
      ...square,
      xNumber: xNumbers[square.xCoordinate],
      yNumber: yNumbers[square.yCoordinate],
    }));

    allSquares[gridID] = gridSquares;
    localStorage.setItem(STORAGE_KEYS.SQUARES, JSON.stringify(allSquares));

    return {
      success: true,
      data: {
        xAxisNumbers: xNumbers,
        yAxisNumbers: yNumbers,
      },
    };
  }

  // Get player's grids
  async getPlayerGrids(playerID) {
    await this.delay();
    const playerGrids = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYER_GRIDS) || '{}');
    const gridIDs = playerGrids[playerID] || [];
    const allGrids = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIDS) || '[]');

    const grids = allGrids.filter(g => gridIDs.includes(g.id));

    return { success: true, data: grids };
  }

  // Get games
  async getGames(filters = {}) {
    await this.delay();
    let games = [...mockGames];

    if (filters.league) {
      games = games.filter(g => g.league === filters.league);
    }
    if (filters.status) {
      games = games.filter(g => g.gameStatus === filters.status);
    }

    return { success: true, data: games };
  }

  // Reset all data (for testing)
  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.GRIDS);
    localStorage.removeItem(STORAGE_KEYS.SQUARES);
    localStorage.removeItem(STORAGE_KEYS.PLAYER_GRIDS);
    this.initializeStorage();
  }
}

export const squaresMockService = new SquaresMockService();
export default squaresMockService;

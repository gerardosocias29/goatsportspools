# Squares Pool - Database Schema & API Contract

## Database Tables

All tables must include these audit fields:
- `CreateUserID` (INT)
- `CreateDate` (DATE)
- `ModifyUserID` (INT)
- `ModifyDate` (DATE)
- `CreateDateTime` (DATETIME)
- `ModifyDateTime` (DATETIME)

### 1. Grids Table
Primary table for managing squares pools/grids.

```sql
CREATE TABLE Grids (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Owner INT NOT NULL,
    Proprietor INT,
    Admin INT NOT NULL,
    Manager INT,
    GridName VARCHAR(255) NOT NULL,
    GridDescription TEXT,
    PoolNumber VARCHAR(50) UNIQUE NOT NULL,
    PoolPassword VARCHAR(255),
    GameID INT NOT NULL,

    -- Number Assignment
    NumbersType ENUM('Ascending', 'TimeSet', 'AdminTrigger') DEFAULT 'Ascending',
    NumbersAssignDate DATETIME NULL,

    -- Cost & Access
    CostType ENUM('Free', 'LinkOpen', 'PasswordOpen', 'CreditsRequired') DEFAULT 'PasswordOpen',
    CostPerSquare DECIMAL(10, 2) DEFAULT 0.00,

    -- Rewards
    RewardsType ENUM('ComputeOnly', 'CreditsRewards') DEFAULT 'CreditsRewards',
    GameRewardTypeID INT DEFAULT 1,

    -- Grid Status
    GridStatus ENUM('Closed', 'SelectOpen', 'DisplayOpen', 'SelectClosed', 'GameStarted', 'GameCompleted') DEFAULT 'SelectOpen',
    CloseDate DATETIME NULL,

    -- Fee Structure
    GridFeeType ENUM('Free', 'Min1', 'Min2', 'Standard') DEFAULT 'Free',

    -- Player Limits
    MaxSquaresPerPlayer INT DEFAULT NULL,

    -- Team Configuration
    XAxisTeam VARCHAR(100),
    YAxisTeam VARCHAR(100),
    AxisType ENUM('HomeAway', 'WinnerLoser') DEFAULT 'HomeAway',

    -- Assigned Numbers (JSON or separate table)
    XAxisNumbers VARCHAR(100), -- Comma separated: "3,7,0,2,1,4,9,6,5,8"
    YAxisNumbers VARCHAR(100), -- Comma separated: "1,5,9,3,7,2,8,0,4,6"

    CreateUserID INT NOT NULL,
    CreateDate DATE NOT NULL,
    ModifyUserID INT,
    ModifyDate DATE,
    CreateDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ModifyDateTime DATETIME ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (GameID) REFERENCES Games(GameID),
    FOREIGN KEY (Admin) REFERENCES Players(PlayerID),
    FOREIGN KEY (GameRewardTypeID) REFERENCES GameRewardTypes(GRTypeID),
    INDEX idx_pool_number (PoolNumber),
    INDEX idx_game (GameID),
    INDEX idx_status (GridStatus)
);
```

### 2. GridJoin Table
Tracks which players have joined which grids.

```sql
CREATE TABLE GridJoin (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    PlayerID INT NOT NULL,
    GridID INT NOT NULL,
    JoinStatus ENUM('Pending', 'Approved', 'Denied') DEFAULT 'Approved',
    Status ENUM('Active', 'Inactive') DEFAULT 'Active',
    AssignedCredits DECIMAL(10, 2) DEFAULT 0.00,
    JoinDate DATETIME DEFAULT CURRENT_TIMESTAMP,

    CreateUserID INT NOT NULL,
    CreateDate DATE NOT NULL,
    ModifyUserID INT,
    ModifyDate DATE,
    CreateDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ModifyDateTime DATETIME ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (PlayerID) REFERENCES Players(PlayerID),
    FOREIGN KEY (GridID) REFERENCES Grids(ID),
    UNIQUE KEY unique_player_grid (PlayerID, GridID),
    INDEX idx_grid (GridID),
    INDEX idx_player (PlayerID)
);
```

### 3. Squares Table
Individual square selections on the grid.

```sql
CREATE TABLE Squares (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    GridID INT NOT NULL,
    XCoordinate INT NOT NULL CHECK (XCoordinate BETWEEN 0 AND 9),
    YCoordinate INT NOT NULL CHECK (YCoordinate BETWEEN 0 AND 9),
    PlayerID INT NULL,

    -- The actual numbers for this square (populated when numbers are assigned)
    XNumber INT NULL CHECK (XNumber BETWEEN 0 AND 9),
    YNumber INT NULL CHECK (YNumber BETWEEN 0 AND 9),

    -- Codes for visual representation
    XCode VARCHAR(10),
    YCode VARCHAR(10),

    SelectionDate DATETIME NULL,

    CreateUserID INT NOT NULL,
    CreateDate DATE NOT NULL,
    ModifyUserID INT,
    ModifyDate DATE,
    CreateDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ModifyDateTime DATETIME ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (GridID) REFERENCES Grids(ID) ON DELETE CASCADE,
    FOREIGN KEY (PlayerID) REFERENCES Players(PlayerID),
    UNIQUE KEY unique_grid_coordinates (GridID, XCoordinate, YCoordinate),
    INDEX idx_grid (GridID),
    INDEX idx_player (PlayerID)
);
```

### 4. Games Table
Sporting events for pools.

```sql
CREATE TABLE Games (
    GameID INT PRIMARY KEY AUTO_INCREMENT,
    League ENUM('NFL', 'NBA', 'NCAAF', 'NCAAB', 'PBA', 'UAAP') NOT NULL,
    HomeTeam VARCHAR(100) NOT NULL,
    VisitorTeam VARCHAR(100) NOT NULL,
    GameTime DATETIME NOT NULL,
    GameStatus ENUM('NotStarted', 'Started', 'Final') DEFAULT 'NotStarted',

    -- Scores
    HomeFinalScore INT NULL,
    HomeHalfTimeScore INT NULL,
    HomeFirstQuarterScore INT NULL,
    HomeThirdQuarterScore INT NULL,

    VisitorFinalScore INT NULL,
    VisitorHalfTimeScore INT NULL,
    VisitorFirstQuarterScore INT NULL,
    VisitorThirdQuarterScore INT NULL,

    -- Game Details
    GameDescription TEXT,
    GameNickname VARCHAR(255),
    GameDateDescription VARCHAR(255),

    -- External IDs
    ExternalGameID VARCHAR(100),

    -- Legacy fields
    PoolID INT NULL,
    GroupID INT NULL,

    CreateUserID INT NOT NULL,
    CreateDate DATE NOT NULL,
    ModifyUserID INT,
    ModifyDate DATE,
    CreateDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ModifyDateTime DATETIME ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_league (League),
    INDEX idx_game_time (GameTime),
    INDEX idx_status (GameStatus),
    UNIQUE KEY unique_external_game (League, ExternalGameID)
);
```

### 5. GameResults Table
Configuration for how game results are calculated.

```sql
CREATE TABLE GameResults (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    GameID INT NOT NULL,
    ResultType ENUM('FinalOnly', 'FinalAndHalf', 'AllQuarters') DEFAULT 'FinalOnly',

    CreateUserID INT NOT NULL,
    CreateDate DATE NOT NULL,
    ModifyUserID INT,
    ModifyDate DATE,
    CreateDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ModifyDateTime DATETIME ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (GameID) REFERENCES Games(GameID),
    UNIQUE KEY unique_game (GameID)
);
```

### 6. GameRewardTypes Table (Reference)
Predefined reward distribution templates.

```sql
CREATE TABLE GameRewardTypes (
    GRTypeID INT PRIMARY KEY AUTO_INCREMENT,
    GRewardTypeName VARCHAR(100) NOT NULL,
    GameRewardTypeDescription TEXT,

    Reward1Percent DECIMAL(5, 4) DEFAULT 0,
    Reward2Percent DECIMAL(5, 4) DEFAULT 0,
    Reward3Percent DECIMAL(5, 4) DEFAULT 0,
    Reward4Percent DECIMAL(5, 4) DEFAULT 0,
    Reward5Percent DECIMAL(5, 4) DEFAULT 0,
    Reward6Percent DECIMAL(5, 4) DEFAULT 0,
    Reward7Percent DECIMAL(5, 4) DEFAULT 0,
    Reward8Percent DECIMAL(5, 4) DEFAULT 0,
    Reward9Percent DECIMAL(5, 4) DEFAULT 0,
    RewardOtherPercent DECIMAL(5, 4) DEFAULT 0,
    RewardMiscPercent DECIMAL(5, 4) DEFAULT 0,

    CreateUserID INT NOT NULL,
    CreateDate DATE NOT NULL,
    ModifyUserID INT,
    ModifyDate DATE,
    CreateDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ModifyDateTime DATETIME ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO GameRewardTypes (GRTypeID, GRewardTypeName, GameRewardTypeDescription, Reward1Percent, CreateUserID, CreateDate)
VALUES
    (1, 'Default, One Winner', 'Single winner takes all', 1.0000, 1, CURDATE()),
    (2, 'Half and Final, 50-50', 'Half time and final score split evenly', 0.5000, 0.5000, 1, CURDATE()),
    (3, 'All Quarters Equal', 'Each quarter gets 25%', 0.2500, 0.2500, 0.2500, 0.2500, 1, CURDATE());
```

### 7. PlayerResults Table
Tracks individual player winnings.

```sql
CREATE TABLE PlayerResults (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    PlayerID INT NOT NULL,
    GridID INT NOT NULL,
    SquareID INT NOT NULL,
    Quarter ENUM('Q1', 'Q2', 'Q3', 'Q4', 'Final', 'Half') NOT NULL,
    WinAmount DECIMAL(10, 2) NOT NULL,
    IsPaid BOOLEAN DEFAULT FALSE,
    PaidDate DATETIME NULL,

    CreateUserID INT NOT NULL,
    CreateDate DATE NOT NULL,
    ModifyUserID INT,
    ModifyDate DATE,
    CreateDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ModifyDateTime DATETIME ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (PlayerID) REFERENCES Players(PlayerID),
    FOREIGN KEY (GridID) REFERENCES Grids(ID),
    FOREIGN KEY (SquareID) REFERENCES Squares(ID),
    INDEX idx_player (PlayerID),
    INDEX idx_grid (GridID)
);
```

### 8. SquaresAdmins Table
Extended admin information for squares administrators.

```sql
CREATE TABLE SquaresAdmins (
    AdminID INT PRIMARY KEY AUTO_INCREMENT,
    PlayerID INT NOT NULL,
    AdminCredits DECIMAL(10, 2) DEFAULT 0.00,
    AdminBalance DECIMAL(10, 2) DEFAULT 0.00,
    GridsCreated INT DEFAULT 0,
    GridsFreeRemaining INT DEFAULT 10,

    -- Legacy
    PoolID INT NULL,
    GroupID INT NULL,

    CreateUserID INT NOT NULL,
    CreateDate DATE NOT NULL,
    ModifyUserID INT,
    ModifyDate DATE,
    CreateDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ModifyDateTime DATETIME ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (PlayerID) REFERENCES Players(PlayerID),
    UNIQUE KEY unique_player (PlayerID)
);
```

### 9. PlayersAccount Table
Player credits and balance management.

```sql
CREATE TABLE PlayersAccount (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    PlayerID INT NOT NULL,
    AdminID INT NULL,
    Credits DECIMAL(10, 2) DEFAULT 0.00,
    Balance DECIMAL(10, 2) DEFAULT 0.00,
    LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CreateUserID INT NOT NULL,
    CreateDate DATE NOT NULL,
    ModifyUserID INT,
    ModifyDate DATE,
    CreateDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ModifyDateTime DATETIME ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (PlayerID) REFERENCES Players(PlayerID),
    FOREIGN KEY (AdminID) REFERENCES SquaresAdmins(AdminID),
    UNIQUE KEY unique_player_admin (PlayerID, AdminID)
);
```

### 10. Deposits Table
Track player deposits for credits.

```sql
CREATE TABLE Deposits (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    PlayerID INT NOT NULL,
    DepositDate DATETIME NOT NULL,
    DepositAmount DECIMAL(10, 2) NOT NULL,
    DepositBy VARCHAR(100),
    DepositMethod ENUM('Cash', 'Card', 'Transfer', 'Check', 'Other') DEFAULT 'Other',
    DepositChannel VARCHAR(100),
    Status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',

    CreateUserID INT NOT NULL,
    CreateDate DATE NOT NULL,
    ModifyUserID INT,
    ModifyDate DATE,
    CreateDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ModifyDateTime DATETIME ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (PlayerID) REFERENCES Players(PlayerID),
    INDEX idx_player (PlayerID),
    INDEX idx_date (DepositDate)
);
```

## API Endpoints Required

### Grid Management

#### Create Grid
```
POST /api/squares/grids
Body: {
    gridName, gameID, numbersType, costType, costPerSquare,
    rewardsType, gameRewardTypeID, poolPassword, maxSquaresPerPlayer,
    xAxisTeam, yAxisTeam, axisType, numbersAssignDate, closeDate
}
Response: { gridID, poolNumber, ... }
```

#### Get Grid Details
```
GET /api/squares/grids/:gridID
Response: { grid, game, squares[], joinedPlayers[], numbers }
```

#### List Grids
```
GET /api/squares/grids
Query: ?status=SelectOpen&league=NFL&page=1
Response: { grids[], pagination }
```

#### Update Grid
```
PUT /api/squares/grids/:gridID
Body: { gridStatus, numbersAssignDate, ... }
```

#### Assign Numbers
```
POST /api/squares/grids/:gridID/assign-numbers
Body: { xNumbers[], yNumbers[] } or { autoGenerate: true }
Response: { xAxisNumbers, yAxisNumbers }
```

### Player Actions

#### Join Grid
```
POST /api/squares/grids/:gridID/join
Body: { poolNumber, poolPassword }
Response: { success, gridJoinID }
```

#### Select Squares
```
POST /api/squares/grids/:gridID/select-squares
Body: { coordinates: [{x, y}, {x, y}] }
Response: { selectedSquares[], remainingSquares }
```

#### Get Player Grids
```
GET /api/squares/players/:playerID/grids
Response: { grids[], stats }
```

### Games

#### List Games
```
GET /api/squares/games
Query: ?league=NFL&status=NotStarted&date=2025-11-15
Response: { games[] }
```

#### Get Game Details
```
GET /api/squares/games/:gameID
Response: { game, scores, grids[] }
```

#### Import Games (Admin)
```
POST /api/squares/games/import
Body: { league, startDate, endDate }
Response: { imported: 10, duplicates: 2 }
```

#### Update Game Scores (Admin)
```
PUT /api/squares/games/:gameID/scores
Body: { homeScore, visitorScore, quarter, status }
Response: { game, winners[] }
```

### Admin Functions

#### Get Admin Dashboard
```
GET /api/squares/admin/dashboard
Response: { grids[], stats, freeGridsRemaining }
```

#### Calculate Winners
```
POST /api/squares/grids/:gridID/calculate-winners
Body: { quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Final' }
Response: { winners[], amounts[] }
```

#### Get Grid Report
```
GET /api/squares/grids/:gridID/report
Response: { squares[], players[], financials, winners[] }
```

## Business Logic

### Number Assignment
1. **Type 1 (Ascending)**: Numbers 0-9 assigned in order immediately
2. **Type 2 (TimeSet)**: Numbers randomly assigned at specified datetime
3. **Type 3 (AdminTrigger)**: Admin manually triggers random assignment

### Square Selection Rules
1. Check if grid is open for selection (GridStatus = 'SelectOpen')
2. Check if player has joined the grid
3. Check if square is available (PlayerID IS NULL)
4. Check max squares limit per player
5. For credit-based pools, verify player has sufficient credits

### Winner Calculation
1. Get final score for the quarter/period
2. Extract last digit of each team's score
3. Find square matching those numbers
4. Calculate payout based on GameRewardType percentages
5. Create PlayerResults record

### Fee Structure
- First 10 grids: Free
- Next 50 grids: Min1 (minimal fee)
- After 60 grids: Standard fee

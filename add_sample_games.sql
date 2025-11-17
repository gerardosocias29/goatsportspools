-- Sample Games for Squares Pool Testing
-- Run this SQL in your MySQL/MariaDB database (likely named 'goatsportspools' or similar)

-- Insert NFL Games for testing Squares Pools
INSERT INTO games (
    league,
    home_team,
    visitor_team,
    game_time,
    game_status,
    game_description,
    game_nickname,
    game_date_description,
    q1_home, q1_visitor,
    q2_home, q2_visitor,
    q3_home, q3_visitor,
    q4_home, q4_visitor,
    half_home, half_visitor,
    final_home, final_visitor,
    created_at,
    updated_at
) VALUES
-- Upcoming NFL Games
(
    'NFL',
    'Kansas City Chiefs',
    'Buffalo Bills',
    '2025-11-24 20:00:00',
    'Scheduled',
    'Week 12',
    'Chiefs vs Bills',
    'Sunday, Nov 24, 2025',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NOW(),
    NOW()
),
(
    'NFL',
    'Dallas Cowboys',
    'Philadelphia Eagles',
    '2025-11-24 16:00:00',
    'Scheduled',
    'Week 12',
    'Cowboys vs Eagles',
    'Sunday, Nov 24, 2025',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NOW(),
    NOW()
),
(
    'NFL',
    'San Francisco 49ers',
    'Seattle Seahawks',
    '2025-11-24 17:00:00',
    'Scheduled',
    'Week 12',
    '49ers vs Seahawks',
    'Sunday, Nov 24, 2025',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NOW(),
    NOW()
),
(
    'NFL',
    'Green Bay Packers',
    'Detroit Lions',
    '2025-11-28 12:30:00',
    'Scheduled',
    'Thanksgiving Day',
    'Packers vs Lions - Thanksgiving',
    'Thursday, Nov 28, 2025',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NOW(),
    NOW()
),
(
    'NFL',
    'Las Vegas Raiders',
    'Los Angeles Chargers',
    '2025-11-24 13:00:00',
    'Scheduled',
    'Week 12',
    'Raiders vs Chargers',
    'Sunday, Nov 24, 2025',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NOW(),
    NOW()
),
-- Completed NFL Game (for testing winner calculation)
(
    'NFL',
    'New England Patriots',
    'Miami Dolphins',
    '2025-11-17 13:00:00',
    'Final',
    'Week 11',
    'Patriots vs Dolphins',
    'Sunday, Nov 17, 2025',
    7, 3,   -- Q1: Patriots 7, Dolphins 3
    14, 10, -- Q2: Patriots 14, Dolphins 10
    21, 17, -- Q3: Patriots 21, Dolphins 17
    27, 20, -- Q4: Patriots 27, Dolphins 20
    14, 10, -- Half: Patriots 14, Dolphins 10
    27, 20, -- Final: Patriots 27, Dolphins 20
    NOW(),
    NOW()
);

-- Verify the inserts
SELECT
    id as game_id,
    league,
    CONCAT(home_team, ' vs ', visitor_team) as matchup,
    game_nickname,
    game_time,
    game_status
FROM games
ORDER BY game_time DESC;

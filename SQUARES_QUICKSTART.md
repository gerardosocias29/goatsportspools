# Squares Pool - Quick Start Guide

## Getting Started

### 1. Start the Application
```bash
npm start
```
The app will open at http://localhost:3000

### 2. Navigate to Squares
Visit: http://localhost:3000/v2/squares

## User Journeys

### As a Player - Join and Select Squares

1. **Browse Pools**
   - Go to `/v2/squares`
   - You'll see 2 pre-loaded sample pools
   - Filter by status or league if needed

2. **View Pool Details**
   - Click on any pool card
   - You'll see the 10x10 grid and pool information

3. **Join a Pool**
   - Click "Join Pool" button
   - For password-protected pools, enter the password
   - Sample passwords:
     - Pool "Super Bowl LVIX Squares": `chiefs2025`
     - Pool "49ers vs Cowboys Pool": `nfc2025`
   - Click "Join"

4. **Select Your Squares**
   - After joining, click "Select Squares"
   - Click on empty squares to select them
   - Selected squares turn yellow
   - Multiple squares can be selected
   - See cost update in real-time
   - Click "Confirm" when ready

5. **View Your Selections**
   - Your squares turn green
   - Other players' squares are blue
   - Available squares are white

### As an Admin - Create a Pool

1. **Access Admin Dashboard**
   - Go to `/v2/squares/admin`
   - View your pools and stats
   - See free grids remaining (starts at 10)

2. **Create New Pool**
   - Click "Create New Pool"
   - Or go directly to `/v2/squares/create`

3. **Step 1: Select Game**
   - Enter pool name
   - Choose from available games (3 pre-loaded)
   - Click "Next"

4. **Step 2: Configure Settings**
   - **Number Assignment:**
     - Ascending: 0-9 in order (instant)
     - TimeSet: Random at specific time
     - AdminTrigger: Manual trigger
   - **Access Type:**
     - Free: No cost
     - LinkOpen: Anyone with link
     - PasswordOpen: Requires password (enter password)
     - CreditsRequired: Needs credits
   - **Cost per Square:** Set amount (e.g., $10)
   - **Reward Distribution:** Choose payout structure
   - **Close Date:** Optional deadline
   - Click "Next"

5. **Step 3: Teams & Rules**
   - X-Axis Team (auto-filled from game)
   - Y-Axis Team (auto-filled from game)
   - Max squares per player (optional limit)
   - Click "Next"

6. **Step 4: Review & Create**
   - Review all settings
   - Click "Create Pool"
   - Redirected to pool detail page

7. **Manage Your Pool**
   - View from admin dashboard
   - Monitor selections in real-time
   - See revenue and progress

## Sample Data

### Pre-loaded Games:
1. Kansas City Chiefs vs Buffalo Bills (NFL)
2. San Francisco 49ers vs Dallas Cowboys (NFL)
3. Los Angeles Lakers vs Boston Celtics (NBA)

### Pre-loaded Pools:
1. **Super Bowl LVIX Squares**
   - Pool #: SQ2025001
   - Password: chiefs2025
   - Cost: $10/square
   - Reward: All Quarters Equal

2. **49ers vs Cowboys Pool**
   - Pool #: SQ2025002
   - Password: nfc2025
   - Cost: $5/square
   - Reward: Half and Final 50-50
   - 45% filled

## Key Features to Test

### Grid Display
- ✅ 10x10 grid with gaps
- ✅ Rounded corners on cells
- ✅ Team names on axes
- ✅ Numbers 0-9 displayed (when assigned)
- ✅ Responsive on mobile/tablet/desktop

### Square Selection
- ✅ Click to select multiple squares
- ✅ Hover effects
- ✅ Color coding (white/yellow/green/blue)
- ✅ Real-time cost calculation
- ✅ Max squares validation

### Pool Management
- ✅ Filter by status/league
- ✅ Progress bars
- ✅ Status badges
- ✅ Join with password
- ✅ Admin dashboard stats

## Testing Scenarios

### Test 1: Join and Select
```
1. Go to /v2/squares
2. Click first pool
3. Click "Join Pool"
4. Enter password: chiefs2025
5. Click "Select Squares"
6. Click 3-5 different squares
7. Verify they turn yellow
8. Click "Confirm"
9. Verify they turn green
10. Refresh page - selections persist
```

### Test 2: Create Pool
```
1. Go to /v2/squares/create
2. Name: "Test Pool"
3. Select first game
4. Click Next
5. Choose "Ascending" numbers
6. Choose "PasswordOpen" access
7. Enter password: test123
8. Cost: $5
9. Click Next
10. Verify teams auto-filled
11. Max squares: 10
12. Click Next
13. Review all settings
14. Click "Create Pool"
15. Verify redirect to pool page
16. Check pool appears in list
```

### Test 3: Admin Dashboard
```
1. Go to /v2/squares/admin
2. Verify stats cards show correct data
3. Verify free grids counter
4. Verify pools table populated
5. Click "View" on a pool
6. Verify navigation to pool detail
```

### Test 4: Max Squares Limit
```
1. Create pool with max 3 squares
2. Join the pool
3. Try to select 4 squares
4. Verify error message shows
5. Deselect one square
6. Verify can confirm with 3
```

### Test 5: Mobile Responsiveness
```
1. Open Chrome DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone or Android device
4. Navigate through:
   - Pool list (should be 1 column)
   - Pool detail (grid should scale)
   - Create pool (wizard should stack)
5. Test touch interactions
```

## Mock Data Management

### View Data
All data is stored in browser's LocalStorage:
- `squares_grids` - All pools
- `squares_selections` - Square selections
- `squares_player_grids` - Player-pool joins

### Reset Data
Open browser console and run:
```javascript
squaresMockService.resetAllData()
```
This resets to initial sample data.

### Check Current User
```javascript
console.log(JSON.parse(localStorage.getItem('squares_current_user')))
```

### Manual Data Inspection
```javascript
// View all grids
console.log(JSON.parse(localStorage.getItem('squares_grids')))

// View all selections
console.log(JSON.parse(localStorage.getItem('squares_selections')))

// View player joins
console.log(JSON.parse(localStorage.getItem('squares_player_grids')))
```

## Troubleshooting

### Issue: Can't join pool
**Solution:** Check password (case-sensitive)
- Pool 1: `chiefs2025`
- Pool 2: `nfc2025`

### Issue: Can't select squares
**Possible causes:**
1. Haven't joined pool yet - Click "Join Pool" first
2. Not in selection mode - Click "Select Squares"
3. Square already taken - Choose different square
4. Reached max limit - Check max squares setting

### Issue: Grid not displaying
**Solution:** Check browser console for errors. Verify:
- React app is running
- No import errors
- Browser supports ES6

### Issue: Changes not persisting
**Solution:**
- Check browser allows LocalStorage
- Try incognito mode
- Clear cache and reload

### Issue: Routing not working
**Solution:**
- Verify URL includes `/v2/` prefix
- Check React Router is installed
- Restart dev server

## Next Steps

### When Backend is Ready:
1. Replace mock service imports
2. Update API endpoint URLs
3. Add real authentication
4. Test with real database

### Production Deployment:
1. Build optimized bundle: `npm run build`
2. Deploy to hosting
3. Configure environment variables
4. Set up backend API
5. Run database migrations

## Support

For issues or questions:
- Check `SQUARES_IMPLEMENTATION_SUMMARY.md` for detailed docs
- Check `SQUARES_DATABASE_SCHEMA.md` for backend reference
- Review component files for inline documentation

## Demo Credentials

Mock Current User:
- ID: 1
- Name: John Doe
- Email: john.doe@example.com
- Role: Admin
- Credits: $500
- Balance: $1000

## Feature Checklist

### ✅ Implemented:
- [x] 10x10 grid display with styling
- [x] Multiple square selection
- [x] Pool list with filtering
- [x] Pool detail view
- [x] Join pool with password
- [x] Admin pool creation (4-step wizard)
- [x] Admin dashboard
- [x] Mock data service
- [x] Responsive design
- [x] Number assignment methods
- [x] Access type configurations
- [x] Reward distribution types
- [x] Progress tracking
- [x] Fee structure (free/min1)
- [x] Social media footer
- [x] Complete routing

### ⏳ To Be Implemented (Backend):
- [ ] Real authentication
- [ ] Database integration
- [ ] Payment processing
- [ ] Email notifications
- [ ] Real-time score updates
- [ ] Python import scripts
- [ ] Winner calculation automation
- [ ] QR code generation
- [ ] Admin approval workflows

Happy Testing! 🎉

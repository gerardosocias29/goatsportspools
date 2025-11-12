# V2 Pools Implementation

## Created Files

### 1. **Pools Landing Page** (`src/v2/pages/Pools.js`)
- Grid layout showing all available pool types
- NCAA Basketball Auction marked as "LIVE"
- Other pools marked as "Coming Soon"
- Click-through to individual pool pages
- Modern card-based design with hover effects

### 2. **NCAA Basketball Auction Page** (`src/v2/pages/NCAABasketballAuction.js`)
- Reuses existing V1 APIs
- Shows live auction with real-time status
- Displays upcoming auctions
- Shows user's won items
- Join auction functionality
- Modern V2 styling

---

## Routes Added

### In `src/v2/V2App.js`:
```jsx
<Route path="/pools" element={<Pools />} />
<Route path="/pools/ncaa-basketball-auction" element={<NCAABasketballAuction />} />
```

### Navigation Structure:
```
/v2/pools                              → Pools landing page
/v2/pools/ncaa-basketball-auction      → NCAA Basketball Auction listing
/v2/pools/ncaa-basketball-auction?auction_id=123  → Individual auction (future)
```

---

## API Endpoints Used

### NCAA Basketball Auction APIs (from V1):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auctions/live` | GET | Get currently live auction |
| `/api/auctions/upcoming` | GET | Get upcoming auctions |
| `/api/auctions/my-items` | GET | Get user's won items |
| `/api/auctions/{id}/join` | GET | Join an auction |
| `/api/auctions/{id}/get-by-id` | GET | Get auction details |

---

## Features Implemented

### Pools Landing Page:
✅ Grid layout with all pool types
✅ Live badge for active pools
✅ Coming soon badges for future pools
✅ Responsive card design
✅ Hover effects and animations
✅ Click-through navigation

### NCAA Basketball Auction Page:
✅ Live auction section with status badge
✅ Upcoming auctions grid
✅ My auctioned items section
✅ Join auction functionality
✅ Real-time participant count
✅ Item count display
✅ Event date formatting
✅ Empty states for no data
✅ Loading states

---

## Pool Types in Landing Page

1. **NCAA Basketball Auction** ✅ LIVE
   - Live bidding on NCAA teams
   - Livestream integration
   - Real-time bidding

2. **Football Squares** 🔜 Coming Soon
   - Super Bowl squares
   - Quarterly payouts

3. **Survivor Pool** 🔜 Coming Soon
   - Weekly team picks
   - Elimination format

4. **Pick'em Pool** 🔜 Coming Soon
   - Against the spread picks
   - Weekly scoring

5. **March Madness Brackets** 🔜 Coming Soon
   - NCAA tournament brackets
   - Bracket scoring

6. **Golf Majors Pool** 🔜 Coming Soon
   - Golf draft format
   - Major tournaments

---

## Design Features

### V2 Design Standards:
- Rounded corners (1rem border radius)
- Brand colors (Burnt Orange #D47A3E)
- Hubot Sans font for headings
- Inter font for body text
- Card-based layout
- Smooth transitions
- Fade-in animations
- Responsive grid system

### Components Used:
- `Card` - Container for auction/pool cards
- `Button` - Primary and outline variants
- `Badge` - Status indicators (LIVE, Coming Soon, Won)

---

## Data Flow

### Pools Page:
```
User clicks "Pools" nav
  → Pools landing page loads
  → Shows grid of all pool types
  → User clicks "NCAA Basketball Auction"
  → Navigates to /v2/pools/ncaa-basketball-auction
```

### NCAA Basketball Auction Page:
```
Page loads
  → Fetch live auction (GET /api/auctions/live)
  → Fetch upcoming auctions (GET /api/auctions/upcoming)
  → Fetch user's items (GET /api/auctions/my-items)
  → Display in 3 sections

User clicks "Join Live Auction"
  → Call /api/auctions/{id}/join
  → Navigate to auction page with auction_id param
```

---

## Future Enhancements

### Phase 2 - Live Bidding Interface:
1. Create UserAuction V2 component
2. Add livestream embed (YouTube/Twitch)
3. Real-time bidding with Pusher
4. Bid history display
5. Active item display
6. Countdown timers

### Phase 3 - Admin Interface:
1. Create AdminBidding V2 component
2. Manage auction controls
3. Set active items
4. Override bids
5. Finalize brackets

### Phase 4 - Tournament Brackets:
1. Create TournamentBracket V2 component
2. NCAA team selection
3. Regional seeding
4. Bracket visualization

### Phase 5 - Other Pool Types:
1. Football Squares implementation
2. Survivor Pool implementation
3. Pick'em Pool implementation
4. March Madness Brackets
5. Golf Majors Pool

---

## Testing Checklist

- [ ] Pools landing page loads
- [ ] All pool cards display correctly
- [ ] LIVE badge shows on NCAA Basketball Auction
- [ ] Click navigation to NCAA Basketball Auction works
- [ ] Live auction displays when available
- [ ] Upcoming auctions load and display
- [ ] My items section shows won items
- [ ] Join auction button works
- [ ] Empty states display when no data
- [ ] Loading states display correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] API errors handled gracefully

---

## Files Modified

1. **NEW**: `src/v2/pages/Pools.js` - Pools landing page
2. **NEW**: `src/v2/pages/NCAABasketballAuction.js` - NCAA auction listing
3. **MODIFIED**: `src/v2/V2App.js` - Added routes

---

## Next Steps

1. ✅ Create Pools landing page structure
2. ✅ Implement NCAA Basketball Auction listing page
3. ✅ Add routes to V2App
4. 🔜 Create live bidding interface (UserAuction V2)
5. 🔜 Add real-time Pusher integration
6. 🔜 Create admin auction management (AdminBidding V2)
7. 🔜 Implement other pool types

---

**Status**: ✅ Phase 1 Complete (Pools Structure + NCAA Auction Listing)
**Date**: November 2025
**Version**: V2 Pools v1.0

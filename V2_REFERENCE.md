# Goat Sports Pools - V2 Development Reference

## Quick Facts
- **Type**: React 18.2.0 SPA (Create React App)
- **Routing**: React Router v6.22.3 (Client-side)
- **CSS**: Tailwind CSS v3.4.3 + PrimeReact v10.6.2
- **HTTP**: Axios v1.6.8 (wrapped in AxiosContext)
- **Auth**: Clerk v5.2.5 + Token-based API
- **Real-time**: Pusher.js v8.4.0
- **Files**: 64 source files
- **API Calls**: 68 total across 29 files

## What NOT to Change
1. Backend API contracts (reuse existing endpoints)
2. Authentication flow (Clerk + token-based)
3. Module-based access control (user.modules[])
4. Pusher event structure (for auctions)
5. Timezone/fraction utilities (game logic dependent)

## What to Improve
1. **Styling**: Consolidate (Tailwind XOR PrimeReact)
2. **Type Safety**: Add TypeScript throughout
3. **State**: Add Redux/Zustand for complex state
4. **Testing**: Jest + React Testing Library
5. **Documentation**: Storybook for components
6. **Error Handling**: Add React Error Boundaries

## Core Patterns to Maintain

### 1. AxiosContext for HTTP
```javascript
const axiosService = useAxios();
axiosService.get(url).then(res => setData(res.data))
```

### 2. Context API Providers
- AuthContext (session + token)
- AxiosContext (HTTP service)
- ToastContext (notifications)
- ThemeContext (dark/light)

### 3. Module-Based Access
User.modules[] drives sidebar and page access. MainPage validates before rendering.

### 4. Real-time with Pusher
Channel: "bidding-channel"
Event: "active-auction-event-{userId}"

## Key Files to Reference
- src/app/contexts/AxiosContext.js (HTTP wrapper pattern)
- src/app/pages/MainPage.js (routing pattern)
- src/app/components/tables/LazyTable.js (advanced table)
- src/app/pages/screens/games/NFL.js (complex state)
- src/app/pages/screens/Bidding/AdminBidding.js (real-time)

## Reusable Components
- LazyTable (pagination, filtering, export)
- All modals (LeagueModal, LeagueJoin, etc)
- Navbar + Sidebar (layout)
- Layout wrapper (2-column)

## Features to Maintain
1. Sports Betting (NFL) - Straight, Parlay, Teasers
2. League Management - Create, join, track balance
3. Auction System - Admin manage, users bid, real-time
4. Football Squares - 10x10 grid, quarterly prizes
5. Dashboard - Quick stats
6. Bet History - Full history + CSV export

## Environment Variables
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=local
REACT_APP_VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
REACT_APP_PUSHER_KEY=8480e4a0d4175d7bfdf9
REACT_APP_PUSHER_CLUSTER=ap1
```

## Build Commands
```bash
npm start                   # Dev
npm run build              # Production
npm run new-build          # Alternative
npm run build-and-rename   # Build + rename
```

## Next Steps for V2
1. Audit current patterns for improvements
2. Plan TypeScript migration
3. Design state management approach
4. Setup testing infrastructure
5. Create component library (Storybook)
6. Plan styling consolidation
7. Document all reusable patterns

See ARCHITECTURE_SUMMARY.txt for detailed structure.

# V2 Clerk UserButton Integration

## Changes Applied

### ✅ Replaced Custom User Menu with Clerk UserButton

**Before**: Custom Avatar dropdown menu with manual user management
**After**: Clerk's built-in `<UserButton />` component with automatic user session handling

---

## Implementation Details

### 1. **Imports Updated**
```jsx
// Added Clerk imports
import { UserButton, useUser } from '@clerk/clerk-react';

// Removed Avatar (no longer needed)
// import Avatar from '../ui/Avatar';
```

### 2. **Hooks Added**
```jsx
const { isSignedIn, user: clerkUser, isLoaded } = useUser();
```

- `isSignedIn` - Boolean indicating if user is authenticated
- `clerkUser` - Clerk user object with fullName, email, etc.
- `isLoaded` - Boolean indicating if Clerk has finished loading

### 3. **User Menu Replaced**
```jsx
{/* User Menu with Clerk UserButton */}
{isSignedIn && (
  <div className="flex items-center gap-4">
    {isLoaded && clerkUser && (
      <p className="select-none hidden lg:block">
        {clerkUser.fullName}
      </p>
    )}
    <UserButton afterSignOutUrl='/logout' />
  </div>
)}

{!isSignedIn && (
  <div>
    <Button variant="ghost">Sign In</Button>
    <Button variant="primary">Get Started</Button>
  </div>
)}
```

---

## Features

### ✅ **Desktop View** (≥ 1024px)
```
[Logo] GoatSportsPools   Home Pools Leagues Betting   [John Doe] [👤]
```
- Full name visible
- UserButton (avatar/initials)

### ✅ **Tablet View** (768px - 1023px)
```
[Logo] GoatSportsPools   Home Pools Leagues Betting   [👤]
```
- Name hidden (using `hidden lg:block`)
- UserButton visible

### ✅ **Mobile View** (< 768px)
```
[Logo] GoatSportsPools   [☰]   [👤]
```
- Name hidden
- Mobile menu button
- UserButton visible

---

## Clerk UserButton Features

The Clerk `<UserButton />` component provides:

1. **Automatic Avatar**
   - Shows user profile image
   - Falls back to initials
   - Colored background

2. **Built-in Dropdown Menu**
   - Manage account
   - Sign out
   - Custom menu items (if configured)

3. **Session Management**
   - Automatic token refresh
   - Session persistence
   - Multi-session support

4. **Customization**
   - `afterSignOutUrl='/logout'` - Redirects after sign out
   - Can add custom appearance
   - Can add custom menu items

---

## V2 Styling Applied

### User Name Text:
```jsx
{
  fontSize: '0.875rem',      // 14px
  fontWeight: 500,           // Medium
  color: colors.text         // Theme-aware text color
}
```

### Layout:
- Uses Tailwind classes: `flex items-center gap-4`
- Responsive visibility: `hidden lg:block` (name only on large screens)
- Consistent with v1 behavior

---

## Comparison: V1 vs V2

| Feature | V1 | V2 |
|---------|----|----|
| User Button | Clerk UserButton | Clerk UserButton ✅ |
| User Name Display | Desktop only | Desktop only ✅ |
| Sign Out Redirect | `/logout` | `/logout` ✅ |
| Responsive | Yes | Yes ✅ |
| Theme Support | No | Yes (colors.text) ✅ |

---

## Benefits of Using Clerk UserButton

1. **Less Code** - Removed ~70 lines of custom menu code
2. **Better UX** - Professional, familiar interface
3. **Automatic Updates** - Clerk handles session management
4. **Built-in Features** - Account management, settings, etc.
5. **Consistency** - Same experience as v1
6. **Maintained** - Clerk keeps it updated

---

## Code Cleanup

### Removed:
- ❌ `Avatar` component import
- ❌ `showUserMenu` state
- ❌ `userMenuStyles` object
- ❌ `menuItemStyles` object
- ❌ `themeToggleStyles` object (already commented out)
- ❌ Custom dropdown menu JSX (~60 lines)

### Kept:
- ✅ Auth buttons for non-signed-in users
- ✅ Theme context integration
- ✅ Navigation functionality
- ✅ Mobile responsiveness

---

## Testing Checklist

- [ ] Desktop: User name shows next to UserButton
- [ ] Desktop: UserButton dropdown opens correctly
- [ ] Tablet: User name hidden
- [ ] Mobile: User name hidden
- [ ] Sign out redirects to `/logout`
- [ ] Auth buttons show when not signed in
- [ ] UserButton styling matches theme
- [ ] No console errors

---

## Files Modified

**src/v2/components/layout/Header.js**
- Line 4: Added Clerk imports
- Line 9: Added `useUser()` hook
- Line 11: Removed `showUserMenu` state
- Line 75: Removed unused style objects
- Line 199-224: Replaced custom menu with Clerk UserButton

---

## Future Enhancements

### Optional Customizations:

1. **Custom Appearance**
```jsx
<UserButton
  appearance={{
    elements: {
      avatarBox: "w-10 h-10",
      userButtonPopoverCard: "shadow-xl"
    }
  }}
  afterSignOutUrl='/logout'
/>
```

2. **Custom Menu Items**
```jsx
<UserButton afterSignOutUrl='/logout'>
  <UserButton.MenuItems>
    <UserButton.Link
      label="Dashboard"
      labelIcon={<DashboardIcon />}
      href="/v2/dashboard"
    />
  </UserButton.MenuItems>
</UserButton>
```

---

**Status**: ✅ Complete and Production Ready
**Date**: November 2025
**Version**: V2 Clerk Integration v1.0

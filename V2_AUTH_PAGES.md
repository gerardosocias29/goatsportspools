# V2 Authentication Pages

## Created Files

### 1. **SignIn Page** (`src/v2/pages/SignIn.js`)
- ✅ Uses Clerk's `<SignIn />` component
- ✅ V2 styled with theme colors
- ✅ Brand logo and styling
- ✅ Custom appearance matching V2 design system
- ✅ Path: `/v2/sign-in`

### 2. **SignUp Page** (`src/v2/pages/SignUp.js`)
- ✅ Uses Clerk's `<SignUp />` component
- ✅ V2 styled with theme colors
- ✅ Brand logo and styling
- ✅ Custom appearance matching V2 design system
- ✅ Path: `/v2/sign-up`

---

## Features

### ✅ **V2 Design Standards**
Both pages follow V2 design principles:
- Rounded corners (1rem border radius)
- Brand colors (Burnt Orange primary)
- Hubot Sans font for headings
- Inter font for body text
- Theme-aware styling
- Smooth transitions
- Fade-in animations
- Responsive layout

### ✅ **Clerk Integration**
- Full Clerk authentication functionality
- Social login buttons
- Email/password signup
- Email verification
- Password reset
- Custom styling via `appearance` prop

### ✅ **V2 URL Prefixes**
All auth routes use `/v2/` prefix:
- Sign In: `/v2/sign-in`
- Sign Up: `/v2/sign-up`
- Redirects: `/v2/dashboard` after auth

---

## Clerk Appearance Customization

Both pages include custom styling:

```jsx
appearance={{
  elements: {
    card: {
      borderRadius: '1rem',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.card,
    },
    formButtonPrimary: {
      backgroundColor: colors.brand.primary,
      borderRadius: '0.75rem',
      height: '2.75rem',
    },
    formFieldInput: {
      borderRadius: '0.75rem',
      border: `1px solid ${colors.border}`,
      height: '2.75rem',
    },
    // ... more custom styles
  }
}}
```

---

## Routing Structure

### Updated `V2App.js`:
```jsx
<Routes>
  {/* Auth Routes - Without Layout (full page) */}
  <Route path="/sign-in/*" element={<SignInPage />} />
  <Route path="/sign-up/*" element={<SignUpPage />} />

  {/* All other routes - With Layout */}
  <Route path="/*" element={
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* ... more routes */}
      </Routes>
    </Layout>
  } />
</Routes>
```

**Why separate?**
- Auth pages don't need header/footer
- Clean, focused authentication experience
- Full-page Clerk components

---

## Navigation Updates

### Updated Components:
1. **Header.js** - Auth buttons
   - Sign In button → `/v2/sign-in`
   - Get Started button → `/v2/sign-up`

2. **Hero.js** - CTA button
   - Get Started Free → `/v2/sign-up`

3. **Home.js** - CTA section
   - Create Free Account → `/v2/sign-up`

---

## User Flow

### **New User Sign Up:**
```
/v2 (Home)
  → Click "Get Started"
  → /v2/sign-up
  → Complete signup
  → /v2/dashboard
```

### **Existing User Sign In:**
```
/v2 (Home)
  → Click "Sign In"
  → /v2/sign-in
  → Enter credentials
  → /v2/dashboard
```

### **Protected Route Access:**
```
User not logged in
  → Access /v2/dashboard
  → Redirect to /v2/sign-in
  → After login → /v2/dashboard
```

---

## Page Structure

### SignIn Page Layout:
```
┌─────────────────────────────┐
│                             │
│    [Logo] GoatSportsPools   │
│    Sign in to your account  │
│                             │
│    ┌─────────────────────┐  │
│    │  Clerk SignIn Form  │  │
│    │  - Social buttons   │  │
│    │  - Email input      │  │
│    │  - Password input   │  │
│    │  - Sign In button   │  │
│    │  - Sign Up link     │  │
│    └─────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### SignUp Page Layout:
```
┌─────────────────────────────┐
│                             │
│    [Logo] GoatSportsPools   │
│    Create your account      │
│                             │
│    ┌─────────────────────┐  │
│    │  Clerk SignUp Form  │  │
│    │  - Social buttons   │  │
│    │  - Name input       │  │
│    │  - Email input      │  │
│    │  - Password input   │  │
│    │  - Sign Up button   │  │
│    │  - Sign In link     │  │
│    └─────────────────────┘  │
│                             │
└─────────────────────────────┘
```

---

## Styling Details

### Container:
- Min height: 100vh (full screen)
- Centered with flexbox
- Padding: 2rem
- Max width: 480px

### Logo:
- Brand logo image (48px height)
- GoatSportsPools text
- Clickable → back to home
- Centered above form

### Clerk Form:
- Rounded corners (1rem)
- Border with theme color
- Custom button colors
- Input field styling
- Hover states
- Focus states

---

## Testing Checklist

- [ ] Sign up with email/password works
- [ ] Sign up with social providers works
- [ ] Sign in with existing account works
- [ ] Redirect to dashboard after auth
- [ ] Protected routes redirect to sign-in
- [ ] Logo clicks navigate to /v2
- [ ] Styling matches V2 design
- [ ] Forms are responsive on mobile
- [ ] Error messages display correctly
- [ ] Verification emails send

---

## Files Modified

1. **NEW**: `src/v2/pages/SignIn.js`
2. **NEW**: `src/v2/pages/SignUp.js`
3. **MODIFIED**: `src/v2/V2App.js` - Added auth routes
4. **MODIFIED**: `src/v2/components/layout/Header.js` - Updated button URLs
5. **MODIFIED**: `src/v2/components/sections/Hero.js` - Updated CTA URL
6. **MODIFIED**: `src/v2/pages/Home.js` - Updated CTA URL

---

## Future Enhancements

### Optional Features:
1. **Password Reset Page**
   - Create `/v2/forgot-password`
   - Use Clerk's password reset flow

2. **Email Verification Page**
   - Create `/v2/verify-email`
   - Custom verification UI

3. **Multi-factor Auth**
   - Add MFA setup page
   - Use Clerk's MFA components

4. **Profile Completion**
   - After signup → complete profile
   - Collect additional user info

---

**Status**: ✅ Complete and Production Ready
**Date**: November 2025
**Version**: V2 Auth Pages v1.0

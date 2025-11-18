# Squares Pool - Role & Permission System

## Overview
This document defines the role-based access control (RBAC) system for the Squares Pool feature in GOAT Sports Pools.

## Role Definitions

### Role ID 1: Superadmin
**Description**: Platform administrators with full system access

**Permissions**:
- ✅ View ALL pools (including pools created by others)
- ✅ Manage ALL pools (close, reopen, edit settings)
- ✅ Create new pools
- ✅ Delete any pool
- ✅ Assign pool commissioners to any pool
- ✅ Promote users to Square Admin (change role_id to 2)
- ✅ Demote Square Admins back to regular users
- ✅ Grant credits to any user directly
- ✅ Approve credit requests from Square Admins
- ✅ View all user data and statistics
- ✅ Access admin dashboard with full controls
- ✅ Manually assign squares to players (admin mode)
- ✅ Calculate winners for any pool
- ✅ Generate and download QR codes for any pool

**Backend Role Check**:
```php
$isSuperAdmin = auth()->user()->role_id === 1;
```

**Frontend Role Check**:
```javascript
const isSuperAdmin = currentUser?.user?.role_id === 1 || currentUser?.role_id === 1;
```

---

### Role ID 2: Square Admin (Commissioner)
**Description**: Users authorized to create and manage their own pools

**Permissions**:
- ✅ View ALL pools (read-only for others' pools)
- ✅ Manage ONLY pools they created
- ✅ Create new pools
- ✅ Close/reopen their own pools
- ✅ Edit settings for their own pools
- ✅ Grant credits to players in their own pools
- ✅ Request credits from Superadmin for their account
- ✅ View players in their own pools
- ✅ Calculate winners for their own pools
- ✅ Generate QR codes for their own pools
- ✅ Manually assign squares in their own pools
- ❌ Cannot delete pools (must request Superadmin)
- ❌ Cannot manage pools created by others
- ❌ Cannot promote/demote users
- ❌ Cannot assign commissioners to pools

**Backend Role Check**:
```php
$isSquareAdmin = auth()->user()->role_id === 2;
$canManagePool = $pool->admin_id === auth()->id() || $pool->created_by === auth()->id();
```

**Frontend Role Check**:
```javascript
const isSquareAdmin = currentUser?.user?.role_id === 2 || currentUser?.role_id === 2;
const isPoolOwner = pool.admin_id === currentUserId || pool.created_by === currentUserId;
const canManagePool = isSquareAdmin && isPoolOwner;
```

---

### Role ID 3+: Regular User (Player)
**Description**: Standard users who can join and participate in pools

**Permissions**:
- ✅ View all available pools
- ✅ Join open pools (with or without password)
- ✅ Select and claim squares in joined pools
- ✅ View their own claimed squares
- ✅ Release their own squares (if pool allows)
- ✅ View pool details and winners
- ✅ Request credits from pool commissioner
- ❌ Cannot create pools
- ❌ Cannot manage any pools
- ❌ Cannot view admin controls
- ❌ Cannot grant credits
- ❌ Cannot calculate winners
- ❌ Cannot manually assign squares

**Backend Role Check**:
```php
$isRegularUser = auth()->user()->role_id >= 3;
```

**Frontend Role Check**:
```javascript
const isRegularUser = (currentUser?.user?.role_id ?? currentUser?.role_id) > 2;
```

---

## Permission Matrix

| Action | Superadmin (1) | Square Admin (2) | Regular User (3+) |
|--------|----------------|------------------|-------------------|
| **Pool Management** |
| View all pools | ✅ | ✅ (read-only for others) | ✅ (public pools) |
| Create pool | ✅ | ✅ | ❌ |
| Edit own pool | ✅ | ✅ | ❌ |
| Edit any pool | ✅ | ❌ | ❌ |
| Delete pool | ✅ | ❌ | ❌ |
| Close/reopen own pool | ✅ | ✅ | ❌ |
| Close/reopen any pool | ✅ | ❌ | ❌ |
| **User Management** |
| Promote to Square Admin | ✅ | ❌ | ❌ |
| Assign pool commissioner | ✅ | ❌ | ❌ |
| View all users | ✅ | ❌ | ❌ |
| **Credit Management** |
| Grant credits (any pool) | ✅ | ❌ | ❌ |
| Grant credits (own pool) | ✅ | ✅ | ❌ |
| Request credits from commissioner | ✅ | ✅ | ✅ |
| Request credits from superadmin | N/A | ✅ | ❌ |
| Approve credit requests (any) | ✅ | ❌ | ❌ |
| Approve credit requests (own pool) | ✅ | ✅ | ❌ |
| **Square Management** |
| Select squares (joined pools) | ✅ | ✅ | ✅ |
| Admin-assign squares (own pool) | ✅ | ✅ | ❌ |
| Admin-assign squares (any pool) | ✅ | ❌ | ❌ |
| Release own squares | ✅ | ✅ | ✅ |
| **Winner Management** |
| Calculate winners (own pool) | ✅ | ✅ | ❌ |
| Calculate winners (any pool) | ✅ | ❌ | ❌ |
| View winners | ✅ | ✅ | ✅ |

---

## Authentication & Authorization Flow

### Pool Detail Page Access
```javascript
// Authentication Guard
if (!isSignedIn) {
  navigate('/v2/sign-in', { state: { returnTo: currentPath } });
}
```

### Create Pool Access
```javascript
// Role-based Access Control
const userRoleId = currentUser?.user?.role_id ?? currentUser?.role_id;

if (userRoleId > 2) {
  alert('You do not have permission to create pools. Only admins can create pools.');
  navigate('/v2/squares');
}
```

### Admin Controls Visibility
```javascript
// Show admin controls based on role and ownership
const isSuperAdmin = roleId === 1;
const isSquareAdmin = roleId === 2;
const isPoolOwner = pool.admin_id === currentUserId || pool.created_by === currentUserId;

const canManagePool = isSuperAdmin || (isSquareAdmin && isPoolOwner) || isPoolOwner;

{canManagePool && (
  <div className="admin-controls">
    {/* Admin action buttons */}
  </div>
)}
```

---

## Credit Request System

### Flow 1: Regular User → Pool Commissioner
1. User clicks "Request Credits" button in pool they joined
2. Modal shows requesting credits from pool commissioner
3. Request stored in `credit_requests` table
4. Pool commissioner sees pending requests in admin panel
5. Commissioner approves/denies request
6. User receives credits (if approved)

### Flow 2: Square Admin → Superadmin
1. Square Admin clicks "Request Credits from Superadmin"
2. Modal shows global credit request form
3. Request stored in `admin_credit_requests` table
4. Superadmin sees pending requests in admin dashboard
5. Superadmin approves/denies request
6. Square Admin receives credits (if approved)

---

## API Endpoints & Role Requirements

### Pool Management
- `GET /api/squares-pools` - All roles
- `POST /api/squares-pools` - role_id <= 2 only
- `GET /api/squares-pools/{id}` - All roles (password hidden for non-admins)
- `PATCH /api/squares-pools/{id}/settings` - Pool admin or superadmin
- `POST /api/squares-pools/{id}/close` - Pool admin or superadmin
- `POST /api/squares-pools/{id}/reopen` - Pool admin or superadmin
- `DELETE /api/squares-pools/{id}` - Superadmin only

### User Management
- `POST /api/users/{id}/promote-to-square-admin` - Superadmin only
- `POST /api/users/{id}/demote-from-square-admin` - Superadmin only
- `POST /api/squares-pools/{id}/assign-commissioner` - Superadmin only

### Credit Management
- `POST /api/squares-pools/{id}/add-credits` - Pool admin or superadmin
- `POST /api/squares-pools/{poolId}/request-credits` - Any authenticated user in pool
- `POST /api/admin/request-credits` - Square Admin only
- `GET /api/admin/credit-requests` - Superadmin only
- `POST /api/admin/credit-requests/{id}/approve` - Superadmin only

### Square Management
- `POST /api/squares-pools/{poolId}/claim-square` - Any user in pool
- `POST /api/squares-pools/{poolId}/admin-assign-square` - Pool admin or superadmin
- `POST /api/squares-pools/{poolId}/release-square` - Square owner

### Winner Management
- `POST /api/squares-pools/{id}/calculate-winners` - Pool admin or superadmin
- `POST /api/squares-pools/{id}/calculate-all-winners` - Pool admin or superadmin
- `GET /api/squares-pools/{id}/winners` - All roles

---

## Backend Middleware & Guards

### Role Verification Middleware
```php
// app/Http/Middleware/CheckSquaresPermission.php

public function handle($request, Closure $next, $requiredRole)
{
    $user = auth()->user();

    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    if ($requiredRole === 'superadmin' && $user->role_id !== 1) {
        return response()->json(['message' => 'Forbidden'], 403);
    }

    if ($requiredRole === 'admin' && $user->role_id > 2) {
        return response()->json(['message' => 'Forbidden'], 403);
    }

    return $next($request);
}
```

### Pool Ownership Check
```php
// In Controller
$pool = SquaresPool::findOrFail($id);
$user = auth()->user();

$isPoolAdmin = $pool->admin_id === $user->id || $pool->created_by === $user->id;
$isSuperAdmin = $user->role_id === 1;

if (!$isPoolAdmin && !$isSuperAdmin) {
    return response()->json(['message' => 'You do not have permission to manage this pool'], 403);
}
```

---

## Frontend Components & Role Checks

### Files with Role-Based Logic

1. **SquaresPoolDetail.js**
   - Admin controls visibility (line 631-633)
   - Grant credits button (superadmin only)
   - Pool settings management
   - Winner calculation

2. **SquaresPoolList.js**
   - Create Pool button visibility (line 127-138, 258-268)
   - Only visible to role_id <= 2

3. **CreateSquaresPool.js**
   - Route guard (line 66-81)
   - Redirects if role_id > 2

4. **SquaresJoin.js**
   - Authentication guard (line 26-30)
   - Redirects to sign-in if not authenticated

---

## Best Practices

### Backend
1. **Always verify role on backend** - Never trust frontend role checks alone
2. **Use middleware** for route protection
3. **Check ownership** before allowing pool modifications
4. **Log admin actions** for audit trail
5. **Return appropriate HTTP status codes** (401, 403, 404)

### Frontend
1. **Hide UI elements** based on role (don't just disable)
2. **Show helpful error messages** when access denied
3. **Redirect gracefully** when unauthorized
4. **Use consistent role checking** functions
5. **Handle edge cases** (role_id undefined, null user, etc.)

---

## Future Enhancements

### Planned Features
- [ ] Multiple commissioners per pool
- [ ] Temporary commissioner delegation
- [ ] Granular permissions system
- [ ] Audit log for admin actions
- [ ] Role-based email notifications
- [ ] Commissioner approval workflow for new Square Admins

---

## Testing Role-Based Access

### Test Cases

**Superadmin (role_id = 1)**
- [ ] Can view all pools
- [ ] Can manage any pool
- [ ] Can create pools
- [ ] Can promote users to Square Admin
- [ ] Can grant credits to anyone
- [ ] Can approve Square Admin credit requests

**Square Admin (role_id = 2)**
- [ ] Can create pools
- [ ] Can manage own pools
- [ ] Cannot manage others' pools
- [ ] Cannot promote users
- [ ] Can request credits from superadmin
- [ ] Can grant credits in own pools

**Regular User (role_id = 3)**
- [ ] Cannot see Create Pool button
- [ ] Cannot access /v2/squares/create
- [ ] Cannot see admin controls
- [ ] Can join pools
- [ ] Can select squares
- [ ] Can request credits from commissioner

---

## Troubleshooting

### Common Issues

**Issue**: User can't create pools despite being admin
- Check: Verify role_id is 1 or 2
- Check: Frontend is reading role from correct user object property
- Check: User is authenticated

**Issue**: Admin controls not showing for pool owner
- Check: pool.admin_id matches current user ID
- Check: pool.created_by is set correctly
- Check: canManagePool logic includes ownership check

**Issue**: Password visible to non-admins
- Check: Backend is hiding password in API response
- Check: Line 95-97 in SquaresPoolController.php

---

**Last Updated**: 2025-11-18
**Version**: 1.0.0
**Author**: GOAT Sports Pools Development Team

# Custom Payout Backend Implementation

## Overview
This document outlines the backend changes needed to support the custom payout feature for squares pools.

## What Was Changed in Frontend
1. **Label Change**: All "Total Pot" labels changed to "Payout"
2. **New Field**: Added `customPayout` field to pool creation form (optional)
3. **Display Logic**: UI now shows `custom_payout` if available, otherwise calculates from `entry_fee * claimed_squares`

## Required Backend Changes

### 1. Database Migration
Add a new column to the squares pools table:

```sql
ALTER TABLE player_pools ADD COLUMN custom_payout DECIMAL(10,2) NULL AFTER entry_fee;
-- OR if your table is named differently:
ALTER TABLE squares_pools ADD COLUMN custom_payout DECIMAL(10,2) NULL AFTER entry_fee;
```

### 2. Pool Controller - Store Method
Update the pool creation endpoint to accept and save `custom_payout`:

**File**: `app/Http/Controllers/SquaresPoolController.php` (or similar)

```php
public function store(Request $request)
{
    $validated = $request->validate([
        // ... existing validations ...
        'entry_fee' => 'required|numeric|min:0',
        'custom_payout' => 'nullable|numeric|min:0', // ADD THIS LINE
        // ... other fields ...
    ]);

    $pool = PlayerPool::create([
        // ... existing fields ...
        'entry_fee' => $validated['entry_fee'],
        'custom_payout' => $validated['custom_payout'], // ADD THIS LINE
        // ... other fields ...
    ]);

    return response()->json([
        'status' => true,
        'data' => $pool,
    ]);
}
```

### 3. Pool Model - Fillable/Casts
Add to model's $fillable array:

**File**: `app/Models/PlayerPool.php`

```php
protected $fillable = [
    // ... existing fields ...
    'entry_fee',
    'custom_payout',  // ADD THIS LINE
    // ... other fields ...
];

protected $casts = [
    // ... existing casts ...
    'entry_fee' => 'decimal:2',
    'custom_payout' => 'decimal:2',  // ADD THIS LINE
];
```

### 4. Winner Calculation Logic
When calculating winners, use custom_payout if set, otherwise calculate from entry fees.

**File**: Wherever winner payouts are calculated

```php
public function calculateWinnerPayout($pool, $quarterPercent)
{
    // Use custom payout if set, otherwise calculate from entry fees
    $totalPayout = $pool->custom_payout ?? ($pool->entry_fee * 100);
    
    // Calculate quarter payout
    $quarterPayout = ($totalPayout * $quarterPercent) / 100;
    
    return $quarterPayout;
}

// Example in winner distribution:
$totalPot = $pool->custom_payout ?? ($pool->entry_fee * $pool->claimed_squares);
$q1Payout = ($totalPot * $pool->reward1_percent) / 100;
$q2Payout = ($totalPot * $pool->reward2_percent) / 100;
// etc...
```

### 5. API Response
Ensure the API returns `custom_payout` in pool data:

```php
// In pool resource or controller response
return [
    'id' => $pool->id,
    'pool_name' => $pool->pool_name,
    'entry_fee' => $pool->entry_fee,
    'custom_payout' => $pool->custom_payout,  // ADD THIS LINE
    'total_pot' => $pool->custom_payout ?? ($pool->entry_fee * $pool->claimed_squares),
    // ... other fields ...
];
```

## Frontend API Request
The frontend now sends this in the pool creation request:

```javascript
{
  pool_name: "...",
  entry_fee: 10.00,
  custom_payout: 800.00,  // or null if not set
  // ... other fields ...
}
```

## Example Scenario
- **Entry Fee**: $10 per square
- **Total Squares**: 100
- **Normal Calculation**: $10 × 100 = $1,000 payout
- **Custom Payout**: Admin sets $800 - winners receive from $800 pool instead

## Testing Checklist
- [ ] Create pool without custom_payout (should auto-calculate)
- [ ] Create pool with custom_payout (should use custom amount)
- [ ] View pool detail page (should show correct payout)
- [ ] Calculate winners (should distribute from correct payout amount)
- [ ] Update existing pool (should preserve custom_payout)

## Notes
- `custom_payout` is optional (nullable) - if not set, system calculates automatically
- Frontend validates that custom_payout > 0 if entered
- Custom payout can be less than or greater than calculated amount
- Winners distribution percentages remain the same, just applied to different base amount

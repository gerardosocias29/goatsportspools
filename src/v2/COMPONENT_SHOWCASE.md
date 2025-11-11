# V2 Component Showcase

Visual examples of all available components and their usage.

## 🎨 Buttons

### Variants
```jsx
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="danger">Danger Button</Button>
```

### Sizes
```jsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### States
```jsx
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
```

### With Icons
```jsx
<Button
  icon={<svg>...</svg>}
  iconPosition="left"
>
  Button with Icon
</Button>
```

## 🃏 Cards

### Basic Card
```jsx
<Card padding="lg" hover>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### Full Card with Sub-components
```jsx
<Card padding="lg">
  <CardHeader>
    <CardTitle>My Card Title</CardTitle>
    <CardDescription>A brief description</CardDescription>
  </CardHeader>

  <div>
    Main content area
  </div>

  <CardFooter>
    <Button variant="primary">Action</Button>
    <Button variant="ghost">Cancel</Button>
  </CardFooter>
</Card>
```

### Glassmorphism Card
```jsx
<Card glass padding="xl">
  <h3>Glass Card</h3>
  <p>Beautiful frosted glass effect</p>
</Card>
```

## 📝 Inputs

### Text Input
```jsx
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  fullWidth
/>
```

### Input with Icon
```jsx
<Input
  label="Search"
  type="text"
  placeholder="Search..."
  icon={<SearchIcon />}
  iconPosition="left"
/>
```

### Input with Error
```jsx
<Input
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error="Password must be at least 8 characters"
  required
/>
```

### Textarea
```jsx
<Textarea
  label="Message"
  placeholder="Enter your message..."
  rows={4}
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  fullWidth
/>
```

## 🏷️ Badges

### Variants
```jsx
<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>
```

### Sizes
```jsx
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

### Rounded
```jsx
<Badge rounded>Rounded Badge</Badge>
```

## 👤 Avatars

### Sizes
```jsx
<Avatar size="xs" alt="User" />
<Avatar size="sm" alt="User" />
<Avatar size="md" alt="User" />
<Avatar size="lg" alt="User" />
<Avatar size="xl" alt="User" />
<Avatar size="2xl" alt="User" />
```

### With Image
```jsx
<Avatar
  src="/path/to/image.jpg"
  alt="John Doe"
  size="md"
/>
```

### With Status
```jsx
<Avatar
  src="/path/to/image.jpg"
  alt="John Doe"
  size="md"
  status="online"
/>
```

Status options: `online`, `offline`, `busy`, `away`

### Avatar Group
```jsx
<AvatarGroup max={3} size="md">
  <Avatar alt="User 1" />
  <Avatar alt="User 2" />
  <Avatar alt="User 3" />
  <Avatar alt="User 4" />
  <Avatar alt="User 5" />
</AvatarGroup>
```

Shows first 3 avatars and "+2" indicator

## 🎭 Layout Examples

### Page with Header and Footer
```jsx
<Layout user={user} onSignOut={handleSignOut}>
  <div style={{ padding: '2rem' }}>
    <h1>Page Content</h1>
  </div>
</Layout>
```

### Page without Header/Footer
```jsx
<Layout showHeader={false} showFooter={false}>
  <div>Full page content</div>
</Layout>
```

## 🎨 Theme Usage

### Access Theme Colors
```jsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <div style={{
      backgroundColor: colors.background,
      color: colors.text,
      border: `1px solid ${colors.border}`,
    }}>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}
```

### Available Colors
```jsx
colors.background        // Page background
colors.text              // Primary text
colors.border            // Border and dividers
colors.card              // Card background
colors.cardHover         // Card hover state
colors.highlight         // Subtle highlights
colors.shadow            // Shadow color
colors.shadowHover       // Hover shadow

// Brand Colors
colors.brand.primary         // #D47A3E (Burnt Orange)
colors.brand.primaryHover    // Darker orange
colors.brand.primaryActive   // Even darker
colors.brand.secondary       // #101826 (Deep Navy)
colors.brand.secondaryHover
colors.brand.secondaryActive

// Semantic Colors
colors.success    // Green
colors.error      // Red
colors.warning    // Yellow
colors.info       // Blue
```

## 📐 Common Layouts

### Stats Grid
```jsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem'
}}>
  <Card padding="lg">
    <div>Stat 1</div>
  </Card>
  <Card padding="lg">
    <div>Stat 2</div>
  </Card>
  <Card padding="lg">
    <div>Stat 3</div>
  </Card>
  <Card padding="lg">
    <div>Stat 4</div>
  </Card>
</div>
```

### Two Column Layout
```jsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '1.5rem'
}}>
  <Card padding="lg">
    <h3>Left Column</h3>
  </Card>
  <Card padding="lg">
    <h3>Right Column</h3>
  </Card>
</div>
```

### Hero Section
```jsx
<section style={{
  padding: '5rem 0',
  textAlign: 'center'
}}>
  <h1 style={{
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
    fontFamily: '"Hubot Sans", sans-serif',
    fontWeight: 800,
    marginBottom: '1.5rem'
  }}>
    Your Hero Title
  </h1>
  <p style={{
    fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
    marginBottom: '3rem',
    opacity: 0.8
  }}>
    Your hero description
  </p>
  <div style={{
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  }}>
    <Button variant="primary" size="xl">
      Primary Action
    </Button>
    <Button variant="outline" size="xl">
      Secondary Action
    </Button>
  </div>
</section>
```

## 🎬 Animations

### Fade In
```jsx
<div className="v2-fade-in">
  This element will fade in with a slide up
</div>
```

### Slide In
```jsx
<div className="v2-slide-in">
  This element will slide in from the left
</div>
```

### Pulse
```jsx
<div className="v2-pulse">
  This element will pulse continuously
</div>
```

## 🎯 Common Patterns

### Loading State
```jsx
function MyComponent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="v2-skeleton" style={{ height: '200px' }} />
      </div>
    );
  }

  return <div>{/* Render data */}</div>;
}
```

### Error State
```jsx
function MyComponent() {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <Card padding="lg">
        <div style={{ color: colors.error }}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return <div>{/* Render content */}</div>;
}
```

### Empty State
```jsx
function MyComponent() {
  const [items, setItems] = useState([]);

  if (items.length === 0) {
    return (
      <Card padding="xl" style={{ textAlign: 'center' }}>
        <h3>No items yet</h3>
        <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
          Get started by creating your first item
        </p>
        <Button variant="primary" onClick={handleCreate}>
          Create Item
        </Button>
      </Card>
    );
  }

  return <div>{/* Render items */}</div>;
}
```

## 🏆 Best Practices

### 1. Always Use Theme Colors
```jsx
// ❌ Don't do this
<div style={{ color: '#D47A3E' }}>Text</div>

// ✅ Do this
const { colors } = useTheme();
<div style={{ color: colors.brand.primary }}>Text</div>
```

### 2. Use Semantic HTML
```jsx
// ❌ Don't do this
<div onClick={handleClick}>Click me</div>

// ✅ Do this
<button onClick={handleClick}>Click me</button>
```

### 3. Proper Spacing
```jsx
// ❌ Don't do this
<div style={{ marginTop: '15px' }}>Content</div>

// ✅ Do this (use theme spacing)
<div style={{ marginTop: '1rem' }}>Content</div>
```

### 4. Responsive Design
```jsx
// ✅ Use clamp for fluid typography
<h1 style={{
  fontSize: 'clamp(2rem, 4vw, 3rem)'
}}>
  Responsive Heading
</h1>

// ✅ Use auto-fit grids
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '1.5rem'
}}>
  {/* Grid items */}
</div>
```

### 5. Accessibility
```jsx
// ✅ Always add alt text
<Avatar src="image.jpg" alt="John Doe" />

// ✅ Use proper labels
<Input label="Email" type="email" required />

// ✅ Add ARIA labels for icons
<button aria-label="Close">
  <CloseIcon />
</button>
```

---

**This is your component toolkit. Mix and match to create beautiful UIs!** 🎨

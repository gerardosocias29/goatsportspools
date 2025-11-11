# GOAT Sports Pools V2

A modern, refreshed front-end for Goatsportspools, built from scratch with a design inspired by Splash Sports while maintaining your brand's identity.

## 🎨 Design System

### Color Palette

#### Light Mode
- **Background**: `#FAF6F2` (Soft Sand)
- **Text**: `#1E1E1E` (Deep Charcoal)
- **Border**: `#D3C9C2` (Ash Gray)
- **Highlight**: `#FFD5B3` (Pale Orange)
- **Card**: `#FFFFFF` (Pure White)

#### Dark Mode
- **Background**: `#161C29` (Charcoal Navy)
- **Text**: `#FFF6ED` (Warm Cream)
- **Border**: `#2A3342` (Darker Border)
- **Highlight**: `#FFD5B3` (Pale Orange)
- **Card**: `#1E2736` (Slightly lighter than background)

#### Brand Colors
- **Primary**: `#D47A3E` (Burnt Orange)
- **Secondary**: `#101826` (Deep Navy)

### Typography

- **Body Font**: Inter
- **Heading Font**: Hubot Sans
- **Sizes**: Responsive with clamp() for fluid typography

### Design Principles

1. **Rounded edges**: 0.75rem - 1rem border radius
2. **Glassmorphism**: Subtle backdrop-filter effects on cards
3. **White space**: Generous padding and margins
4. **Card-based layout**: Everything is a card
5. **Subtle animations**: 250ms transitions with cubic-bezier easing
6. **Hover states**: TranslateY(-2px) on interactive elements

## 📁 Project Structure

```
src/v2/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Input.js
│   │   ├── Badge.js
│   │   ├── Avatar.js
│   │   └── index.js
│   ├── layout/                # Layout components
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── Layout.js
│   │   └── index.js
│   └── sections/              # Page sections
│       └── Hero.js
├── contexts/
│   └── ThemeContext.js        # Theme provider (light/dark mode)
├── pages/
│   ├── Home.js                # Landing page
│   ├── Dashboard.js           # User dashboard
│   └── [future pages]
├── styles/
│   ├── theme.js               # Theme configuration
│   └── globals.css            # Global styles
├── hooks/                     # Custom hooks (future)
├── V2App.js                   # Main V2 application
└── README.md                  # This file
```

## 🚀 Getting Started

### Accessing V2

The V2 front-end is accessible at:
```
http://localhost:3000/v2
```

### Routes

- `/v2` - Home page (public)
- `/v2/dashboard` - User dashboard (protected)
- `/v2/pools` - Pools page (coming soon)
- `/v2/leagues` - Leagues page (coming soon)
- `/v2/betting` - Betting page (coming soon)
- `/v2/settings` - Settings page (coming soon)
- `/v2/activity` - Activity page (coming soon)

## 🧩 Components

### UI Components

#### Button
```jsx
import { Button } from '../components/ui';

<Button
  variant="primary"    // primary, secondary, outline, ghost, danger
  size="md"           // sm, md, lg, xl
  fullWidth={false}
  loading={false}
  onClick={handleClick}
>
  Click Me
</Button>
```

#### Card
```jsx
import Card, { CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';

<Card padding="lg" hover glass>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>

  <div>Content here</div>

  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Input
```jsx
import Input, { Textarea } from '../components/ui/Input';

<Input
  label="Email"
  type="email"
  placeholder="Enter email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
  required
  fullWidth
/>
```

#### Badge
```jsx
import { Badge } from '../components/ui';

<Badge
  variant="success"    // default, primary, success, error, warning, info
  size="md"           // sm, md, lg
  rounded
>
  Live
</Badge>
```

#### Avatar
```jsx
import Avatar, { AvatarGroup } from '../components/ui/Avatar';

<Avatar
  src="/path/to/image.jpg"
  alt="John Doe"
  size="md"          // xs, sm, md, lg, xl, 2xl
  status="online"    // online, offline, busy, away
/>

<AvatarGroup max={3} size="md">
  <Avatar alt="User 1" />
  <Avatar alt="User 2" />
  <Avatar alt="User 3" />
</AvatarGroup>
```

### Layout Components

#### Layout
```jsx
import { Layout } from '../components/layout';

<Layout user={user} onSignOut={handleSignOut}>
  {children}
</Layout>
```

## 🎨 Theme System

### Using Theme

```jsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <div style={{ backgroundColor: colors.background, color: colors.text }}>
      <button onClick={toggleTheme}>
        Toggle {isDark ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
};
```

### Theme Properties

- `colors` - Object with all theme colors
- `isDark` - Boolean indicating dark mode
- `toggleTheme()` - Function to toggle theme

## 🔌 Integration with Existing Backend

V2 uses the same backend as V1:

### Authentication
- Integrated with existing Clerk auth system
- Uses `AuthContext` from v1
- Shares user session and tokens

### API Calls
- Use the existing `AxiosContext` from v1
- All API endpoints remain the same
- Example:

```jsx
import { useAxios } from '../../app/contexts/AxiosContext';

const MyComponent = () => {
  const axiosService = useAxios();

  const fetchData = async () => {
    try {
      const response = await axiosService.get('/api/endpoint');
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return <div>...</div>;
};
```

### Real-time Updates
- Pusher.js integration remains the same
- Use existing Pusher channels
- No changes needed to backend

## 📱 Responsive Design

All components are fully responsive:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Use the responsive utilities:

```jsx
// In styles
const styles = {
  fontSize: 'clamp(1rem, 2vw, 1.5rem)',  // Fluid typography
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',  // Responsive grid
};
```

## 🎭 Animations

Built-in animation classes:

- `.v2-fade-in` - Fade in with slide up
- `.v2-slide-in` - Slide in from left
- `.v2-pulse` - Pulse animation

```jsx
<div className="v2-fade-in">
  This will fade in
</div>
```

## 🔧 Customization

### Adding New Colors

Edit `src/v2/styles/theme.js`:

```js
export const colors = {
  // Add your custom colors here
  custom: {
    myColor: '#123456',
  },
};
```

### Adding New Components

1. Create component in `src/v2/components/ui/`
2. Export from `src/v2/components/ui/index.js`
3. Use throughout the app

### Adding New Pages

1. Create page in `src/v2/pages/`
2. Add route in `src/v2/V2App.js`
3. Add navigation link in Header

## 🚧 Future Enhancements

- [ ] Implement all pool pages (Squares, Auctions, etc.)
- [ ] Add league management pages
- [ ] Create betting interface
- [ ] Add user settings and profile
- [ ] Implement notifications system
- [ ] Add animations library (Framer Motion)
- [ ] Create data visualization components (charts)
- [ ] Build mobile app with React Native
- [ ] Add i18n (internationalization)
- [ ] Implement A/B testing

## 🐛 Known Issues

None at this time. Report issues to the development team.

## 📝 Code Style

- Use functional components
- Inline styles for component-specific styling
- CSS classes for reusable utilities
- Props destructuring
- Clear prop naming

## 🤝 Contributing

When adding new features to V2:

1. Follow the existing design system
2. Use the theme context for colors
3. Ensure responsive design
4. Add proper prop types/validation
5. Test in both light and dark modes
6. Maintain accessibility standards

## 📄 License

Same as the main Goatsportspools application.

---

**Built with ❤️ for sports fans everywhere**

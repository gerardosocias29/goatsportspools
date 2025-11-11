# GOAT Sports Pools V2 - Quick Start Guide

## 🎯 What is V2?

V2 is a complete front-end redesign of Goatsportspools with:
- Modern, Splash Sports-inspired UI
- Your existing brand colors and identity
- Same backend, APIs, and authentication
- Fully responsive design
- Light and dark mode
- Accessible via `/v2` route

## 🚀 Quick Start

### 1. Access V2

Start your development server and navigate to:
```
http://localhost:3000/v2
```

### 2. Key Files

```
src/v2/
├── V2App.js              # Main V2 router
├── components/ui/        # Reusable components (Button, Card, etc.)
├── components/layout/    # Header, Footer, Layout
├── pages/               # Home, Dashboard, etc.
├── contexts/            # ThemeContext for light/dark mode
└── styles/              # Theme config and global CSS
```

### 3. Routes

- **Public**:
  - `/v2` - Home page

- **Protected** (requires login):
  - `/v2/dashboard` - User dashboard

- **Coming Soon**:
  - `/v2/pools`
  - `/v2/leagues`
  - `/v2/betting`
  - `/v2/settings`

## 🎨 Using Components

### Import Components

```jsx
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import Input from './components/ui/Input';
import Badge from './components/ui/Badge';
import Avatar from './components/ui/Avatar';
```

Or use the index:
```jsx
import { Button, Card, Badge, Avatar } from './components/ui';
```

### Example: Create a Card

```jsx
import Card, { CardHeader, CardTitle, CardFooter } from './components/ui/Card';
import Button from './components/ui/Button';

function MyComponent() {
  return (
    <Card padding="lg" hover>
      <CardHeader>
        <CardTitle>My Card</CardTitle>
      </CardHeader>

      <p>Card content goes here</p>

      <CardFooter>
        <Button variant="primary">Action</Button>
      </CardFooter>
    </Card>
  );
}
```

## 🎨 Using Theme

### Access Theme Colors and Dark Mode

```jsx
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <div style={{ backgroundColor: colors.background, color: colors.text }}>
      <p>Current mode: {isDark ? 'Dark' : 'Light'}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### Available Colors

```js
colors.background   // Background color
colors.text         // Text color
colors.border       // Border color
colors.card         // Card background
colors.highlight    // Subtle highlight
colors.brand.primary    // Burnt Orange (#D47A3E)
colors.brand.secondary  // Deep Navy (#101826)
colors.success      // Green
colors.error        // Red
colors.warning      // Yellow
colors.info         // Blue
```

## 🔌 Backend Integration

### Using Existing Auth

```jsx
import { useAuth } from '../app/contexts/AuthContext';

function MyComponent() {
  const { isLoggedIn, user, login, logout } = useAuth();

  if (!isLoggedIn) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

### Making API Calls

```jsx
import { useAxios } from '../app/contexts/AxiosContext';

function MyComponent() {
  const axiosService = useAxios();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosService.get('/api/pools');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return <div>{/* Render data */}</div>;
}
```

## 📱 Responsive Design

All components are mobile-first and responsive. Use these breakpoints:

```js
// Small screens (mobile)
< 640px

// Medium screens (tablet)
640px - 768px

// Large screens (desktop)
768px - 1024px

// Extra large screens
> 1024px
```

## 🎭 Animations

Use built-in animation classes:

```jsx
<div className="v2-fade-in">
  Fades in with slide up
</div>

<div className="v2-slide-in">
  Slides in from left
</div>

<div className="v2-pulse">
  Pulses continuously
</div>
```

## 🛠️ Common Tasks

### Add a New Page

1. **Create the page component:**
```jsx
// src/v2/pages/MyNewPage.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MyNewPage = () => {
  const { colors } = useTheme();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My New Page</h1>
    </div>
  );
};

export default MyNewPage;
```

2. **Add route in V2App.js:**
```jsx
import MyNewPage from './pages/MyNewPage';

// Inside Routes:
<Route path="/my-new-page" element={<MyNewPage />} />
```

3. **Add navigation link in Header.js:**
```jsx
<a onClick={() => navigate('/v2/my-new-page')}>
  My New Page
</a>
```

### Add a New UI Component

1. **Create component:**
```jsx
// src/v2/components/ui/MyComponent.js
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const MyComponent = ({ children, ...props }) => {
  const { colors } = useTheme();

  return (
    <div style={{ color: colors.text }} {...props}>
      {children}
    </div>
  );
};

export default MyComponent;
```

2. **Export from index:**
```jsx
// src/v2/components/ui/index.js
export { default as MyComponent } from './MyComponent';
```

3. **Use anywhere:**
```jsx
import { MyComponent } from '../components/ui';

<MyComponent>Hello!</MyComponent>
```

## 🎯 Next Steps

1. **Customize colors** in `src/v2/styles/theme.js`
2. **Add more pages** in `src/v2/pages/`
3. **Create custom components** in `src/v2/components/ui/`
4. **Integrate features** from v1 using existing APIs
5. **Test responsiveness** on different screen sizes
6. **Test both themes** (light and dark mode)

## 📚 Resources

- Full documentation: `src/v2/README.md`
- Theme config: `src/v2/styles/theme.js`
- Global styles: `src/v2/styles/globals.css`
- Component examples: `src/v2/pages/Dashboard.js`

## 💡 Tips

1. **Always use the theme context** for colors (don't hardcode)
2. **Use the Card component** for consistent styling
3. **Follow the existing component patterns** for consistency
4. **Test in both light and dark modes** before committing
5. **Keep components small and reusable**
6. **Use semantic HTML** for accessibility

## 🐛 Troubleshooting

### V2 not loading?
- Check that the route is added in `src/app/router/AppRouter.js`
- Ensure you're navigating to `/v2` (with the slash)

### Styles not applying?
- Make sure `src/v2/styles/globals.css` is imported in `V2App.js`
- Check that theme provider wraps your component

### Components not found?
- Verify import paths are correct
- Check that component is exported from index.js

## 🤝 Need Help?

Refer to:
- Component examples in existing pages
- Full README at `src/v2/README.md`
- Existing v1 code for API usage patterns

---

**Happy coding! 🚀**

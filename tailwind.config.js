/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Existing colors
        'background': '#100c44',
        'backgroundS': '#064ab8',
        'primary': '#453f65',
        'primaryS': '#d69a3e',

        // Brand colors
        'brand': {
          25: '#F8F7FF',
          50: '#F0EFFF',
          100: '#E1DFFF',
          200: '#C7C2FF',
          300: '#A197FF',
          400: '#7B6BFF',
          500: '#6366F1', // Primary brand color (Electric Indigo)
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },

        // Success colors
        'success': {
          50: '#ecfdf3',
          100: '#d1fadf',
          200: '#a6f4c5',
          300: '#6ce9a6',
          400: '#32d583',
          500: '#10B981',
          600: '#039855',
          700: '#027a48',
          800: '#05603a',
          900: '#054f31',
        },

        // Error colors
        'error': {
          50: '#fef3f2',
          100: '#fee4e2',
          200: '#fecdca',
          300: '#fda29b',
          400: '#f97066',
          500: '#EF4444',
          600: '#d92d20',
          700: '#b42318',
          800: '#912018',
          900: '#7a271a',
        },

        // Warning colors
        'warning': {
          50: '#fffaeb',
          100: '#fef0c7',
          200: '#fedf89',
          300: '#fec84b',
          400: '#fdb022',
          500: '#F59E0B',
          600: '#dc6803',
          700: '#b54708',
          800: '#93370d',
          900: '#7a2e0e',
        },

        // Info colors
        'info': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7cd4fd',
          400: '#36bffa',
          500: '#3B82F6',
          600: '#0086c9',
          700: '#026aa2',
          800: '#065986',
          900: '#0b4a6f',
        },

        // Gray colors for UI
        'gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },

      // Custom shadows from template
      boxShadow: {
        'theme-xs': '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
        'theme-sm': '0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
        'theme-md': '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
        'theme-lg': '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
        'theme-xl': '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
      },

      // Font families
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },

      // Custom font sizes
      fontSize: {
        'title-sm': ['30px', '38px'],
        'title-md': ['36px', '44px'],
        'title-lg': ['48px', '56px'],
        'theme-xs': ['12px', '18px'],
        'theme-sm': ['14px', '20px'],
      },

      // Border radius
      borderRadius: {
        'theme-sm': '6px',
        'theme-md': '8px',
        'theme-lg': '12px',
        'theme-xl': '16px',
      },

      // Spacing
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom color system for Spain Running Journey
        primary: {
          DEFAULT: '#FF8C00', // Main orange accent
          hover: '#FF9500',   // Lighter orange for hover states
          dark: '#E67E00',    // Darker orange for pressed states
        },
        background: {
          DEFAULT: '#000000', // Pure black background
          surface: 'rgba(255, 255, 255, 0.05)', // Subtle surface color
        },
        text: {
          primary: '#ffffff',   // Primary white text
          secondary: 'rgba(255, 255, 255, 0.9)', // Slightly transparent white
          muted: 'rgba(255, 255, 255, 0.7)',     // More transparent for captions
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)', // Subtle border
          accent: 'rgba(255, 140, 0, 0.3)',     // Orange border with opacity
        },
        // Add semantic colors that match the theme
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI', 
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif'
        ],
      },
      fontSize: {
        'hero-primary': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'hero-secondary': ['2rem', { lineHeight: '1.2', fontWeight: '300' }],
        'stat-number': ['1.8rem', { lineHeight: '1', fontWeight: '700' }],
        'stat-label': ['0.85rem', { lineHeight: '1', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',  // 72px
        '22': '5.5rem',  // 88px
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '88px',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 140, 0, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 140, 0, 0.2)',
        'inner-glow': 'inset 0 2px 4px rgba(255, 140, 0, 0.1)',
      },
      screens: {
        'xs': '480px',
        '3xl': '1920px',
      },
      borderWidth: {
        '3': '3px',
      },
      // Mobile-safe viewport height utilities
      height: {
        'screen-safe': ['100vh', '100dvh'], // Fallback to vh, prefer dvh for mobile
        'screen-mobile': '100dvh', // Dynamic viewport height for mobile
        'screen-full': ['100vh', '100svh'], // Small viewport height (always visible)
      },
    },
  },
  plugins: [],
}
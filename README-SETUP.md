# Spain Running Journey - Setup Guide

## ✅ Base Platform Ready with Tailwind CSS

The base platform has been successfully implemented with Tailwind CSS for a clean, maintainable, and modern styling approach.

### What's Been Implemented

- ✅ **Tailwind CSS Integration** - Utility-first CSS framework with custom design system
- ✅ **Dark Theme Design System** - Custom Tailwind config with black/white/orange (#FF8C00) palette
- ✅ **Astro 5 + React Islands** - Modern web framework with TypeScript support
- ✅ **Interactive Map Component** - MapLibre-based map with Spain focus
- ✅ **Responsive Hero Section** - Beautiful stats display with Tailwind utilities
- ✅ **Mobile-First Design** - Responsive breakpoints and optimized layouts
- ✅ **Mock Data Structure** - Ready for Supabase integration

### Quick Start

1. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open http://localhost:4321 to view the application

2. **For Supabase Integration** (when ready)
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials
   - Replace mock data in `SpainMap.tsx` with actual Supabase calls

### Tailwind Architecture

**Custom Design System:**
```javascript
// tailwind.config.mjs
colors: {
  primary: '#FF8C00',        // Main orange accent
  background: '#000000',     // Pure black background
  text: {
    primary: '#ffffff',      // Primary white text
    secondary: 'rgba(255, 255, 255, 0.9)',
    muted: 'rgba(255, 255, 255, 0.7)'
  }
}
```

**Key Features:**
- Custom color palette matching the design system
- Extended font sizes for hero typography
- Custom shadow effects with glow variants
- Backdrop blur utilities for glass effects
- Mobile-first responsive breakpoints

### Key Features

**🗺️ Interactive Map**
- 5 sample cities with styled Tailwind markers
- Click markers to view city details with glass-morphism panels
- Smooth map animations and transitions
- Reset view button with hover effects

**🎨 Modern Design**
- Utility-first styling with Tailwind CSS
- Glass-morphism effects with backdrop blur
- Subtle animations and hover states
- Custom scrollbar styling
- Professional loading states

**📱 Responsive Layout**
- Mobile-optimized hero section with responsive typography
- Adaptive map controls and panels
- Touch-friendly interactions
- Comprehensive breakpoint system

### Architecture

**Components Structure:**
```
src/
├── layouts/
│   └── Layout.astro          # Base layout with Tailwind integration
├── pages/
│   └── index.astro           # Home page with Tailwind utilities
├── components/
│   └── SpainMap.tsx          # Map component with clsx for conditional classes
└── utils/
    └── styles.ts             # Reusable Tailwind class combinations
```

**Styling Approach:**
- **Layout.astro** - Minimal custom CSS, mostly Tailwind utilities
- **SpainMap.tsx** - Full Tailwind conversion with `clsx` for dynamic classes
- **index.astro** - Responsive design with Tailwind utilities
- **styles.ts** - Shared style combinations for consistency

**Key Integration Points:**
- Mock data in `SpainMap.tsx` (line 22) - Replace with Supabase
- Environment variables ready in `.env.example`
- TypeScript interfaces defined for City, CityPhoto, CityTrack
- Tailwind config with custom design tokens

### Tailwind Benefits

- **🚀 Performance** - Purged CSS, only used styles included in build
- **🔧 Maintainability** - Utility classes reduce custom CSS complexity
- **📱 Responsive** - Built-in responsive modifiers (sm:, md:, lg:)
- **🎨 Consistency** - Design system enforced through configuration
- **⚡ Developer Experience** - IntelliSense support and rapid prototyping

### Next Steps

1. **Set up Supabase** - Create database and add real city data
2. **Replace Mock Data** - Update `SpainMap.tsx` with actual data fetching
3. **Extend Tailwind** - Add more custom utilities as needed
4. **Add Photo Galleries** - Use Tailwind for gallery layouts
5. **Implement Narrative Mode** - Tailwind animations for scroll experience

The foundation is modern, maintainable, and ready for your data integration! 🚀
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **interactive map-based web application** showcasing a personal running journey across 50 cities in Spain. The project uses **Astro 5** as the main framework with a minimalist dark theme design (black background, white text, orange #FF8C00 accent).

### Key Architecture Components

- **Framework**: Astro 5 with TypeScript support (strict mode)
- **Interactive Elements**: Astro Islands with React components using TypeScript
- **Database**: Supabase for storing city data (coordinates, tracks, photos, race information)
- **Maps**: MapLibre for rendering interactive maps and race tracks
- **Design System**: Dark mode with minimalist aesthetics, mobile-first approach

### Core Features Being Built

1. **Main Interactive Map**: Spain map with numbered points for 50 cities (chronological order)
2. **City Detail Views**: Individual pages with enlarged maps, race tracks, date/distance info, photo galleries
3. **Narrative Mode**: Mobile-optimized vertical scroll experience moving through cities automatically

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

- `src/layouts/Layout.astro` - Main HTML layout template
- `src/pages/` - File-based routing (currently has default Astro welcome page)
- `src/components/` - Astro and React components
- `src/assets/` - Static assets (SVGs, images)
- `astro.config.mjs` - Astro configuration (currently minimal)

## Architecture Notes

### Data Flow
The application will fetch data from **Supabase** containing:
- City coordinates and metadata
- Running track/route data
- Race information (dates, distances)
- Photo galleries for each city

### Component Strategy
- Use **Astro Islands** pattern for interactive map components
- React components with TypeScript for complex interactions
- Static Astro components for layout and presentation

### Responsive Design
- **Mobile First**: Narrative mode is primary mobile experience
- **Dark Theme**: Consistent throughout with orange accents
- **Minimalist**: Clean design with subtle gradients

## Integration Requirements

When adding new features:
- Configure React integration in `astro.config.mjs` if not already done
- Set up Supabase client configuration
- Integrate MapLibre for map functionality
- Maintain dark theme color scheme (black/white/orange #FF8C00)
- Ensure mobile-first responsive design principles
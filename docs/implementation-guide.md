# Implementation Guide: Spain Running Journey Map

## Overview

This guide provides a step-by-step implementation plan for building the interactive map application showcasing a personal running journey across 50 cities in Spain.

## Project Architecture

### Tech Stack
- **Frontend**: Astro 5 + React Islands + TypeScript
- **Database**: Supabase
- **Maps**: MapLibre GL JS
- **Styling**: CSS Modules/Astro Components
- **Design**: Dark theme (Black/White/Orange #FF8C00)

### Core Features
1. Interactive Spain map with 50 numbered city points
2. City detail views with race tracks and photo galleries
3. Mobile narrative scrolling mode
4. Chronological journey visualization

---

## Phase 1: Foundation Setup

### 1.1 Configure Astro + React Integration
```bash
# Install React integration
npm install @astrojs/react
npm install react react-dom
npm install @types/react @types/react-dom
```

**Update `astro.config.mjs`:**
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  output: 'static'
});
```

### 1.2 Install Core Dependencies
```bash
# Map library
npm install maplibre-gl

# Supabase client
npm install @supabase/supabase-js

# Additional utilities
npm install clsx
```

### 1.3 Environment Configuration
Create `.env` file:
```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Phase 2: Data Structure & Supabase Setup

### 2.1 Database Schema

**Cities Table (`cities`)**
```sql
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  order_number INTEGER NOT NULL UNIQUE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  run_date DATE NOT NULL,
  distance_km DECIMAL(5, 2),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE city_photos (
  id SERIAL PRIMARY KEY,
  city_id INTEGER REFERENCES cities(id),
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE city_tracks (
  id SERIAL PRIMARY KEY,
  city_id INTEGER REFERENCES cities(id),
  track_geojson JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 Supabase Client Setup
**File: `src/lib/supabase.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface City {
  id: number;
  name: string;
  order_number: number;
  latitude: number;
  longitude: number;
  run_date: string;
  distance_km?: number;
  description?: string;
}

export interface CityPhoto {
  id: number;
  city_id: number;
  photo_url: string;
  caption?: string;
}

export interface CityTrack {
  id: number;
  city_id: number;
  track_geojson: any;
}
```

---

## Phase 3: Core Components Architecture

### 3.1 Layout System
**Update `src/layouts/Layout.astro`:**
```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description = "Interactive map of my running journey across Spain" } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="description" content={description} />
    <title>{title}</title>
    
    <!-- MapLibre CSS -->
    <link href='https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css' rel='stylesheet' />
  </head>
  <body>
    <slot />
  </body>
</html>

<style>
  :root {
    --color-bg: #000000;
    --color-text: #ffffff;
    --color-accent: #FF8C00;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--color-bg);
    color: var(--color-text);
    line-height: 1.6;
  }

  html, body {
    height: 100%;
  }
</style>
```

### 3.2 Main Map Component
**File: `src/components/SpainMap.tsx`**
```typescript
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { supabase, type City } from '../lib/supabase';

interface SpainMapProps {
  onCitySelect?: (city: City) => void;
}

export default function SpainMap({ onCitySelect }: SpainMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('order_number');
    
    if (data && !error) {
      setCities(data);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-3.7038, 40.4168], // Madrid center
      zoom: 5.5
    });

    map.current.on('load', () => {
      addCityMarkers();
    });

    return () => {
      map.current?.remove();
    };
  }, [cities]);

  const addCityMarkers = () => {
    if (!map.current) return;

    cities.forEach((city) => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'city-marker';
      el.textContent = city.order_number.toString();
      
      el.addEventListener('click', () => {
        onCitySelect?.(city);
      });

      new maplibregl.Marker(el)
        .setLngLat([city.longitude, city.latitude])
        .addTo(map.current!);
    });
  };

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
    </div>
  );
}
```

### 3.3 Map Styles
**File: `src/components/SpainMap.module.css`**
```css
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

:global(.city-marker) {
  background: #FF8C00;
  color: #000;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  border: 2px solid #fff;
  transition: transform 0.2s;
}

:global(.city-marker:hover) {
  transform: scale(1.1);
}
```

---

## Phase 4: Pages & Routing

### 4.1 Main Page
**File: `src/pages/index.astro`**
```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Spain Running Journey">
  <main>
    <header class="hero">
      <h1>My Running Journey Through Spain</h1>
      <p>Discover the 50 cities where I've run, in chronological order</p>
    </header>
    
    <div id="map-container">
      <!-- Map will be loaded here -->
    </div>
  </main>
  
  <script>
    import SpainMap from '../components/SpainMap.tsx';
    // Client-side hydration logic here
  </script>
</Layout>

<style>
  .hero {
    position: absolute;
    top: 2rem;
    left: 2rem;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.8);
    padding: 1rem 2rem;
    border-radius: 8px;
    border: 1px solid var(--color-accent);
  }

  .hero h1 {
    color: var(--color-accent);
    margin-bottom: 0.5rem;
  }

  #map-container {
    width: 100%;
    height: 100vh;
  }

  @media (max-width: 768px) {
    .hero {
      position: static;
      margin: 1rem;
      text-align: center;
    }
    
    #map-container {
      height: calc(100vh - 120px);
    }
  }
</style>
```

### 4.2 City Detail Page
**File: `src/pages/city/[id].astro`**
```astro
---
export async function getStaticPaths() {
  // This will be populated with city data from Supabase
  return [
    { params: { id: "1" } },
    // ... other cities
  ];
}

const { id } = Astro.params;
---

<Layout title={`City ${id} - Running Journey`}>
  <div class="city-detail">
    <nav class="breadcrumb">
      <a href="/">← Back to Map</a>
    </nav>
    
    <div class="city-content">
      <!-- City details will be rendered here -->
    </div>
  </div>
</Layout>
```

---

## Phase 5: Implementation Checklist

### Essential Components to Build
- [ ] **SpainMap.tsx** - Main interactive map
- [ ] **CityDetail.tsx** - Individual city view
- [ ] **CityCard.tsx** - City information display
- [ ] **PhotoGallery.tsx** - Photo slideshow component
- [ ] **TrackMap.tsx** - Individual race track display

### Data Integration Tasks
- [ ] Set up Supabase project and database
- [ ] Create and populate cities table
- [ ] Implement data fetching functions
- [ ] Add photo upload and storage
- [ ] Import race track GeoJSON data

### Styling & UX
- [ ] Implement dark theme CSS variables
- [ ] Create responsive breakpoints
- [ ] Add loading states and animations
- [ ] Implement mobile navigation patterns
- [ ] Add accessibility features (ARIA labels, keyboard navigation)

### Mobile Experience
- [ ] Create narrative scroll component
- [ ] Implement touch gestures for map
- [ ] Optimize performance for mobile devices
- [ ] Test across different screen sizes

---

## Phase 6: TikTok-Style Photo & Story Panel

### Overview
Enhancement to `CityDetailView.tsx` adding a vertical scrolling panel with photo galleries and story content, positioned below the existing city information panel.

### 6.1 Design Architecture

**Panel States:**
- **Peek State** (Default): 80px visible from top, indicating more content
- **Half State**: 50% panel revealed for preview
- **Full State**: Complete panel visible with full content

**Panel Structure:**
```typescript
interface CityStoryPanel {
  photos: CityPhoto[];
  storyText: string;
  isVisible: boolean;
  scrollState: 'peek' | 'half' | 'full';
}
```

### 6.2 Component Architecture

**New Component: `CityStoryPanel.tsx`**
```typescript
import React, { useState, useEffect, useRef } from 'react';
import { City } from '../lib/supabase';

interface CityStoryPanelProps {
  city: City;
  photos: CityPhoto[];
  story?: string;
}

export default function CityStoryPanel({ city, photos, story }: CityStoryPanelProps) {
  const [scrollState, setScrollState] = useState<'peek' | 'half' | 'full'>('peek');
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentTranslate = useRef<number>(0);

  // Transform values for each state
  const transforms = {
    peek: 'calc(100vh - 80px)',     // Show 80px from top
    half: '50vh',                    // Show 50% of viewport
    full: '0px'                      // Show complete panel
  };

  return (
    <div 
      ref={panelRef}
      className="story-panel"
      style={{
        transform: `translateY(${transforms[scrollState]})`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drag Handle */}
      <div className="drag-handle">
        <div className="drag-indicator" />
      </div>

      {/* Content */}
      <div className="story-content">
        {/* Photo Gallery */}
        <PhotoGallery photos={photos} />
        
        {/* Story Text */}
        <div className="story-text">
          <h3>My Experience in {city.name}</h3>
          <p>{story || `Discover the story of my run through ${city.name}...`}</p>
        </div>
      </div>
    </div>
  );
}
```

### 6.3 Photo Gallery Component

**New Component: `PhotoGallery.tsx`**
```typescript
import React, { useState } from 'react';

interface PhotoGalleryProps {
  photos: CityPhoto[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="photo-gallery">
      {/* Photo Container */}
      <div 
        className="photo-container"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {photos.map((photo, index) => (
          <div key={photo.id} className="photo-slide">
            <img 
              src={photo.photo_url} 
              alt={photo.caption || `${city.name} photo ${index + 1}`}
              loading="lazy"
            />
            {photo.caption && (
              <div className="photo-caption">{photo.caption}</div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="photo-navigation">
        {photos.map((_, index) => (
          <button
            key={index}
            className={`nav-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`View photo ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
```

### 6.4 Enhanced CityDetailView Integration

**Update to `CityDetailView.tsx`:**
```typescript
import CityStoryPanel from './CityStoryPanel';

// Add to component state
const [cityPhotos, setCityPhotos] = useState<CityPhoto[]>([]);
const [storyContent, setStoryContent] = useState<string>('');

// Fetch photos and story content
useEffect(() => {
  fetchCityPhotos();
}, [city.id]);

const fetchCityPhotos = async () => {
  const { data } = await supabase
    .from('city_photos')
    .select('*')
    .eq('city_id', city.id)
    .order('created_at');
  
  if (data) setCityPhotos(data);
};

// Add to render return
return (
  <div className="relative w-full h-full">
    {/* Existing map and city info panel... */}
    
    {/* New Story Panel */}
    <CityStoryPanel 
      city={city}
      photos={cityPhotos}
      story={storyContent}
    />
  </div>
);
```

### 6.5 CSS Implementation

**Styling for Story Panel:**
```css
.story-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.98) 100%
  );
  backdrop-filter: blur(20px);
  border-radius: 24px 24px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -20px 40px rgba(0, 0, 0, 0.6);
  z-index: 1100;
  will-change: transform;
}

.drag-handle {
  display: flex;
  justify-content: center;
  padding: 16px 0 8px 0;
  cursor: grab;
}

.drag-indicator {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.story-content {
  padding: 0 24px 24px 24px;
  height: calc(100% - 40px);
  overflow-y: auto;
}

.photo-gallery {
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}

.photo-container {
  display: flex;
  transition: transform 0.3s ease;
}

.photo-slide {
  flex: 0 0 100%;
  position: relative;
}

.photo-slide img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 16px;
}

.photo-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 20px 16px 12px 16px;
  border-radius: 0 0 16px 16px;
  font-size: 14px;
}

.photo-navigation {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.nav-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-dot.active {
  background: #FF8C00;
}

.story-text {
  color: white;
}

.story-text h3 {
  color: #FF8C00;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

.story-text p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  font-size: 16px;
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .story-panel {
    border-radius: 20px 20px 0 0;
  }
  
  .photo-slide img {
    height: 200px;
  }
  
  .story-content {
    padding: 0 20px 20px 20px;
  }
}
```

### 6.6 Touch Gesture Implementation

**Touch Handler Functions:**
```typescript
const handleTouchStart = (e: React.TouchEvent) => {
  setIsDragging(true);
  startY.current = e.touches[0].clientY;
};

const handleTouchMove = (e: React.TouchEvent) => {
  if (!isDragging) return;
  
  const currentY = e.touches[0].clientY;
  const deltaY = currentY - startY.current;
  
  // Calculate new transform based on drag
  const viewportHeight = window.innerHeight;
  let newTranslate;
  
  switch (scrollState) {
    case 'peek':
      newTranslate = Math.max(0, viewportHeight - 80 + deltaY);
      break;
    case 'half':
      newTranslate = Math.max(0, Math.min(viewportHeight - 80, viewportHeight * 0.5 + deltaY));
      break;
    case 'full':
      newTranslate = Math.max(0, deltaY);
      break;
  }
  
  currentTranslate.current = newTranslate;
  
  if (panelRef.current) {
    panelRef.current.style.transform = `translateY(${newTranslate}px)`;
  }
};

const handleTouchEnd = () => {
  setIsDragging(false);
  
  // Determine final state based on position and velocity
  const viewportHeight = window.innerHeight;
  const currentPos = currentTranslate.current;
  
  let newState: 'peek' | 'half' | 'full';
  
  if (currentPos > viewportHeight * 0.75) {
    newState = 'peek';
  } else if (currentPos > viewportHeight * 0.25) {
    newState = 'half';
  } else {
    newState = 'full';
  }
  
  setScrollState(newState);
};
```

### 6.7 Database Updates

**Enhanced city_photos table:**
```sql
ALTER TABLE city_photos ADD COLUMN sort_order INTEGER DEFAULT 0;
ALTER TABLE city_photos ADD COLUMN photo_type VARCHAR(20) DEFAULT 'gallery';

-- Add story content to cities table
ALTER TABLE cities ADD COLUMN story_content TEXT;
```

### 6.8 Implementation Steps

1. **Create Components:**
   - [ ] Create `CityStoryPanel.tsx`
   - [ ] Create `PhotoGallery.tsx`
   - [ ] Add touch gesture handlers

2. **Update CityDetailView:**
   - [ ] Import new components
   - [ ] Add state management for photos and story
   - [ ] Integrate data fetching

3. **Database & Content:**
   - [ ] Update database schema
   - [ ] Add sample photos for testing
   - [ ] Create story content for cities

4. **Styling & Polish:**
   - [ ] Implement CSS animations
   - [ ] Add loading states
   - [ ] Test touch interactions
   - [ ] Optimize for different screen sizes

5. **Testing:**
   - [ ] Test on various mobile devices
   - [ ] Verify smooth scroll performance
   - [ ] Check accessibility features
   - [ ] Validate photo loading

---

## Next Steps

1. **Start with Phase 1** - Set up the basic Astro + React configuration
2. **Configure Supabase** - Create your database and add sample city data
3. **Build the main map** - Get the basic Spain map working with city markers
4. **Add TikTok Panel** - Implement the story panel enhancement
5. **Iterate incrementally** - Add one feature at a time and test thoroughly

This implementation guide provides a solid foundation. Each phase can be completed independently, allowing for incremental development and testing.
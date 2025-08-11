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

## Next Steps

1. **Start with Phase 1** - Set up the basic Astro + React configuration
2. **Configure Supabase** - Create your database and add sample city data
3. **Build the main map** - Get the basic Spain map working with city markers
4. **Iterate incrementally** - Add one feature at a time and test thoroughly

This implementation guide provides a solid foundation. Each phase can be completed independently, allowing for incremental development and testing.
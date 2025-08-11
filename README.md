# 🗺️ My Running Journey Through Spain

## 🧠 Project Concept

A web platform with an **interactive, minimalist, and aesthetic map of Spain**. The purpose is to visualize a personal running journey, highlighting the 50 cities where runs have taken place.

### Key Features:

* **Interactive Map**: A minimalist and functional map of Spain.
* **Numbered Points**: Mark the 50 cities on the map with numbered points in the chronological order of the runs (all info comes from the DB).
* **Detail View**: Selecting a point opens a dedicated view for each city, which includes an enlarged map with the race track, relevant information (date, distance, etc.), and a photo gallery.
* **"Narrative" Mode (Mobile First)**: A vertical scroll experience optimized for mobile that automatically moves through all the cities. Each scroll transitions from one detail view to the next, with the map moving in sync.

---

## 🎨 Design and Style

* **Theme**: Dark Mode.
* **Color Palette**:
    * Background: Black
    * Text: White
    * Accent Color: Orange (`#FF8C00`)
* **Aesthetics**: Minimalist and modern, with subtle gradients for highlighted elements.

---

## 🏗️ Architecture and Data

* **Database**: All information for the 50 cities (coordinates, tracks, photos, info) is stored and fetched from **Supabase**. The Supabase client must be configured to fetch the necessary data.
* **Maps**: **MapLibre** (or another superior alternative if justified) will be used to render the interactive map and race tracks.

---

## 💻 Technology

* **Framework**: **Astro** (v4 or the latest stable version).
* **Interactive Components**: **Astro Islands** with **React** (using **TypeScript**).
* **Languages**: TypeScript for the React component logic.
* **Map Libraries**: MapLibre.

---

## 🛠️ Key Tasks to Accomplish

1.  Set up the Astro project structure.
2.  Integrate and configure React and TypeScript.
3.  Establish the connection with Supabase to fetch data.
4.  Create the main interactive map component with MapLibre.
5.  Develop the city detail view component.
6.  Implement the "Narrative" mode for mobile devices.
7.  Apply the design styles (Dark Mode, colors, gradients).
import React, { useState, useRef } from 'react';
import PhotoGallery from './PhotoGallery';
import type { City } from '../hooks/useMapState';

interface CityPhoto {
  id: string;
  photo_url: string;
  caption?: string;
}

interface CityStoryPanelProps {
  city: City;
  photos: CityPhoto[];
  story?: string;
}

type ScrollState = 'peek' | 'half' | 'full';

export default function CityStoryPanel({ city, photos, story }: CityStoryPanelProps) {
  const [scrollState, setScrollState] = useState<ScrollState>('peek');
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentTranslate = useRef<number>(0);

  // Transform values for each state
  const transforms = {
    peek: 'calc(100vh - 80px)',
    half: '50vh',
    full: '0px'
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
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
    
    const viewportHeight = window.innerHeight;
    const currentPos = currentTranslate.current;
    
    let newState: ScrollState;
    
    if (currentPos > viewportHeight * 0.75) {
      newState = 'peek';
    } else if (currentPos > viewportHeight * 0.25) {
      newState = 'half';
    } else {
      newState = 'full';
    }
    
    setScrollState(newState);
  };

  const handleMouseStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleTouchMove({
      touches: [{ clientY: e.clientY }]
    } as any);
  };

  const handleMouseEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      handleTouchEnd();
    }
  };

  return (
    <div 
      ref={panelRef}
      className="fixed inset-x-0 bottom-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-[2000] rounded-t-3xl shadow-2xl shadow-black/60"
      style={{
        transform: `translateY(${transforms[scrollState]})`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        height: '100vh'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseStart}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={handleMouseEnd}
      onMouseLeave={handleMouseEnd}
    >
      {/* Drag Handle */}
      <div className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing">
        <div className="w-12 h-1.5 bg-white/30 rounded-full" />
      </div>

      {/* Content */}
      <div className="px-6 pb-6 h-full overflow-y-auto">
        {/* Photo Gallery */}
        <div className="mb-6">
          <PhotoGallery photos={photos} cityName={city.name} />
        </div>
        
        {/* Story Text */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">My Experience in {city.name}</h3>
          <p className="text-white/70 leading-relaxed text-lg">
            {story || `Discover the story of my running journey through ${city.name}. Each step through this beautiful city was an adventure, exploring its unique character and discovering new perspectives along the way.`}
          </p>
          
          {/* Additional Info */}
          <div className="flex items-center gap-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5 text-[#FF8C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Run #{city.order_number}</span>
            </div>
            {city.distance_km && (
              <div className="flex items-center gap-2 text-white/80">
                <svg className="w-5 h-5 text-[#FF8C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-medium">{city.distance_km} km</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
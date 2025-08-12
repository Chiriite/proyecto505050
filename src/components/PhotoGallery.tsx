import React, { useState } from 'react';

interface CityPhoto {
  id: string;
  photo_url: string;
  caption?: string;
}

interface PhotoGalleryProps {
  photos: CityPhoto[];
  cityName: string;
}

export default function PhotoGallery({ photos, cityName }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos.length) {
    return (
      <div className="photo-gallery-empty">
        <div className="empty-placeholder">
          <div className="w-full h-48 bg-white/5 rounded-2xl flex items-center justify-center">
            <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-gallery">
      {/* Photo Container */}
      <div className="photo-container-wrapper">
        <div 
          className="photo-container"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        >
          {photos.map((photo, index) => (
            <div key={photo.id} className="photo-slide">
              <img 
                src={photo.photo_url} 
                alt={photo.caption || `${cityName} photo ${index + 1}`}
                className="photo-image"
                loading="lazy"
              />
              {photo.caption && (
                <div className="photo-caption">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      {photos.length > 1 && (
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
      )}
    </div>
  );
}
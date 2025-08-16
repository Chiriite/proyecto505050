import { clsx, type ClassValue } from 'clsx';

// Utility function for combining classes
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Common component style combinations
export const styles = {
  // Glass panels with backdrop blur
  glassPanelDark: 'bg-black/90 border border-primary rounded-xl backdrop-blur-2xl shadow-glow',
  glassPanelLight: 'bg-black/85 border border-primary rounded-2xl backdrop-blur-xl shadow-glow',
  
  // Button styles
  controlButton: 'bg-black/80 border border-primary text-text-primary p-3 rounded-lg backdrop-blur-xl transition-all duration-200 ease-in-out hover:bg-black/90 hover:border-primary-hover hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black',
  
  // Text styles
  heroTitle: 'text-hero-primary text-primary drop-shadow-md',
  heroSubtitle: 'text-hero-secondary text-text-primary',
  statNumber: 'text-stat-number text-primary',
  statLabel: 'text-stat-label text-text-muted uppercase tracking-wider',
  
  // Interactive elements
  cityMarker: 'w-9 h-9 bg-primary text-black border-3 border-text-primary rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition-all duration-300 ease-in-out shadow-glow hover:scale-110 hover:shadow-glow-lg hover:border-primary',
  
  // Layout utilities
  fullScreen: 'w-full h-screen-safe',
  centerContent: 'flex items-center justify-center',
  overlay: 'absolute inset-0',
  
  // Responsive containers
  heroContainer: 'max-w-lg m-8 p-8 pointer-events-auto',
  mobileHeroContainer: 'max-md:m-4 max-md:p-6 max-xs:m-4 max-xs:p-4',
} as const;

// Animation classes
export const animations = {
  fadeIn: 'opacity-0 animate-in fade-in duration-500',
  fadeOut: 'opacity-100 animate-out fade-out duration-500',
  slideInFromTop: 'transform -translate-y-full animate-in slide-in-from-top duration-500',
  spin: 'animate-spin',
  spinSlow: 'animate-spin-slow',
  pulse: 'animate-pulse-soft',
} as const;
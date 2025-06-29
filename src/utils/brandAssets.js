/**
 * Centralized brand assets for consistent usage across the app
 */

// Logo paths
export const BRAND_LOGO = '/Images/Logo 12.png';
export const BRAND_ICON = '/Images/Logo 12.png';

// Brand name
export const BRAND_NAME = 'Byte!';
export const BRAND_TAGLINE = 'Delicious bytes, delivered!';

// Colors (for convenient access in non-Tailwind contexts)
export const BRAND_COLORS = {
  primary: '#990000',   // Brand red
  secondary: '#FFCC00', // Brand yellow
  dark: '#000000',      // Brand black
  light: '#FFFFFF',     // White
};

// App Images
export const APP_IMAGES = {
  hero: '/Images/landing.jpg',
  food1: '/Images/1.jpg',
  food2: '/Images/2.jpg',
  food3: '/Images/3.jpg',
  burger: '/Images/burger.jpg',
  friedChicken: '/Images/fc.jpg',
  jollofRice: '/Images/jr.jpg',
  noodles: '/Images/nk.jpg',
  plantain: '/Images/plantain.jpg',
  poundedYam: '/Images/py.jpg',
  fallbackMeal: '/Images/burger.jpg', // Default meal image
};

// Centralized function to get all brand assets
export const getBrandAssets = () => ({
  logo: BRAND_LOGO,
  icon: BRAND_ICON,
  name: BRAND_NAME,
  tagline: BRAND_TAGLINE,
  colors: BRAND_COLORS,
  images: APP_IMAGES,
  fallbackMealImage: APP_IMAGES.fallbackMeal,
});

// Only run Leaflet configuration on the client side
if (typeof window !== 'undefined') {
  import('leaflet').then((L) => {
    // Fix for default markers in Next.js
    delete (L.default.Icon.Default.prototype as any)._getIconUrl;

    L.default.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  });
}

// Export a dummy function for SSR compatibility
export default function configureLeaflet() {
  // This function will be called on the client side
  if (typeof window !== 'undefined') {
    import('leaflet').then((L) => {
      // Fix for default markers in Next.js
      delete (L.default.Icon.Default.prototype as any)._getIconUrl;

      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }
} 
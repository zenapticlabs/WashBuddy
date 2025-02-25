import { useEffect } from 'react';
import Radar from 'radar-sdk-js';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface RadarMapProps {
  publishableKey: string;
  userId?: string;
}

export function RadarMap({ publishableKey, userId }: RadarMapProps) {
  useEffect(() => {
    // Initialize Radar with your publishable key
    Radar.initialize(publishableKey);
    
    // Initialize the map
    const map = new maplibregl.Map({
      container: 'radar-map',
      style: `https://api.radar.io/maps/styles/radar-default-v1?publishableKey=${publishableKey}`,
      center: [-73.9876, 40.7484], // Default center (you can change this)
      zoom: 12
    });

    // If you have a user ID, you can identify the user
    if (userId) {
      Radar.setUserId(userId);
    }

    // Get the user's location and track it
    Radar.trackOnce().then((result) => {
      if (result.location) {
        const { latitude, longitude } = result.location;
        
        // Center map on user's location
        map.setCenter([longitude, latitude]);
        
        // Add a marker for the user's location
        new maplibregl.Marker()
          .setLngLat([longitude, latitude])
          .addTo(map);
      }
    }).catch((err) => {
      console.error('Error tracking location:', err);
    });

    // Cleanup
    return () => {
      map.remove();
    };
  }, [publishableKey, userId]);

  return (
    <div 
      id="radar-map" 
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
    />
  );
}
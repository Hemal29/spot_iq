import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 23.0225, lng: 72.5714 };

const ParkingMap = ({ parkings = [], center, zoom = 12 }) => {
  const [selected, setSelected] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  const onLoad = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[300px] bg-[#121214] dark:bg-[#121214] rounded-xl flex items-center justify-center">
        <div className="text-center text-[#e7c588]/80">
          <FaMapMarkerAlt className="text-4xl mx-auto mb-2 text-[#e7c588]/80" />
          <p className="text-sm">Map unavailable</p>
          <p className="text-xs text-[#e7c588]/80">Failed to load Google Maps</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[300px] bg-[#121214] dark:bg-[#121214] rounded-xl flex items-center justify-center">
        <FaSpinner className="animate-spin text-primary-600 text-2xl" />
      </div>
    );
  }

  const mapCenter = center || userLocation || (parkings.length > 0
    ? { lat: parkings[0].location?.coordinates?.[1] || defaultCenter.lat, lng: parkings[0].location?.coordinates?.[0] || defaultCenter.lng }
    : defaultCenter
  );

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={zoom}
      onLoad={onLoad}
      options={{ disableDefaultUI: false, zoomControl: true, streetViewControl: false, mapTypeControl: false }}
    >
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
          title="Your location"
        />
      )}

      {parkings.map((p) => {
        if (!p.location?.coordinates) return null;
        const position = { lat: p.location.coordinates[1], lng: p.location.coordinates[0] };
        return (
          <Marker
            key={p._id}
            position={position}
            onClick={() => setSelected(p)}
          />
        );
      })}

      {selected && (
        <InfoWindow
          position={{
            lat: selected.location.coordinates[1],
            lng: selected.location.coordinates[0],
          }}
          onCloseClick={() => setSelected(null)}
        >
          <div className="p-2 max-w-[200px]">
            <h4 className="font-semibold text-[#f9f0d7] text-sm">{selected.name}</h4>
            <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-1">{selected.address}</p>
            <p className="text-primary-600 font-bold text-sm mt-1">${selected.pricePerHour}/hr</p>
            <Link
              to={`/parking/${selected._id}`}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block"
            >
              View Details &rarr;
            </Link>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default ParkingMap;

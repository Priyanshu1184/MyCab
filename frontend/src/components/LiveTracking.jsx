import React, { useState, useEffect } from 'react';
import { LoadScriptNext, GoogleMap, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100vw',
    height: '100vh',
};

const LiveTracking = () => {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [followUser, setFollowUser] = useState(true); // Controls auto-centering

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos = { lat: latitude, lng: longitude };
                    setCurrentPosition(newPos);
                    setMapCenter(newPos); // Initially center the map on the user
                },
                (error) => console.error("Error getting location:", error),
                { enableHighAccuracy: true }
            );

            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos = { lat: latitude, lng: longitude };
                    setCurrentPosition(newPos);
                    console.log("Your Live Location:", position.coords.latitude, position.coords.longitude);
                    if (followUser) setMapCenter(newPos); // Re-center if enabled
                },
                (error) => console.error("Error watching position:", error),
                { enableHighAccuracy: true }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [followUser]); // Re-run if followUser state changes

    return (
        <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter || { lat: 0, lng: 0 }} // Prevent null values
                zoom={15}
                options={{ disableDefaultUI: false }}
            >
                {currentPosition && <Marker position={currentPosition} />}
            </GoogleMap>

            {/* 🔹 Button to Toggle Auto-Follow */}
            <button
                className="fixed bottom-4 right-4 bg-white p-2 rounded shadow-lg"
                onClick={() => setFollowUser((prev) => !prev)}
            >
                {followUser ? "Stop Following" : "Follow Me"}
            </button>
        </LoadScriptNext>
    );
};

export default LiveTracking;

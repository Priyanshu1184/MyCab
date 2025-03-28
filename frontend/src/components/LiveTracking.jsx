import React, { useState, useEffect } from 'react';
import { LoadScriptNext, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import 'remixicon/fonts/remixicon.css';

const containerStyle = {
    width: '100%',
    height: '100%',
};

const mapStyles = [
    {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{ color: "#333333" }]
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#c9eaf9" }]
    },
    {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [{ color: "#f5f5f5" }]
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#ffffff" }]
    },
    {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [{ color: "#fee8be" }]
    }
];

const LiveTracking = ({ pickup, destination, showDirections, mapInteractive, followUser: initialFollowUser, userLocation }) => {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [isFollowingUser, setIsFollowingUser] = useState(initialFollowUser);
    const [directions, setDirections] = useState(null);
    const [map, setMap] = useState(null);
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleMapLoad = (mapInstance) => {
        setMap(mapInstance);
        setIsLoaded(true);
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos = { lat: latitude, lng: longitude };
                    setCurrentPosition(newPos);
                    setMapCenter(newPos);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setError("Unable to get your location");
                },
                { enableHighAccuracy: true }
            );

            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos = { lat: latitude, lng: longitude };
                    setCurrentPosition(newPos);
                    if (isFollowingUser) setMapCenter(newPos);
                },
                (error) => {
                    console.error("Error watching position:", error);
                    setError("Lost location tracking");
                },
                { enableHighAccuracy: true }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [isFollowingUser]);

    useEffect(() => {
        if (userLocation) {
            setCurrentPosition(userLocation);
            if (isFollowingUser) setMapCenter(userLocation);
        }
    }, [userLocation, isFollowingUser]);

    useEffect(() => {
        if (showDirections && pickup && destination && map && window.google) {
            const directionsService = new window.google.maps.DirectionsService();

            directionsService.route(
                {
                    origin: pickup,
                    destination: destination,
                    travelMode: "DRIVING"
                },
                (result, status) => {
                    if (status === "OK") {
                        setDirections(result);
                    } else {
                        console.error("Directions request failed:", status);
                        setError("Unable to get directions");
                    }
                }
            );
        }
    }, [pickup, destination, map, showDirections]);

    return (
        <LoadScriptNext 
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            loadingElement={<div className="h-screen flex items-center justify-center">Loading maps...</div>}
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter || { lat: 20.5937, lng: 78.9629 }}
                zoom={18}
                onLoad={handleMapLoad}
                options={{
                    styles: mapStyles,
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    scaleControl: false,
                    streetViewControl: false,
                    rotateControl: false,
                    fullscreenControl: false,
                    backgroundColor: '#f5f5f5',
                    gestureHandling: mapInteractive ? 'cooperative' : 'none',
                    clickableIcons: mapInteractive
                }}
            >
                {currentPosition && isLoaded && (
                    <Marker
                        position={currentPosition}
                        icon={{
                            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                            scaledSize: map ? new google.maps.Size(40, 40) : null,
                            origin: map ? new google.maps.Point(0, 0) : null,
                            anchor: map ? new google.maps.Point(20, 20) : null
                        }}
                    />
                )}

                {directions && showDirections && isLoaded && (
                    <DirectionsRenderer
                        directions={directions}
                        options={{
                            polylineOptions: {
                                strokeWeight: 6, // Thicker line
                                strokeColor: '#5DAAE0' // Light blue color
                            },
                            markerOptions: {
                                visible: true
                            }
                        }}
                    />
                )}
            </GoogleMap>

            <button
                className={`fixed bottom-4 right-4 px-4 py-2 rounded-full shadow-lg transition-all duration-300
                    ${isFollowingUser 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                onClick={() => setIsFollowingUser(prev => !prev)}
            >
                <div className="flex items-center gap-2">
                    <i className={`ri-${isFollowingUser ? 'GPS-line' : 'GPS-off-line'}`}></i>
                    {isFollowingUser ? "Live Tracking" : "Track Me"}
                </div>
            </button>

            {error && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 px-4 py-2 rounded-lg shadow-lg">
                    {error}
                </div>
            )}
        </LoadScriptNext>
    );
};

export default LiveTracking;
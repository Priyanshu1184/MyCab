import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScriptNext, Marker, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
    width: '100vw',
    height: '100vh',
};

const CaptainTracking = ({ ride, setTrackingPanel, setConfirmRidePopupPanel }) => {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [directions, setDirections] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos = { lat: latitude, lng: longitude };
                    setCurrentPosition(newPos);
                },
                (error) => console.error("Error getting location:", error),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    useEffect(() => {
        if (currentPosition && ride?.pickup) {
            const directionsService = new google.maps.DirectionsService();
            const destination = ride?.started ? ride.destination : ride.pickup;
            console.log("Destination:", destination);
            console.log("Current Location:", currentPosition);

            directionsService.route(
                {
                    origin: currentPosition,
                    destination: destination,
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    console.log("Directions Result:", result);
                    if (status === google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                    } else {
                        console.error("Error fetching directions:", status);
                    }
                }
            );
        }
    }, [currentPosition, ride]);

    return (
        <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={currentPosition || { lat: 0, lng: 0 }}
                zoom={15}
                options={{ disableDefaultUI: false }}
            >
                {currentPosition && <Marker position={currentPosition} />}
                {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
        </LoadScriptNext>
    );
};

export default CaptainTracking;
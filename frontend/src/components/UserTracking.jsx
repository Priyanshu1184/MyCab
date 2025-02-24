import React, { useState, useEffect, useContext } from 'react';
import { LoadScriptNext, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { SocketContext } from '../context/SocketContext';

const containerStyle = {
    width: '100vw',
    height: '100vh',
};

const UserTracking = ({ ride }) => {
    const [captainLocation, setCaptainLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [directions, setDirections] = useState(null);
    const { socket } = useContext(SocketContext);

    useEffect(() => {
        // Listen for captain's location updates
        socket.on('captain-location-update', (location) => {
            setCaptainLocation(location);
            setMapCenter(location);
        });

        // Listen for ride start event
        socket.on('ride-started', () => {
            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: captainLocation,
                    destination: ride.destination,
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                    } else {
                        console.error("Error fetching directions:", status);
                    }
                }
            );
        });

        return () => {
            socket.off('captain-location-update');
            socket.off('ride-started');
        };
    }, [socket, captainLocation, ride]);

    return (
        <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter || { lat: 0, lng: 0 }}
                zoom={15}
                options={{ disableDefaultUI: false }}
            >
                {captainLocation && <Marker position={captainLocation} />}
                {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
        </LoadScriptNext>
    );
};

export default UserTracking;

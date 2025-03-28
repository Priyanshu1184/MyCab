import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';

const containerStyle = {
    width: '100vw',
    height: '100vh',
};

const CaptainTracking = ({ ride, setTrackingPanel, setConfirmRidePopupPanel }) => {
    const [currentPosition, setCurrentPosition] = useState(null); // Driver's current location
    const [directions, setDirections] = useState(null);

    // Function to fetch the driver's current location from the backend
    const fetchDriverLocation = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/captains/current-location`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
    
            const { latitude, longitude } = response.data;
            setCurrentPosition({ lat: latitude, lng: longitude });
        } catch (error) {
            console.error('Error fetching driver location:', error);
        }
    };
    // Fetch the driver's location periodically
    useEffect(() => {
        fetchDriverLocation(); // Fetch initially

        // Poll every 5 seconds
        const interval = setInterval(() => {
            fetchDriverLocation();
        }, 5000);

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    // Fetch directions when the current position or ride details change
    useEffect(() => {
        const fetchDirections = () => {
            if (currentPosition && ride?.pickup) {
                const directionsService = new google.maps.DirectionsService();
                const destination = ride?.started ? ride.destination : ride.pickup;

                directionsService.route(
                    {
                        origin: currentPosition,
                        destination: destination,
                        travelMode: google.maps.TravelMode.DRIVING,
                    },
                    (result, status) => {
                        if (status === google.maps.DirectionsStatus.OK) {
                            setDirections(result);
                        } else {
                            console.error('Error fetching directions:', status);
                        }
                    }
                );
            }
        };

        fetchDirections();
    }, [currentPosition, ride]);

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentPosition || { lat: 0, lng: 0 }} // Default to (0, 0) if location is not yet available
            zoom={15}
            options={{ disableDefaultUI: false }}
        >
            {currentPosition && <Marker position={currentPosition} />}
            {directions && <DirectionsRenderer directions={directions} />}
            <button
                onClick={() => {
                    setTrackingPanel(false);
                    setConfirmRidePopupPanel(true);
                }}
                className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white p-3 rounded-lg"
            >
                Confirm Arrival
            </button>
        </GoogleMap>
    );
};

export default CaptainTracking;
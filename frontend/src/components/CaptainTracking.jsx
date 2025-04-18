import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScriptNext, Marker, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';

const CaptainTracking = ({ ride, setTrackingPanel, setConfirmRidePopupPanel }) => {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [previousPosition, setPreviousPosition] = useState(null);
    const [directions, setDirections] = useState(null);
    const [map, setMap] = useState(null);
    const [bearing, setBearing] = useState(0);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [destinationLocation, setDestinationLocation] = useState(null);
    const [pickupLocation, setPickupLocation] = useState(null);

    const fetchDriverLocation = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/captains/current-location`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const { latitude, longitude } = response.data;
            const newPosition = { lat: latitude, lng: longitude };
            
            if (previousPosition) {
                setBearing(calculateBearing(previousPosition, newPosition));
            }
            
            setPreviousPosition(currentPosition || newPosition);
            setCurrentPosition(newPosition);
        } catch (error) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                    if (previousPosition) {
                        setBearing(calculateBearing(previousPosition, pos));
                    }
                    setPreviousPosition(currentPosition || pos);
                    setCurrentPosition(pos);
                },
                (error) => console.error('Error getting location:', error)
            );
        }
    };

    const geocodeAddress = (address) => {
        return new Promise((resolve, reject) => {
            if (!window.google?.maps) return reject("Google Maps API not loaded");
            
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address }, (results, status) => {
                status === window.google.maps.GeocoderStatus.OK 
                    ? resolve(results[0].geometry.location)
                    : reject(`Geocode failed: ${status}`);
            });
        });
    };
    
    const calculateBearing = (start, end) => {
        const toRad = deg => deg * Math.PI / 180;
        const startLat = toRad(start.lat), startLng = toRad(start.lng);
        const endLat = toRad(end.lat), endLng = toRad(end.lng);
        
        const y = Math.sin(endLng - startLng) * Math.cos(endLat);
        const x = Math.cos(startLat) * Math.sin(endLat) -
                Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
        
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    };
    
    useEffect(() => {
        fetchDriverLocation();
        const interval = setInterval(fetchDriverLocation, 5000);
        return () => clearInterval(interval);
    }, []);
    
    useEffect(() => {
        if (!window.google?.maps || !ride?.pickup || !ride?.destination) return;
        
        (async () => {
            try {
                setPickupLocation(await geocodeAddress(ride.pickup));
                setDestinationLocation(await geocodeAddress(ride.destination));
            } catch (error) {
                console.error('Error geocoding:', error);
            }
        })();
    }, [ride, isMapLoaded]);

    useEffect(() => {
        if (!window.google?.maps || !currentPosition || !map) return;
        
        const destination = (ride?.started && destinationLocation) ? destinationLocation : pickupLocation;
        if (!destination) return;

        new window.google.maps.DirectionsService().route(
            {
                origin: currentPosition,
                destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    setIsMapLoaded(true);
                    
                    const bounds = new window.google.maps.LatLngBounds();
                    bounds.extend(currentPosition);
                    bounds.extend(destination);
                    map.fitBounds(bounds);
                }
            }
        );
    }, [currentPosition, ride, pickupLocation, destinationLocation, map]);

    const mapStyles = [
        { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "on" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
        { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#dadada" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9eaf9" }] }
    ];

    return (
        <div className="relative w-full h-full">
            <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={{ width: '100vw', height: '100vh' }}
                    center={currentPosition || { lat: 20.5937, lng: 78.9629 }}
                    zoom={15}
                    options={{ 
                        zoomControl: false, heading: bearing, styles: mapStyles,
                        mapTypeControl: true, streetViewControl: true, fullscreenControl: true
                    }}
                    onLoad={(mapInstance) => {
                        setMap(mapInstance);
                        setIsMapLoaded(true);
                    }}
                >
                    {directions && (
                        <DirectionsRenderer 
                            directions={directions}
                            options={{
                                suppressMarkers: true,
                                polylineOptions: { strokeColor: '#4285F4', strokeWeight: 5, strokeOpacity: 0.8 }
                            }}
                        />
                    )}
                    
                    {currentPosition && (
                        <Marker
                            position={currentPosition}
                            icon={{
                                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                scale: 6, fillColor: "#4285F4", fillOpacity: 1,
                                strokeColor: "#FFFFFF", strokeWeight: 2, rotation: bearing
                            }}
                        />
                    )}
                    
                    {pickupLocation && !ride?.started && (
                        <Marker
                            position={pickupLocation}
                            icon={{
                                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                                scaledSize: new window.google.maps.Size(40, 40)
                            }}
                            label={{ text: "Pickup", color: "#FFFFFF", fontWeight: "bold", fontSize: "12px" }}
                        />
                    )}
                    
                    {destinationLocation && (
                        <Marker
                            position={destinationLocation}
                            icon={{
                                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                                scaledSize: new window.google.maps.Size(40, 40)
                            }}
                            label={{ text: "Destination", color: "#FFFFFF", fontWeight: "bold", fontSize: "12px" }}
                        />
                    )}
                </GoogleMap>
            </LoadScriptNext>
            
            <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-10">
                <button className="bg-white p-2 rounded-full shadow-lg text-gray-700 hover:bg-gray-100"
                    onClick={() => map?.setZoom(map.getZoom() + 1)}>
                    <i className="ri-zoom-in-line text-xl"></i>
                </button>
                <button className="bg-white p-2 rounded-full shadow-lg text-gray-700 hover:bg-gray-100"
                    onClick={() => map?.setZoom(map.getZoom() - 1)}>
                    <i className="ri-zoom-out-line text-xl"></i>
                </button>
                <button className="bg-white p-2 rounded-full shadow-lg text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                        if (!map || !currentPosition) return;
                        const bounds = new window.google.maps.LatLngBounds();
                        bounds.extend(currentPosition);
                        bounds.extend((ride?.started && destinationLocation) ? destinationLocation : pickupLocation);
                        map.fitBounds(bounds);
                    }}>
                    <i className="ri-focus-3-line text-xl"></i>
                </button>
            </div>
            
            <button
                onClick={() => {setTrackingPanel(false); setConfirmRidePopupPanel(true);}}
                className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white p-3 px-6 rounded-lg shadow-lg z-10 font-semibold hover:bg-green-700 transition-colors"
            >
                Confirm Arrival
            </button>
            
            {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
        </div>
    );
};

export default CaptainTracking;
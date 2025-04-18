import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FinishRide from '../components/FinishRide';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import { getDistance } from 'geolib';
import { LoadScriptNext, GoogleMap, Marker, Polyline, DirectionsRenderer } from '@react-google-maps/api';
import 'remixicon/fonts/remixicon.css';

const containerStyle = {
    width: '100%',
    height: '100%',
};

const CaptainRiding = () => {
    const [finishRidePanel, setFinishRidePanel] = useState(false);
    const [distance, setDistance] = useState(null);
    const [error, setError] = useState(null);
    const finishRidePanelRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const rideData = location.state?.ride;
    const [map, setMap] = useState(null);
    
    // Map related states
    const [currentPosition, setCurrentPosition] = useState(null);
    const [destinationLocation, setDestinationLocation] = useState(null);
    const [pickupLocation, setPickupLocation] = useState(null);
    const [directions, setDirections] = useState(null);
    const [bearing, setBearing] = useState(0);
    const [previousPosition, setPreviousPosition] = useState(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Get current location and calculate distance
    useEffect(() => {
        const geocodeAddress = async (address) => {
            try {
                const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                    params: {
                        address: address,
                        key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                    }
                });
                if (response.data.results.length > 0) {
                    const location = response.data.results[0].geometry.location;
                    return {
                        lat: location.lat,
                        lng: location.lng
                    };
                }
                return null;
            } catch (error) {
                console.error('Geocoding error:', error);
                setError('Failed to get location coordinates');
                return null;
            }
        };

        const calculateDistanceAndLocations = async () => {
            if (rideData?.pickup && rideData?.destination) {
                try {
                    const pickupLoc = await geocodeAddress(rideData.pickup);
                    const destinationLoc = await geocodeAddress(rideData.destination);

                    if (pickupLoc && destinationLoc) {
                        setPickupLocation(pickupLoc);
                        setDestinationLocation(destinationLoc);
                        
                        const distanceInMeters = getDistance(
                            { latitude: pickupLoc.lat, longitude: pickupLoc.lng },
                            { latitude: destinationLoc.lat, longitude: destinationLoc.lng }
                        );
                        
                        const distanceInKm = (distanceInMeters / 1000).toFixed(2);
                        setDistance(distanceInKm);
                        setError(null);
                    } else {
                        throw new Error('Could not determine locations');
                    }
                } catch (error) {
                    console.error('Error calculating distance:', error);
                    setError('Failed to calculate distance');
                }
            }
        };

        calculateDistanceAndLocations();

        // Get initial current location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const pos = { lat: latitude, lng: longitude };
                setCurrentPosition(pos);
                setPreviousPosition(pos);
            },
            (error) => {
                console.error('Error getting current location:', error);
                setError('Failed to get your location');
            },
            { enableHighAccuracy: true }
        );

        // Watch for position changes
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newPos = { lat: latitude, lng: longitude };
                
                // Calculate bearing if we have previous position
                if (previousPosition) {
                    const newBearing = calculateBearing(previousPosition, newPos);
                    setBearing(newBearing);
                }
                
                setPreviousPosition(newPos);
                setCurrentPosition(newPos);
            },
            (error) => {
                console.error('Error watching position:', error);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [rideData]);

    // Update directions when locations change
    useEffect(() => {
        if (!map || !currentPosition || !destinationLocation) return;
        
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: currentPosition,
                destination: destinationLocation,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    setIsMapLoaded(true);
                    
                    // Fit bounds
                    const bounds = new window.google.maps.LatLngBounds();
                    bounds.extend(currentPosition);
                    bounds.extend(destinationLocation);
                    map.fitBounds(bounds);
                } else {
                    console.error('Error fetching directions:', status);
                }
            }
        );
    }, [map, currentPosition, destinationLocation]);

    // Calculate bearing between two points
    const calculateBearing = (start, end) => {
        const startLat = start.lat * Math.PI / 180;
        const startLng = start.lng * Math.PI / 180;
        const endLat = end.lat * Math.PI / 180;
        const endLng = end.lng * Math.PI / 180;
        
        const y = Math.sin(endLng - startLng) * Math.cos(endLat);
        const x = Math.cos(startLat) * Math.sin(endLat) -
                Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
        
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        bearing = (bearing + 360) % 360;
        
        return bearing;
    };

    useGSAP(() => {
        if (finishRidePanel) {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(0)',
                duration: 0.5,
                ease: 'power2.out'
            });
        } else {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(100%)',
                duration: 0.5,
                ease: 'power2.in'
            });
        }
    }, [finishRidePanel]);

    const handleCompleteRide = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        setFinishRidePanel(true);
    };

    const handleZoomIn = () => {
        if (map) map.setZoom(map.getZoom() + 1);
    };

    const handleZoomOut = () => {
        if (map) map.setZoom(map.getZoom() - 1);
    };

    const handleResetView = () => {
        if (map && currentPosition && destinationLocation) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(currentPosition);
            bounds.extend(destinationLocation);
            map.fitBounds(bounds);
        }
    };

    return (
        <div className='h-screen relative flex flex-col justify-end'>
            {/* Header */}
            <div className='fixed p-6 top-0 flex items-center justify-between w-screen z-10'>
                <Link 
                    to='/captain-home' 
                    className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-100'
                >
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>

            {/* Map Container */}
            <div className='h-screen fixed w-screen top-0 z-0 relative'>
                <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={currentPosition || { lat: 20.5937, lng: 78.9629 }}
                        zoom={16}
                        options={{ 
                            disableDefaultUI: false,
                            zoomControl: false, // We'll use custom controls
                            mapTypeControl: true,
                            streetViewControl: true,
                            fullscreenControl: true,
                            heading: bearing, // Rotate map based on movement
                            styles: [
                                { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
                                { elementType: "labels.icon", stylers: [{ visibility: "on" }] },
                                { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
                                { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
                                { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
                                { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#dadada" }] },
                                { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
                                { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9eaf9" }] }
                            ]
                        }}
                        onLoad={(mapInstance) => setMap(mapInstance)}
                    >
                        {directions && (
                            <DirectionsRenderer 
                                directions={directions}
                                options={{
                                    suppressMarkers: true, // Hide default markers
                                    polylineOptions: {
                                        strokeColor: '#4285F4',
                                        strokeWeight: 5,
                                        strokeOpacity: 0.8,
                                    }
                                }}
                            />
                        )}
                        
                        {/* Current position marker with direction arrow */}
                        {currentPosition && (
                            <Marker
                                position={currentPosition}
                                icon={{
                                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                    scale: 6,
                                    fillColor: "#4285F4",
                                    fillOpacity: 1,
                                    strokeColor: "#FFFFFF",
                                    strokeWeight: 2,
                                    rotation: bearing // Rotate based on movement direction
                                }}
                            />
                        )}
                        
                        {/* Destination marker */}
                        {destinationLocation && (
                            <Marker
                                position={destinationLocation}
                                icon={{
                                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                                    scaledSize: new window.google.maps.Size(40, 40)
                                }}
                                label={{
                                    text: "Destination",
                                    color: "#FFFFFF",
                                    fontWeight: "bold",
                                    fontSize: "12px"
                                }}
                            />
                        )}
                        
                        {/* Pickup marker if needed */}
                        {pickupLocation && (
                            <Marker
                                position={pickupLocation}
                                icon={{
                                    url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                                    scaledSize: new window.google.maps.Size(40, 40)
                                }}
                                label={{
                                    text: "Pickup",
                                    color: "#FFFFFF",
                                    fontWeight: "bold",
                                    fontSize: "12px"
                                }}
                            />
                        )}
                    </GoogleMap>
                </LoadScriptNext>
                
                {/* Custom zoom controls */}
                <div className="absolute bottom-20 right-4 flex flex-col gap-2">
                    <button 
                        className="bg-white p-2 rounded-full shadow-lg text-gray-700 hover:bg-gray-100"
                        onClick={handleZoomIn}
                    >
                        <i className="ri-zoom-in-line text-xl"></i>
                    </button>
                    <button 
                        className="bg-white p-2 rounded-full shadow-lg text-gray-700 hover:bg-gray-100"
                        onClick={handleZoomOut}
                    >
                        <i className="ri-zoom-out-line text-xl"></i>
                    </button>
                    <button 
                        className="bg-white p-2 rounded-full shadow-lg text-gray-700 hover:bg-gray-100"
                        onClick={handleResetView}
                    >
                        <i className="ri-focus-3-line text-xl"></i>
                    </button>
                </div>
                
                {!isMapLoaded && currentPosition && destinationLocation && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>

            {/* Bottom Panel */}
            <div 
                className='h-1/5 p-6 flex items-center justify-between relative bg-yellow-400 pt-10 z-10'
            >
                <h5 className='p-1 text-center w-[90%] absolute top-0'>
                    <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
                </h5>
                <div>
                    <h4 className='text-xl font-semibold'>
                        {error ? 'Error calculating distance' : 
                         distance ? `${distance} KM` : 'Calculating...'}
                    </h4>
                    {error && <p className='text-red-600 text-sm mt-1'>{error}</p>}
                </div>
                <button 
                    className='bg-green-600 text-white font-semibold p-3 px-10 rounded-lg hover:bg-green-700 transition-colors'
                    onClick={handleCompleteRide}
                >
                    Complete Ride
                </button>
            </div>

            {/* Finish Ride Panel */}
            <div 
                ref={finishRidePanelRef} 
                className='fixed w-full z-[500] bottom-0 translate-y-full bg-white px-3 py-10 pt-12 shadow-lg'
            >
                <FinishRide
                    ride={rideData}
                    distance={distance}
                    setFinishRidePanel={setFinishRidePanel}
                />
            </div>
        </div>
    );
};

export default CaptainRiding;
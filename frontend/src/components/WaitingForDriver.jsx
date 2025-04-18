import React, { useState, useEffect } from 'react';
import { LoadScriptNext, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';
import './Waiting.css';

const containerStyle = {
    width: '100%',
    height: '100%',
};

const WaitingForDriver = (props) => {
    const navigate = useNavigate();
    const [captainLocation, setCaptainLocation] = useState(null);
    const [directions, setDirections] = useState(null);
    const [map, setMap] = useState(null);

    const handleCancelRide = () => {
        window.location.href = '/home';
    };

    useEffect(() => {
        console.log('Ride:', props.ride);
        console.log('Captain:', props.ride?.captain?.location);
    
        if (!props.ride?.captain?.location || !props.ride?.pickup) {
            console.warn("Missing captain location or pickup location!");
            return;
        }
    
        let { ltd, lng } = props.ride.captain.location;  // Extracting ltd instead of lat
    
        if (typeof ltd !== 'number' || typeof lng !== 'number') {
            console.error("Invalid captain location:", props.ride.captain.location);
            return;
        }
    
        const captainLocation = { lat: ltd, lng };  // ✅ Fix key name from ltd → lat
        setCaptainLocation(captainLocation);
    
        if (window.google && window.google.maps) {
            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: captainLocation,
                    destination: props.ride.pickup,
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
        } else {
            console.error("Google Maps API is not loaded yet.");
        }
    }, [props.ride]);  
     // ✅ Dependency updated

    return (
        <div className="waiting-container flex">
            <div className="waiting-for-driver p-4 w-1/3 mt-8">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mb-4"></div>
                    <h2 className="text-xl font-semibold mb-2">Waiting for your driver</h2>
                    <p className="text-gray-600 text-center">Please wait while your driver arrives</p>

                    {/* Driver Details */}
                    {props.ride?.captain && (
                        <div className="w-full mt-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <img
                                    className='h-16 w-16 rounded-full object-cover'
                                    src={props.ride.captain.profileImage || "https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"}
                                    alt="Captain"
                                />
                                <div>
                                    <h4 className="font-medium">{props.ride.captain.fullname.firstname} {props.ride.captain.fullname.lastname}</h4>
                                    <p className="text-sm text-gray-600">Car: {props.ride.captain.vehicleModel} : {props.ride?.captain?.vehicle?.plate}</p>
                                    <p className="text-sm text-gray-600">OTP: {props.ride.otp}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ride Details */}
                    {props.ride && (
                        <div className="w-full mt-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <i className="ri-map-pin-user-fill text-gray-600"></i>
                                <div>
                                    <h4 className="font-medium">Pickup Location</h4>
                                    <p className="text-sm text-gray-600">{props.ride.pickup}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <i className="ri-map-pin-2-fill text-gray-600"></i>
                                <div>
                                    <h4 className="font-medium">Destination</h4>
                                    <p className="text-sm text-gray-600">{props.ride.destination}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <i className="ri-taxi-fill text-gray-600"></i>
                                <div>
                                    <h4 className="font-medium">Vehicle Type</h4>
                                    <p className="text-sm text-gray-600">{props.ride.vehicleType || 'Standard'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <i className="ri-money-dollar-circle-fill text-gray-600"></i>
                                <div>
                                    <h4 className="font-medium">Estimated Fare</h4>
                                    <p className="text-sm text-gray-600">₹{props.ride.fare}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cancel Button */}
                <button
                    onClick={handleCancelRide}
                    className="w-full mt-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    Cancel Ride
                </button>
            </div>

            {/* Map Section */}
            <div className="map-container w-2/3 relative">
                <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={captainLocation || { lat: 20.2961, lng: 85.8245 }}
                        zoom={15}
                        options={{ 
                            disableDefaultUI: false,
                            zoomControl: true,
                            mapTypeControl: true,
                            streetViewControl: true,
                            fullscreenControl: true,
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
                        
                        {/* Captain location marker with arrow */}
                        {captainLocation && (
                            <Marker
                                position={captainLocation}
                                icon={{
                                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                    scale: 6,
                                    fillColor: "#4285F4",
                                    fillOpacity: 1,
                                    strokeColor: "#FFFFFF",
                                    strokeWeight: 2,
                                    rotation: 0 // Upward direction
                                }}
                                label={{
                                    text: "Driver",
                                    color: "#FFFFFF",
                                    fontWeight: "bold",
                                    fontSize: "12px",
                                    className: "marker-label"
                                }}
                            />
                        )}
                        
                        {/* Pickup location marker */}
                        {directions && directions.routes && directions.routes[0] && (
                            <Marker
                                position={directions.routes[0].legs[0].end_location}
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
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <button 
                        className="bg-white p-2 rounded-full shadow-lg text-gray-700"
                        onClick={() => map && map.setZoom(map.getZoom() + 1)}
                    >
                        <i className="ri-zoom-in-line text-xl"></i>
                    </button>
                    <button 
                        className="bg-white p-2 rounded-full shadow-lg text-gray-700"
                        onClick={() => map && map.setZoom(map.getZoom() - 1)}
                    >
                        <i className="ri-zoom-out-line text-xl"></i>
                    </button>
                    <button 
                        className="bg-white p-2 rounded-full shadow-lg text-gray-700"
                        onClick={() => {
                            if (map && captainLocation && directions && directions.routes && directions.routes[0]) {
                                const bounds = new window.google.maps.LatLngBounds();
                                bounds.extend(captainLocation);
                                bounds.extend(directions.routes[0].legs[0].end_location);
                                map.fitBounds(bounds);
                            }
                        }}
                    >
                        <i className="ri-focus-3-line text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WaitingForDriver;

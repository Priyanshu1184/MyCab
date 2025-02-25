import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { GoogleMap, LoadScriptNext, DirectionsRenderer } from '@react-google-maps/api';
import 'remixicon/fonts/remixicon.css';
import './UserTracking.css';

const containerStyle = {
    width: '100%',
    height: '100%',
};

const UserTracking = ({ ride, captainLocation, setRideStarted }) => {
    const navigate = useNavigate();
    const [directions, setDirections] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

    const handleFinishRide = () => {
        setRideStarted(false);
        navigate('/home');
        window.location.reload();
    };

    const geocodeAddress = (address) => {
        return new Promise((resolve, reject) => {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address: address }, (results, status) => {
                if (status === window.google.maps.GeocoderStatus.OK) {
                    resolve(results[0].geometry.location);
                } else {
                    reject(`Geocode was not successful for the following reason: ${status}`);
                }
            });
        });
    };

    useEffect(() => {
        const initializeMap = async () => {
            if (ride) {
                console.log('Ride:', ride);
                try {
                    const pickupLocation = await geocodeAddress(ride.pickup);
                    const destinationLocation = await geocodeAddress(ride.destination);

                    const directionsService = new window.google.maps.DirectionsService();

                    directionsService.route(
                        {
                            origin: pickupLocation,
                            destination: destinationLocation,
                            travelMode: window.google.maps.TravelMode.DRIVING,
                        },
                        (result, status) => {
                            if (status === window.google.maps.DirectionsStatus.OK) {
                                setDirections(result);
                                setMapCenter(pickupLocation);
                            } else {
                                console.error(`Error fetching directions ${result}`);
                            }
                        }
                    );
                } catch (error) {
                    console.error(error);
                }
            }
        };

        initializeMap();
    }, [ride]);

    if (!ride) {
        return <div>Loading...</div>; // or any other fallback UI
    }

    return (
        <div className="user-tracking-container flex h-screen">
            <div className="user-tracking-panel p-4 w-[25%] mt-8">
                <h3 className='text-2xl font-semibold mb-2'>Your Ride</h3>
                
                <div className='flex items-center justify-between p-2 border-2 border-yellow-400 rounded-lg'>
                    <div className='flex items-center gap-3'>
                        <img 
                            className='h-12 w-12 rounded-full object-cover' 
                            src={ride?.captain?.profileImage || "https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"} 
                            alt="Captain" 
                        />
                        <div>
                            <h2 className='text-lg font-medium'>{ride?.captain?.fullname?.firstname || 'Captain'}</h2>
                            <p className='text-sm text-gray-600'>{ride?.captain?.vehicleNumber}</p>
                        </div>
                    </div>
                    <button 
                        className='h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center'
                        onClick={() => window.location.href = `tel:${ride?.captain?.phone}`}
                    >
                        <i className="text-xl ri-phone-fill"></i>
                    </button>
                </div>

                <div className='flex gap-2 justify-between flex-col items-center mt-4'>
                    <div className='w-full'>
                        <div className='flex items-center gap-3 p-3 border-b-2'>
                            <i className="ri-map-pin-user-fill"></i>
                            <div>
                                <h3 className='text-lg font-medium'>Pickup Location</h3>
                                <p className='text-sm text-gray-600'>{ride?.pickup}</p>
                            </div>
                        </div>
                        
                        <div className='flex items-center gap-3 p-3 border-b-2'>
                            <i className="text-lg ri-map-pin-2-fill"></i>
                            <div>
                                <h3 className='text-lg font-medium'>Destination</h3>
                                <p className='text-sm text-gray-600'>{ride?.destination}</p>
                            </div>
                        </div>
                        
                        <div className='flex items-center gap-3 p-3'>
                            <i className="ri-currency-line"></i>
                            <div>
                                <h3 className='text-lg font-medium'>₹{ride?.fare}</h3>
                                <p className='text-sm text-gray-600'>Cash Payment</p>
                            </div>
                        </div>
                        <div className='flex items-center justify-center mt-4'>
                            <button 
                                className='bg-blue-500 text-white px-4 py-2 rounded-lg'
                                onClick={handleFinishRide}
                            >
                                Finish Ride
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="map-container w-[75%] h-full relative">
                <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={mapCenter}
                        zoom={15}
                        options={{ disableDefaultUI: false }}
                    >
                        {directions && <DirectionsRenderer directions={directions} />}
                    </GoogleMap>
                </LoadScriptNext>
            </div>
        </div>
    );
};

UserTracking.propTypes = {
    ride: PropTypes.object,
    captainLocation: PropTypes.object,
    setRideStarted: PropTypes.func.isRequired
};

export default UserTracking;
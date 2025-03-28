import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FinishRide from '../components/FinishRide';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import LiveTracking from '../components/LiveTracking';
import axios from 'axios';
import { getDistance } from 'geolib';

const CaptainRiding = () => {
    const [finishRidePanel, setFinishRidePanel] = useState(false);
    const [distance, setDistance] = useState(null);
    const [error, setError] = useState(null);
    const finishRidePanelRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const rideData = location.state?.ride;

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
                        latitude: location.lat,
                        longitude: location.lng
                    };
                }
                return null;
            } catch (error) {
                console.error('Geocoding error:', error);
                setError('Failed to get location coordinates');
                return null;
            }
        };

        const calculateDistance = async () => {
            if (rideData?.pickup && rideData?.destination) {
                try {
                    const pickupLocation = await geocodeAddress(rideData.pickup);
                    const destinationLocation = await geocodeAddress(rideData.destination);

                    if (pickupLocation && destinationLocation) {
                        const distanceInMeters = getDistance(pickupLocation, destinationLocation);
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

        calculateDistance();
    }, [rideData]);

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
            <div className='h-screen fixed w-screen top-0 z-0'>
                <LiveTracking 
                    pickup={rideData?.pickup}
                    destination={rideData?.destination}
                    showDirections={true}
                    mapInteractive={true}
                    followUser={false}
                />
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
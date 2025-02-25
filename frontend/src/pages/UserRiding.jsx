import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import LiveTracking from '../components/LiveTracking';
import axios from 'axios';
import { getDistance } from 'geolib';

const UserRiding = () => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [error, setError] = useState(null);
    const location = useLocation();
    const rideData = location.state?.ride;

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setError('Unable to get your location');
                },
                { enableHighAccuracy: true }
            );
        }
    }, []);

    return (
        <div className='h-screen relative flex flex-col justify-end'>
            <div className='fixed p-6 top-0 flex items-center justify-between w-screen z-10'>
                <img 
                    className='w-16' 
                    src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" 
                    alt="Logo" 
                />
                <Link 
                    to='/' 
                    className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-100'
                >
                    <i className="text-lg font-medium ri-close-line"></i>
                </Link>
            </div>

            <div className='h-screen fixed w-screen top-0 z-0'>
                <LiveTracking 
                    pickup={rideData?.pickup}
                    destination={rideData?.destination}
                    showDirections={true}
                    mapInteractive={true}
                    followUser={true}
                    userLocation={currentLocation}
                />
            </div>

            <div className='h-1/5 p-6 flex items-center justify-between relative bg-yellow-400 pt-10 z-10'>
                <h5 className='p-1 text-center w-[90%] absolute top-0'>
                    <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
                </h5>
                <div>
                    <h4 className='text-xl font-semibold'>
                        {error ? 'Error calculating ETA' : 
                         distance ? `${distance} mins away` : 'Calculating...'}
                    </h4>
                    <p className='text-sm text-gray-700'>Captain is on the way</p>
                </div>
                <div className='text-right'>
                    <h3 className='text-xl font-semibold'>₹{rideData?.fare}</h3>
                    <p className='text-sm text-gray-700'>Estimated fare</p>
                </div>
            </div>
        </div>
    );
};

export default UserRiding;
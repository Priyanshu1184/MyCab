import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getDistance } from 'geolib';
import 'remixicon/fonts/remixicon.css';

const FinishRide = (props) => {
    const [distance, setDistance] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(''); // Track payment status
    const [rideCompleted, setRideCompleted] = useState(false); // Track ride completion
    const navigate = useNavigate();

    // Fetch ride details periodically
    useEffect(() => {
        const fetchRideDetails = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/rides/details/${props.ride._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
                const ride = response.data.ride;
                console.log('Fetched Ride Details:', ride); // Debug log
                setPaymentStatus(ride.paymentStatus); // Update payment status
            } catch (error) {
                console.error('Error fetching ride details:', error);
                setError('Unable to fetch ride details');
            }
        };
    
        if (props.ride?._id) {
            fetchRideDetails();
        }
    
        // Poll every 5 seconds
        const interval = setInterval(() => {
            fetchRideDetails();
        }, 5000);
    
        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [props.ride]);

    useEffect(() => {
        console.log('Payment Status Updated:', paymentStatus); // Log payment status
    }, [paymentStatus]);

    // Calculate distance between pickup and destination
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
                return null;
            }
        };

        const calculateDistance = async () => {
            if (props.ride?.pickup && props.ride?.destination) {
                try {
                    const pickupLocation = await geocodeAddress(props.ride.pickup);
                    const destinationLocation = await geocodeAddress(props.ride.destination);

                    if (pickupLocation && destinationLocation) {
                        const distanceInMeters = getDistance(pickupLocation, destinationLocation);
                        const distanceInKm = (distanceInMeters / 1000).toFixed(2);
                        setDistance(distanceInKm);
                        setError(null);
                    } else {
                        throw new Error('Unable to get locations');
                    }
                } catch (error) {
                    console.error('Error calculating distance:', error);
                    setError('Unable to calculate distance');
                }
            }
        };

        calculateDistance();
    }, [props.ride]);

    // End ride logic
    const endRide = async () => {
        try {
            setLoading(true);
            console.log('Ending ride with data:', {
                rideId: props.ride._id,
                distance: distance
            });

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/end-ride`,
                {
                    rideId: props.ride._id,
                    distance: distance
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            console.log('End ride response:', response);

            if (response.status === 200) { // Show success message
                setRideCompleted(true); // Mark the ride as completed
            }
        } catch (error) {
            console.error('Error ending ride:', error);
            setError(error.response?.data?.message || 'Failed to end ride');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h5 className='p-1 text-center w-[93%] absolute top-0' 
                onClick={() => props.setFinishRidePanel(false)}>
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
            </h5>
            
            <h3 className='text-2xl font-semibold mb-5'>Finish this Ride</h3>
            
            <div className='flex items-center justify-between p-4 border-2 border-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3'>
                    <img 
                        className='h-12 w-12 rounded-full object-cover' 
                        src={props.ride?.user?.profileImage || "https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"} 
                        alt="User profile" 
                    />
                    <h2 className='text-lg font-medium'>
                        {props.ride?.user?.fullname?.firstname || 'User'}
                    </h2>
                </div>
                <h5 className='text-lg font-semibold'>
                    {error ? 'Error calculating distance' : 
                     distance ? `${distance} KM` : 'Calculating...'}
                </h5>
            </div>

            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Pickup Location</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.pickup}</p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Destination</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.destination}</p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{props.ride?.fare}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.paymentType}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-lg font-medium">
                        Payment Status: <span className="font-semibold">{paymentStatus || 'Fetching...'}</span>
                    </p>
                    {props.ride?.paymentType === 'cash' && paymentStatus !== 'completed' && (
                        <p className="text-sm text-gray-600 mt-2">
                            Please collect cash from the user before finishing the ride.
                        </p>
                    )}
                    {paymentStatus === 'completed' && props.ride?.status !== 'ongoing' && (
                        <p className="text-sm text-green-600 mt-2">
                            Payment has been completed. You can finish the ride now.
                        </p>
                    )}
                </div>

                <div className='mt-10 w-full'>
                    {!rideCompleted ? (
                        <button
                            onClick={endRide}
                            disabled={paymentStatus !== 'completed' || loading}
                            className={`w-full mt-5 flex text-lg justify-center text-white font-semibold p-3 rounded-lg
                                ${paymentStatus !== 'completed' || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {loading ? 'Finishing Ride...' : 'Finish Ride'}
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/captain-home')}
                            className="w-full mt-5 flex text-lg justify-center text-white font-semibold p-3 rounded-lg bg-blue-500 hover:bg-blue-600"
                        >
                            Go to Home
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinishRide;
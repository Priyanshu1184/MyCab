import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { GoogleMap, LoadScriptNext, DirectionsRenderer } from '@react-google-maps/api';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';
import './UserTracking.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const containerStyle = {
    width: '100%',
    height: '100%',
};

const PaymentForm = ({ ride, onPaymentSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false); // Track payment success

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/users/create-payment-intent`,
                { amount: ride.fare * 100 },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
    
            const clientSecret = response.data.clientSecret;
    
            const cardElement = elements.getElement(CardElement);
            const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: `${ride.user.fullname.firstname} ${ride.user.fullname.lastname}`,
                        address: {
                            line1: "123 Main Street",
                            city: "Raipur",
                            state: "Chhattisgarh",
                            postal_code: "492001",
                            country: "IN",
                        },
                    },
                },
            });
    
            if (error) {
                console.error('Payment Error:', error);
                setError(error.message);
            } else if (paymentIntent.status === 'succeeded') {
                // Mark payment as successful
                setPaymentSuccess(true);
    
                // Update payment status in the backend
                await axios.post(
                    `${import.meta.env.VITE_BASE_URL}/rides/update-payment-status`,
                    { rideId: ride._id, paymentStatus: 'completed' },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
    
                // Notify parent component
                console.log('Payment Successful:', paymentIntent);
                onPaymentSuccess();
            }
        } catch (err) {
            console.error('Payment Failed:', err);
            setError('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const cardStyle = {
        style: {
            base: {
                color: '#32325d',
                fontFamily: 'Arial, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        },
    };

    return (
        <div className="payment-modal">
            <div className="payment-modal-content">
                {paymentSuccess ? (
                    <div className="payment-success flex flex-col items-center">
                        {/* Lottie Animation */}
                        <DotLottieReact
                            src="https://lottie.host/b23d1a3a-ab4d-454c-814e-a2055c031b5f/CmppZRYxqD.lottie"
                            loop
                            autoplay
                            style={{ width: '150px', height: '150px' }}
                        />

                        <h3 className="text-xl font-semibold mt-4">Payment Successful!</h3>
                        <p className="text-gray-600 mt-2">You can now finish the ride or go back to the home page.</p>
                        {/* Redirect Button */}
                        <button
                                onClick={() => (window.location.href = '/home')} // Ensure this is correctly pointing to your home route
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
                            >
                                Go to Home
                            </button>
                    </div>
                ) : (
                    <form onSubmit={handlePayment} className="payment-form">
                        <h3 className="text-xl font-semibold mb-4">Complete Your Payment</h3>
                        <div className="card-element-container">
                            <CardElement options={cardStyle} />
                        </div>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                        <button
                            type="submit"
                            disabled={!stripe || loading}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
                        >
                            {loading ? 'Processing...' : 'Pay Now'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
const UserTracking = ({ ride, captainLocation, setRideStarted }) => {
    const navigate = useNavigate();
    const [directions, setDirections] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
    const [map, setMap] = useState(null); // Reference to the map instance
    const [showPaymentForm, setShowPaymentForm] = useState(false); // State for payment form
    const [rideCompleted, setRideCompleted] = useState(false); // State to track ride completion

    const handleFinishRide = () => {
        if (ride.paymentType === 'online') {
            setShowPaymentForm(true); // Show the payment form if payment type is online
        } else {
            completeRide(); // Complete the ride directly for cash payments
        }
    };

    const completeRide = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/complete`,
                { rideId: ride._id },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            if (response.data.message === 'Ride not ongoing') {
                alert('Ride not ongoing. It may have already been finished.');
            } else {
                setRideCompleted(true); // Mark the ride as completed
                alert('Ride completed successfully!');
            }
        } catch (error) {
            console.error('Error completing ride:', error);
            alert('Error completing ride. Please try again.');
        }
    };

    const onPaymentSuccess = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/rides/details/${ride._id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            const updatedRide = response.data.ride;
            setRide(updatedRide); // Update ride details
            setShowPaymentForm(false); // Close the payment form
            alert('Payment successful! You can now finish the ride.');
        } catch (error) {
            console.error('Error fetching updated ride details:', error);
        }
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

                                // Adjust the map to fit the route
                                if (map) {
                                    const bounds = new window.google.maps.LatLngBounds();
                                    result.routes[0].overview_path.forEach((point) => {
                                        bounds.extend(point);
                                    });
                                    map.fitBounds(bounds);
                                }
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
    }, [ride, map]); // Include `map` in the dependency array

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
                                <p className='text-sm text-gray-600'>{ride?.paymentType}</p>
                            </div>
                        </div>
                        <div className='flex items-center justify-center mt-4'>
                            {!rideCompleted ? (
                                <button
                                    className='bg-blue-500 text-white px-4 py-2 rounded-lg'
                                    onClick={handleFinishRide}
                                >
                                    {ride.paymentType === 'online' ? 'Make Payment' : 'Finish Ride'}
                                </button>
                            ) : (
                                <button
                                    className='bg-green-500 text-white px-4 py-2 rounded-lg'
                                    onClick={() => navigate('/home')}
                                >
                                    Go to Home
                                </button>
                            )}
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
                        zoom={18}
                        options={{ disableDefaultUI: false }}
                        onLoad={(mapInstance) => setMap(mapInstance)} // Capture the map instance
                    >
                        {directions && <DirectionsRenderer directions={directions} />}
                    </GoogleMap>
                </LoadScriptNext>
            </div>

            {/* Payment Modal */}
            {showPaymentForm && (
                <div className="payment-overlay">
                    <Elements stripe={stripePromise}>
                        <PaymentForm
                            ride={ride}
                            onPaymentSuccess={onPaymentSuccess}
                            closeModal={() => setShowPaymentForm(false)}
                        />
                    </Elements>
                </div>
            )}
        </div>
    );
};

export default UserTracking;
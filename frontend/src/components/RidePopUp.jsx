import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getDistance } from 'geolib';

const RidePopUp = (props) => {
    const [distance, setDistance] = useState(null);

    useEffect(() => {
        const geocodeAddress = async (address) => {
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
        };

        const calculateDistance = async () => {
            if (props.ride?.pickup && props.ride?.destination) {
                const pickupLocation = await geocodeAddress(props.ride.pickup);
                const destinationLocation = await geocodeAddress(props.ride.destination);

                if (pickupLocation && destinationLocation) {
                    const distanceInMeters = getDistance(pickupLocation, destinationLocation);
                    const distanceInKm = (distanceInMeters / 1000).toFixed(2);
                    setDistance(distanceInKm);
                }
            }
        };

        calculateDistance();
    }, [props.ride]);
    
    
    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setRidePopupPanel(false);
            }}>
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
            </h5>
            <h3 className='text-2xl font-semibold mb-5'>New Ride Available!</h3>
            <div className='flex items-center justify-between p-3 bg-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3 '>
                    <img className='h-12 rounded-full object-cover w-12' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="" />
                    <h2 className='text-lg font-medium'>{props.ride?.user.fullname.firstname + " " + props.ride?.user.fullname.lastname}</h2>
                </div>
                <h5 className='text-lg font-semibold'>{distance ? `${distance} KM` : 'Calculating...'}</h5>
            </div>
            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>562/11-A</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>562/11-A</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.destination}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{props.ride?.fare} </h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.paymentType}</p>
                        </div>
                    </div>
                </div>
                <div className='mt-5 w-full '>
                    <button onClick={() => {
                        props.confirmRide(); // Only call confirmRide to handle the state changes
                    }} className=' bg-green-600 w-full text-white font-semibold p-2 px-10 rounded-lg'>Accept</button>

                    <button onClick={() => {
                        props.setRidePopupPanel(false);
                    }} className='mt-2 w-full bg-gray-300 text-gray-700 font-semibold p-2 px-10 rounded-lg'>Ignore</button>
                </div>
            </div>
        </div>
    );
};

export default RidePopUp;
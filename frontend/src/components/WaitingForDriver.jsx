import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';
import './Waiting.css';

const WaitingForDriver = (props) => {
    const navigate = useNavigate();
    const [panelOpen, setPanelOpen] = useState(false);
    const panelRef = useRef(null);

    const handleCancelRide = () => {
        // Navigate to home and refresh the page
        window.location.href = '/home';
    };

    return (
        <div className="waiting-container flex">
            <div className="waiting-for-driver p-4 w-1/3 mt-8">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mb-4"></div>
                    <h2 className="text-xl font-semibold mb-2">Waiting for your driver</h2>
                    <p className="text-gray-600 text-center">Please wait while your driver arrives</p>
                    
                    {/* Driver Details */}
                    {props.ride && props.ride.captain && (
                        <div className="w-full mt-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <img className='h-16 w-16 rounded-full object-cover' src={props.ride.captain.profileImage || "https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"} alt="Captain" />
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
            <div className="map-container w-2/3">
                {/* Add your map component here */}
            </div>
        </div>
    );
};

export default WaitingForDriver;
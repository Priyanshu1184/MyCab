import React, { useEffect } from 'react';

const LookingForDriver = ({ ride, setVehicleFound }) => {
    useEffect(() => {
        // Cleanup function for when component unmounts
        return () => {
            setVehicleFound(false);
        };
    }, [setVehicleFound]);

    return (
        <div className="p-4">
            <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mb-4"></div>
                <h2 className="text-xl font-semibold mb-2">Looking for nearby drivers</h2>
                <p className="text-gray-600 text-center">Please wait while we connect you with a driver</p>
                
                {/* Ride Details */}
                {ride && (
                    <div className="w-full mt-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <i className="ri-map-pin-user-fill text-gray-600"></i>
                            <div>
                                <h4 className="font-medium">Pickup Location</h4>
                                <p className="text-sm text-gray-600">{ride.pickup}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <i className="ri-map-pin-2-fill text-gray-600"></i>
                            <div>
                                <h4 className="font-medium">Destination</h4>
                                <p className="text-sm text-gray-600">{ride.destination}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <i className="ri-taxi-fill text-gray-600"></i>
                            <div>
                                <h4 className="font-medium">Vehicle Type</h4>
                                <p className="text-sm text-gray-600">{ride.vehicleType || 'Standard'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <i className="ri-money-dollar-circle-fill text-gray-600"></i>
                            <div>
                                <h4 className="font-medium">Estimated Fare</h4>
                                <p className="text-sm text-gray-600">₹{ride.fare}</p>
                            </div>
                        </div>

                        {/* Payment Type */}
                        <div className="flex items-center gap-3">
                            <i className="ri-wallet-3-fill text-gray-600"></i>
                            <div>
                                <h4 className="font-medium">Payment Type</h4>
                                <p className="text-sm text-gray-600">{ride.paymentType === 'online' ? 'Online Payment' : 'Cash Payment'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Cancel Button */}
            <button
                onClick={() => setVehicleFound(false)}
                className="w-full mt-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
                Cancel Search
            </button>
        </div>
    );
};

export default LookingForDriver;
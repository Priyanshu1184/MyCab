import React, { useState } from 'react';
import PropTypes from 'prop-types';
import 'remixicon/fonts/remixicon.css';

const ConfirmRide = ({ 
    pickup, 
    destination, 
    fare, 
    vehicleType, 
    createRide, 
    setConfirmRidePanel,
    setVehicleFound 
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirmRide = async () => {
        try {
            setLoading(true);
            await createRide();
            setVehicleFound(true);
            setConfirmRidePanel(false);
        } catch (error) {
            console.error('Error confirming ride:', error);
            setError('Failed to confirm ride');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h3 className='text-2xl font-semibold mb-5'>Confirm your Ride</h3>

            <div className='flex gap-2 justify-between flex-col items-center'>
                <img 
                    className='h-20 object-cover rounded-lg' 
                    src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" 
                    alt="Vehicle" 
                />
                
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill text-xl"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Pickup Location</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{pickup}</p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Destination</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{destination}</p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line text-xl"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{fare[vehicleType]}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash Payment</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="w-full p-3 mt-2 bg-red-100 text-red-600 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <button 
                    onClick={handleConfirmRide}
                    disabled={loading}
                    className={`w-full mt-5 mb-5 p-3 rounded-lg font-semibold transition-colors
                        ${loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                    {loading ? 'Confirming...' : 'Confirm Ride'}
                </button>
            </div>
        </div>
    );
};

ConfirmRide.propTypes = {
    pickup: PropTypes.string.isRequired,
    destination: PropTypes.string.isRequired,
    fare: PropTypes.object.isRequired,
    vehicleType: PropTypes.string.isRequired,
    createRide: PropTypes.func.isRequired,
    setConfirmRidePanel: PropTypes.func.isRequired,
    setVehicleFound: PropTypes.func.isRequired
};

export default ConfirmRide;
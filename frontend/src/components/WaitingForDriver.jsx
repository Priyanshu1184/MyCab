import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const WaitingForDriver = (props) => {
    const navigate = useNavigate();
    const [panelOpen, setPanelOpen] = useState(false);
    const panelRef = useRef(null);

    return (
        <div className="relative">
            {/* 🔹 Driver & Ride Details */}
            <div className='flex items-center justify-between p-4'>
                <img className='h-12' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="Car" />
                <div className='text-right'>
                    <h2 className='text-lg font-medium capitalize'>{props.ride?.captain.fullname.firstname}</h2>
                    <h4 className='text-xl font-semibold -mt-1 -mb-1'>{props.ride?.captain.vehicle.plate}</h4>
                    <p className='text-sm text-gray-600'>Maruti Suzuki Alto</p>
                    <h1 className='text-lg font-semibold'> {props.ride?.otp} </h1>
                </div>
            </div>

            {/* 🔹 Trip Details */}
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
                            <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔹 Bottom Panel (Similar to Previous One) */}
            <div 
                className={`fixed bottom-0 w-full bg-white z-10 transition-transform duration-300 ease-in-out 
                ${panelOpen ? 'translate-y-0 py-4' : 'translate-y-[85%] py-2'}`}  
                ref={panelRef}
            >
                {/* 🔹 Toggle Button - Always Visible */}
                <button 
                    className={`absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-300 rounded-full shadow-md flex items-center justify-center text-xl
                    transition-all duration-300 ease-in-out ${panelOpen ? '-top-5' : '-top-10'}`} 
                    onClick={() => setPanelOpen(!panelOpen)}
                >
                    {panelOpen ? '↓' : '↑'}
                </button>

                {/* 🔹 Panel Content */}
                <div className='relative px-4 pb-4'>
                    <h4 className='text-2xl font-semibold mt-6 text-center'>Ride Summary</h4>

                    <div className="mt-4 space-y-2">
                        <p className="text-lg font-medium">Pickup: <span className="text-gray-600">{props.ride?.pickup}</span></p>
                        <p className="text-lg font-medium">Destination: <span className="text-gray-600">{props.ride?.destination}</span></p>
                        <p className="text-lg font-medium">Fare: <span className="text-gray-600">₹{props.ride?.fare}</span></p>
                    </div>

                    {/* 🔹 Cancel Button */}
                    <button 
                        onClick={() => navigate('/cancel')} 
                        className='bg-red-500 text-white px-4 py-2 rounded-lg mt-4 w-full'
                    >
                        Cancel Ride
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WaitingForDriver;

import React, { useEffect, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SocketContext } from '../context/SocketContext'
import LiveTracking from '../components/LiveTracking'

const Riding = () => {
    const location = useLocation()
    const { ride } = location.state || {} // Retrieve ride data
    const { socket } = useContext(SocketContext)
    const navigate = useNavigate()

    useEffect(() => {
        const handleRideEnd = () => navigate('/home')
        socket.on("ride-ended", handleRideEnd)

        return () => {
            socket.off("ride-ended", handleRideEnd) // Cleanup on unmount
        }
    }, [socket, navigate])

    return (
        <div className='h-screen flex flex-col'>
            {/* 🔹 Home Button */}
            <Link to='/home' className='fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full z-10'>
                <i className="text-lg font-medium ri-home-5-line"></i>
            </Link>

            {/* 🔹 Map Section (Top Half) */}
            <div className='h-1/2 relative'>
                <LiveTracking />
            </div>

            {/* 🔹 Ride Details Panel (Bottom Half) */}
            <div className='h-1/2 p-4 bg-white shadow-lg relative z-10 overflow-hidden'>
                {/* 🚨 Fallback: If no ride data is available */}
                {!ride ? (
                    <p className="text-center text-gray-600">Loading ride details...</p>
                ) : (
                    <>
                        {/* 🔹 Captain Info */}
                        <div className='flex items-center justify-between'>
                            <img className='h-12' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="Car" />
                            <div className='text-right'>
                                <h2 className='text-lg font-medium capitalize'>{ride?.captain?.fullname?.firstname || "Captain Name"}</h2>
                                <h4 className='text-xl font-semibold -mt-1 -mb-1'>{ride?.captain?.vehicle?.plate || "XXXX-0000"}</h4>
                                <p className='text-sm text-gray-600'>Maruti Suzuki Alto</p>
                            </div>
                        </div>

                        {/* 🔹 Ride Details */}
                        <div className='mt-5 space-y-3'>
                            <div className='flex items-center gap-5 p-3 border-b-2'>
                                <i className="text-lg ri-map-pin-2-fill"></i>
                                <div>
                                    <h3 className='text-lg font-medium'>562/11-A</h3>
                                    <p className='text-sm -mt-1 text-gray-600'>{ride?.destination || "Unknown Destination"}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-5 p-3'>
                                <i className="ri-currency-line"></i>
                                <div>
                                    <h3 className='text-lg font-medium'>₹{ride?.fare || "0"}</h3>
                                    <p className='text-sm -mt-1 text-gray-600'>{ride?.paymentType}</p>
                                </div>
                            </div>
                        </div>

                        {/* 🔹 Payment Button */}
                        <button className='w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg'>
                            Make a Payment
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default Riding

import React, { useRef, useState, useEffect, useContext } from 'react';
import CaptainDetails from '../components/CaptainDetails';
import RidePopUp from '../components/RidePopUp';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ConfirmRidePopUp from '../components/ConfirmRidePopUp';
import CaptainTracking from '../components/CaptainTracking'; // 🚀 NEWLY ADDED
import { SocketContext } from '../context/SocketContext';
import { CaptainDataContext } from '../context/CapatainContext';
import axios from 'axios';
import LiveTracking from '../components/LiveTracking';
import useLogout from './UserLogout';

const CaptainHome = () => {
    const [ridePopupPanel, setRidePopupPanel] = useState(false);
    const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);
    const [trackingPanel, setTrackingPanel] = useState(false); // 🚀 NEWLY ADDED (Captain Tracking Panel)
    const [ride, setRide] = useState(null);

    const ridePopupPanelRef = useRef(null);
    const confirmRidePopupPanelRef = useRef(null);
    const trackingPanelRef = useRef(null); // 🚀 NEW

    const { socket } = useContext(SocketContext);
    const { captain, setCaptain } = useContext(CaptainDataContext); 
    const logout = useLogout();

    useEffect(() => {
        if (!captain?._id) return;
    
        // Join WebSocket Room
        socket.emit('join', { userId: captain._id, userType: 'captain' });
    
        // Function to update captain's location
        const updateLocation = (position) => {
            const newLocation = {
                ltd: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            console.log('Emitting update-location-captain:', {
                userId: captain._id,
                location: newLocation,
                rideId: ride?._id
            });
    
            // Send updated location via WebSocket
            socket.emit('update-location-captain', {
                userId: captain._id,
                location: newLocation,
                rideId: ride?._id // Ensure rideId is included
            });
    
            setCaptain(prevState => ({ ...prevState, location: newLocation }));
        };
    
        // Watch location
        let watchId = navigator.geolocation.watchPosition(
            updateLocation,
            (error) => console.error("Location error:", error),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [socket, captain?._id, setCaptain, ride?._id]); // Include ride?._id in dependencies

    // Listen for new ride requests
    useEffect(() => {
        const handleNewRide = (data) => {
            setRide(data);
            setRidePopupPanel(true);
        };

        socket.on('new-ride', handleNewRide);

        return () => socket.off('new-ride', handleNewRide); 
    }, [socket]);

    // Confirm ride & start tracking
    const confirmRide = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`, {
                rideId: ride._id,
                captainId: captain._id,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Emit ride-confirmed event
            socket.emit('ride-confirmed', ride);

            setRidePopupPanel(false);
            setTrackingPanel(true); // 🚀 Instead of directly confirming, start tracking first
        } catch (error) {
            console.error("Ride confirmation failed:", error);
        }
    };

    // Animations for popups
    useGSAP(() => {
        gsap.to(ridePopupPanelRef.current, { transform: ridePopupPanel ? 'translateY(0)' : 'translateY(100%)' });
    }, [ridePopupPanel]);

    useGSAP(() => {
        gsap.to(confirmRidePopupPanelRef.current, { transform: confirmRidePopupPanel ? 'translateY(0)' : 'translateY(100%)' });
    }, [confirmRidePopupPanel]);

    useGSAP(() => {
        gsap.to(trackingPanelRef.current, { transform: trackingPanel ? 'translateY(0)' : 'translateY(100%)' });
    }, [trackingPanel]); // 🚀 NEW: Captain Tracking Animation

    return (
        <div className='h-screen flex'>
            {/* Left Section */}
            <div className='w-[25%] h-full flex flex-col p-6 bg-white shadow-md overflow-y-auto relative'>
                <CaptainDetails />
                <button 
                    onClick={logout}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-2 rounded-lg"
                >
                    Logout
                </button>
            </div>

            {/* Right Section */}
            <div className='w-[75%] h-full relative'>
                {/* Map Section */}
                <div className='h-full relative overflow-hidden'>
                    <LiveTracking 
                        mapInteractive={true} // Ensure map is interactive
                    />
                </div>

                {/* Ride Request Popup */}
                <div ref={ridePopupPanelRef} className='fixed w-[75%] z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                    <RidePopUp
                        ride={ride}
                        setRidePopupPanel={setRidePopupPanel}
                        setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                        confirmRide={confirmRide}
                    />
                </div>

                {/* 🚀 NEW: Captain Tracking Popup (On the way to pickup) */}
                <div ref={trackingPanelRef} className='fixed w-[75%] h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                    {ride && trackingPanel && (
                        <CaptainTracking
                            ride={ride}
                            setTrackingPanel={setTrackingPanel}
                            setConfirmRidePopupPanel={setConfirmRidePopupPanel} // Go to final confirmation
                        />
                    )}
                </div>

                {/* Confirm Ride Popup (Final Destination Navigation) */}
                <div ref={confirmRidePopupPanelRef} className='fixed w-[75%] h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                    <ConfirmRidePopUp
                        ride={ride}
                        setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                        setRidePopupPanel={setRidePopupPanel}
                    />
                </div>
            </div>
        </div>
    );
};

export default CaptainHome;
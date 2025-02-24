import React, { useRef, useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
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

            // Send updated location via WebSocket
            socket.emit('update-location-captain', {
                userId: captain._id,
                location: newLocation
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
    }, [socket, captain?._id, setCaptain]);

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
        <div className='h-screen flex flex-col'>
            {/* Header */}
            <div className='fixed p-6 top-0 flex items-center justify-between w-screen bg-white shadow-md z-10'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber Logo" />
                <Link to='/captain-home' className='h-10 w-10 bg-gray-200 flex items-center justify-center rounded-full'>
                <i 
                    className="text-lg font-medium ri-logout-box-r-line cursor-pointer"
                    onClick={logout} 
                ></i>
                </Link>
            </div>

            {/* Map Section */}
            <div className='h-3/5 w-screen mt-16'>
                <LiveTracking />
            </div>

            {/* Captain Details */}
            <div className='h-2/5 p-6 bg-white shadow-md'>
                <CaptainDetails />
            </div>

            {/* Ride Request Popup */}
            <div ref={ridePopupPanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <RidePopUp
                    ride={ride}
                    setRidePopupPanel={setRidePopupPanel}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    confirmRide={confirmRide}
                />
            </div>

            {/* 🚀 NEW: Captain Tracking Popup (On the way to pickup) */}
            <div ref={trackingPanelRef} className='fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                {ride && trackingPanel && (
                    <CaptainTracking
                        ride={ride}
                        setTrackingPanel={setTrackingPanel}
                        setConfirmRidePopupPanel={setConfirmRidePopupPanel} // Go to final confirmation
                    />
                )}
            </div>

            {/* Confirm Ride Popup (Final Destination Navigation) */}
            <div ref={confirmRidePopupPanelRef} className='fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <ConfirmRidePopUp
                    ride={ride}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    setRidePopupPanel={setRidePopupPanel}
                />
            </div>
        </div>
    );
};

export default CaptainHome;
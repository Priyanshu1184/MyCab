import React, { useEffect, useRef, useState, useContext } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';

// Component imports
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import UserTracking from '../components/UserTracking';
import LiveTracking from '../components/LiveTracking';

// Context and hooks
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import useLogout from './UserLogout';

const Home = () => {
    // State Management
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [panelOpen, setPanelOpen] = useState(false);
    const [vehiclePanel, setVehiclePanel] = useState(false);
    const [confirmRidePanel, setConfirmRidePanel] = useState(false);
    const [vehicleFound, setVehicleFound] = useState(false);
    const [waitingForDriver, setWaitingForDriver] = useState(false);
    const [rideStarted, setRideStarted] = useState(false);
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [activeField, setActiveField] = useState(null);
    const [fare, setFare] = useState({});
    const [vehicleType, setVehicleType] = useState(null);
    const [ride, setRide] = useState(null);
    const [captainLocation, setCaptainLocation] = useState(null);
    const [error, setError] = useState(null);

    // Refs for animations
    const vehiclePanelRef = useRef(null);
    const confirmRidePanelRef = useRef(null);
    const vehicleFoundRef = useRef(null);
    const waitingForDriverRef = useRef(null);
    const userTrackingRef = useRef(null);

    // Hooks
    const { socket } = useContext(SocketContext);
    const { user } = useContext(UserDataContext);
    const logout = useLogout();
    const navigate = useNavigate();

    // Socket connection effect
    useEffect(() => {
        if (user && socket) {
            console.log('Joining user room:', user._id);
            socket.emit("join", { userType: "user", userId: user._id });

            // Socket event listeners
            const handleRideConfirmed = (confirmedRide) => {
                setRide(confirmedRide);
                setVehicleFound(false);
                setWaitingForDriver(true);
            };

            const handleRideStarted = () => {
                setWaitingForDriver(false);
                setRideStarted(true);
            };

            const handleCaptainLocationUpdate = (location) => {
                setCaptainLocation(location);
            };

            const handleRideCompleted = () => {
                setRideStarted(false);
                navigate('/');
            };

            socket.on('ride-confirmed', handleRideConfirmed);
            socket.on('ride-started', handleRideStarted);
            socket.on('captain-location-update', handleCaptainLocationUpdate);
            socket.on('ride-completed', handleRideCompleted);

            return () => {
                socket.off('ride-confirmed');
                socket.off('ride-started');
                socket.off('captain-location-update');
                socket.off('ride-completed');
            };
        }
    }, [user, socket, navigate]);

    // Location input handlers
    const handlePickupChange = async (e) => {
        setPickup(e.target.value);
        if (e.target.value.length > 2) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                    params: { input: e.target.value },
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setPickupSuggestions(response.data);
            } catch (error) {
                setError('Failed to get location suggestions');
            }
        }
    };

    const handleDestinationChange = async (e) => {
        setDestination(e.target.value);
        if (e.target.value.length > 2) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                    params: { input: e.target.value },
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setDestinationSuggestions(response.data);
            } catch (error) {
                setError('Failed to get location suggestions');
            }
        }
    };

    // GSAP Animations
    useGSAP(() => {
        const panels = [
            { ref: vehiclePanelRef, state: vehiclePanel },
            { ref: confirmRidePanelRef, state: confirmRidePanel },
            { ref: vehicleFoundRef, state: vehicleFound },
            { ref: waitingForDriverRef, state: waitingForDriver },
            { ref: userTrackingRef, state: rideStarted }
        ];

        panels.forEach(({ ref, state }) => {
            if (ref.current) {
                gsap.to(ref.current, {
                    transform: state ? 'translateY(0)' : 'translateY(100%)',
                    duration: 0.3,
                    ease: 'power2.inOut'
                });
            }
        });
    }, [vehiclePanel, confirmRidePanel, vehicleFound, waitingForDriver, rideStarted]);

    // API calls
    const findTrip = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
                params: { pickup, destination },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setFare(response.data);
            setVehiclePanel(true);
            setPanelOpen(false);
        } catch (error) {
            setError('Failed to get fare estimate');
        }
    };

    const createRide = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/create`,
                { pickup, destination, vehicleType },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
            );
            setRide(response.data);
            setVehicleFound(true);
            setConfirmRidePanel(false);
        } catch (error) {
            setError('Failed to create ride');
        }
    };

    // Render UI
    return (
        <div className='h-screen flex flex-col overflow-hidden'>
            {/* Header Logo */}
            <img 
                className='w-16 absolute left-5 top-5 z-20' 
                src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" 
                alt="Logo" 
            />

            <div className="flex w-full h-full overflow-hidden">
                {/* Left Panel - Search and Controls */}
                <div className="w-[35%] h-full bg-white shadow-lg relative z-10 p-4">
                    <div className="relative">
                        <h4 className='text-2xl font-semibold mt-10 text-center'>Find a Trip</h4>
                        
                        {/* Search Form */}
                        <form className='py-3' onSubmit={e => e.preventDefault()}>
                            <input
                                value={pickup}
                                onChange={handlePickupChange}
                                onClick={() => { setPanelOpen(true); setActiveField('pickup'); }}
                                className='bg-[#eee] px-4 py-2 text-lg rounded-lg w-full'
                                placeholder='Add a pick-up location'
                            />
                            <input
                                value={destination}
                                onChange={handleDestinationChange}
                                onClick={() => { setPanelOpen(true); setActiveField('destination'); }}
                                className='bg-[#eee] px-4 py-2 text-lg rounded-lg w-full mt-3'
                                placeholder='Enter your destination'
                            />
                        </form>

                        {/* Find Trip Button */}
                        <button 
                            onClick={findTrip}
                            disabled={!pickup || !destination}
                            className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full disabled:bg-gray-300'
                        >
                            Find Trip
                        </button>
                    </div>

                    {/* Location Search Results */}
                    <div className={`transition-all duration-300 ${panelOpen ? 'h-auto max-h-80' : 'h-0'} overflow-y-auto`}>
                        <LocationSearchPanel
                            suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                            setPanelOpen={setPanelOpen}
                            setPickup={setPickup}
                            setDestination={setDestination}
                            activeField={activeField}
                        />
                    </div>

                    {/* Logout Button */}
                    <button 
                        onClick={logout}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-2 rounded-lg"
                    >
                        Logout
                    </button>
                </div>

                {/* Right Panel - Map */}
                <div className="w-[65%] h-full relative">
                    <LiveTracking
                        pickup={pickup}
                        destination={destination}
                        showDirections={rideStarted}
                        captainLocation={captainLocation}
                        mapInteractive={true}
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 px-4 py-2 rounded-lg z-50">
                    {error}
                </div>
            )}

            {/* Bottom Panels */}
            {/* Vehicle Selection Panel */}
            <div ref={vehiclePanelRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <VehiclePanel
                    selectVehicle={setVehicleType}
                    fare={fare}
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehiclePanel={setVehiclePanel}
                />
                <button
                    onClick={() => setVehiclePanel(false)}
                    className="absolute top-2 right-2 bg-gray-300 text-gray-700 p-2 rounded-full"
                >
                    <i className="ri-arrow-down-s-line text-2xl"></i>
                </button>
            </div>

            {/* Confirm Ride Panel */}
            <div ref={confirmRidePanelRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <ConfirmRide
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    createRide={createRide}
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehicleFound={setVehicleFound}  // Make sure this is added
                />
                <button
                    onClick={() => setConfirmRidePanel(false)}
                    className="absolute top-2 right-2 bg-gray-300 text-gray-700 p-2 rounded-full"
                >
                    <i className="ri-arrow-down-s-line text-2xl"></i>
                </button>
            </div>

            {/* Looking for Driver Panel */}
            <div ref={vehicleFoundRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <LookingForDriver
                    ride={ride}
                    setVehicleFound={setVehicleFound}
                />
                <button
                    onClick={() => setVehicleFound(false)}
                    className="absolute top-2 right-2 bg-gray-300 text-gray-700 p-2 rounded-full"
                >
                    <i className="ri-arrow-down-s-line text-2xl"></i>
                </button>
            </div>

            {/* Waiting for Driver Panel */}
            <div ref={waitingForDriverRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <WaitingForDriver
                    ride={ride}
                    setWaitingForDriver={setWaitingForDriver}
                />
                <button
                    onClick={() => setWaitingForDriver(false)}
                    className="absolute top-2 right-2 bg-gray-300 text-gray-700 p-2 rounded-full"
                >
                    <i className="ri-arrow-down-s-line text-2xl"></i>
                </button>
            </div>

            {/* User Tracking Panel */}
            <div ref={userTrackingRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                
                {console.log('Ride:', ride)}
                <UserTracking 
                        
                    ride={ride} 
                    captainLocation={captainLocation}
                    setRideStarted={setRideStarted}
                />
                <button
                    onClick={() => setRideStarted(false)}
                    className="absolute top-2 right-2 bg-gray-300 text-gray-700 p-2 rounded-full"
                >
                    <i className="ri-arrow-down-s-line text-2xl"></i>
                </button>
            </div>
        </div>
    );
};

export default Home;
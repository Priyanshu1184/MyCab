const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('join', async (data) => {
            const { userId, userType } = data;

            if (userType === 'user') {
                await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
            } else if (userType === 'captain') {
                await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
            }
        });

        // 🔹 Update Captain's Location & Notify User in Real-time
        socket.on('update-location-captain', async (data) => {
            const { userId, location, rideId } = data;

            if (!location || !location.ltd || !location.lng) {
                return socket.emit('error', { message: 'Invalid location data' });
            }

            await captainModel.findByIdAndUpdate(userId, {
                location: { ltd: location.ltd, lng: location.lng }
            });

            // Get the user who booked this ride
            const rideUser = await userModel.findOne({ activeRide: rideId });

            if (rideUser && rideUser.socketId) {
                io.to(rideUser.socketId).emit('captain-location-update', location);
            }
        });

        // 🔹 Notify when Captain Starts the Ride
        socket.on('ride-started', async (data) => {
            const { rideId } = data;

            // Find user for this ride
            const rideUser = await userModel.findOne({ activeRide: rideId });

            if (rideUser && rideUser.socketId) {
                io.to(rideUser.socketId).emit('ride-started', { rideId });
            }
        });
        

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {
    console.log(messageObject);
    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
};

const updatePaymentStatus = async (req, res) => {
    const { rideId, paymentStatus } = req.body;

    try {
        const ride = await rideModel.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        ride.paymentStatus = paymentStatus;
        await ride.save();

        // Emit WebSocket event to notify the driver
        if (ride.captain && ride.captain.socketId) {
            sendMessageToSocketId(ride.captain.socketId, {
                event: 'payment-status-updated',
                data: { rideId, paymentStatus }
            });
        }

        res.status(200).json({ message: 'Payment status updated successfully', ride });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = { initializeSocket, sendMessageToSocketId, updatePaymentStatus };
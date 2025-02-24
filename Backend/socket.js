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

module.exports = { initializeSocket, sendMessageToSocketId };

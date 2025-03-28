const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pickup, destination, vehicleType, paymentType } = req.body;

    try {
        const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType, paymentType});
        res.status(201).json(ride);

        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);



        const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.ltd, pickupCoordinates.lng, 2);

        ride.otp = ""

        const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');

        captainsInRadius.map(captain => {

            sendMessageToSocketId(captain.socketId, {
                event: 'new-ride',
                data: rideWithUser
            })

        })

    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }

};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        console.log(ride);

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.endRide = async (req, res) => {
    const { rideId, distance } = req.body;

    try {
        const ride = await rideModel.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Allow finishing the ride if payment is completed
        if (ride.paymentStatus === 'completed') {
            ride.status = 'completed'; // Ensure the ride is marked as completed
            ride.distance = distance; // Update the distance if provided
            await ride.save();

            return res.status(200).json({ message: 'Ride completed successfully.' });
        }

        // If payment is not completed, prevent finishing the ride
        if (ride.status !== 'ongoing') {
            return res.status(400).json({ message: 'Ride not ongoing and payment not completed.' });
        }

        // Mark the ride as completed
        ride.status = 'completed';
        ride.distance = distance; // Update the distance if provided
        await ride.save();

        res.status(200).json({ message: 'Ride completed successfully.' });
    } catch (error) {
        console.error('Error completing ride:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.createPaymentIntent = async (req, res) => {
    try {
        const { amount, rideId } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'inr',
            payment_method_types: ['card'],
        });

        // Update payment status to 'pending' in the database
        const ride = await rideModel.findById(rideId);
        if (ride) {
            ride.paymentStatus = 'pending';
            await ride.save();
        }

        res.status(200).json(paymentIntent.client_secret);
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Failed to create payment intent' });
    }
};

module.exports.completeRide = async (req, res) => {
    const { rideId } = req.body;

    try {
        const ride = await rideModel.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.status !== 'ongoing') {
            return res.status(400).json({ message: 'Ride not ongoing' });
        }

        // Update ride status and payment status
        ride.status = 'completed';
        ride.paymentStatus = 'completed';
        await ride.save();

        // Emit WebSocket event to notify the driver
        if (ride.captain && ride.captain.socketId) {
            sendMessageToSocketId(ride.captain.socketId, {
                event: 'payment-status-updated',
                data: { rideId: ride._id, paymentStatus: 'completed' }
            });
        }

        res.status(200).json({ message: 'Ride completed successfully' });
    } catch (error) {
        console.error('Error completing ride:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports.getRideDetails = async (req, res) => {
    const { rideId } = req.params;
    try {
        const ride = await rideModel.findById(rideId).populate('user').populate('captain');

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        return res.status(200).json({ ride });
    } catch (error) {
        console.error('Error fetching ride details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports.updatePaymentStatus = async (req, res) => {
    const { rideId, paymentStatus } = req.body;

    console.log('Received request to update payment status:', { rideId, paymentStatus }); // Debug log

    try {
        if (!rideId || !paymentStatus) {
            console.error('Missing rideId or paymentStatus'); // Debug log
            return res.status(400).json({ message: 'Ride ID and payment status are required' });
        }

        const ride = await rideModel.findById(rideId);

        if (!ride) {
            console.error('Ride not found for rideId:', rideId); // Debug log
            return res.status(404).json({ message: 'Ride not found' });
        }

        ride.paymentStatus = paymentStatus;
        await ride.save();

        console.log('Payment status updated successfully:', { rideId, paymentStatus }); // Debug log
        return res.status(200).json({ message: 'Payment status updated successfully', ride });
    } catch (error) {
        console.error('Error updating payment status:', error); // Debug log
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { updatePaymentStatus } = require('../socket');

router.post('/create',
    authMiddleware.authUser,
    body('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    body('vehicleType').isString().isIn([ 'auto', 'car', 'moto' ]).withMessage('Invalid vehicle type'),
    rideController.createRide
)

router.get('/get-fare',
    authMiddleware.authUser,
    query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    rideController.getFare
)

router.post('/confirm',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.confirmRide
)

router.get('/start-ride',
    authMiddleware.authCaptain,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    query('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
    rideController.startRide
)

router.get(
    '/details/:rideId',
    authMiddleware.authCaptain, // Ensure the captain is authenticated
    rideController.getRideDetails
);

router.post('/end-ride',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
)

router.post(
    '/complete',
    authMiddleware.authUser, // Use authUser instead of authCaptain
    body('rideId').notEmpty().withMessage('Ride ID is required'),
    rideController.completeRide // Update the controller to handle user-side completion
);

router.post(
    '/update-payment-status',
    authMiddleware.authUser, // Ensure the user is authenticated
    body('paymentStatus').notEmpty().withMessage('Payment status is required'),
    rideController.updatePaymentStatus
);

module.exports = router;
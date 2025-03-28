const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blackListToken.model');
const captainModel = require('../models/captain.model');

module.exports.authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        // Check if token is blacklisted
        const isBlacklisted = await blackListTokenModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Unauthorized: Token is blacklisted' });
        }

        // Verify token and find user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        req.user = user; // Attach the user to the request
        next();
    } catch (err) {
        console.error('Error in authUser middleware:', err);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};


module.exports.authCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    console.log('Authorization Token:', token); // Debugging

    if (!token) {
        console.log('No token provided'); // Debugging
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded); // Debugging

        const captain = await captainModel.findById(decoded._id);
        console.log('Captain Query Result:', captain); // Debugging

        if (!captain) {
            console.log('Captain not found'); // Debugging
            return res.status(401).json({ message: 'Unauthorized: Captain not found' });
        }

        req.captain = captain;
        next();
    } catch (error) {
        console.log('Invalid token:', error.message); // Debugging
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
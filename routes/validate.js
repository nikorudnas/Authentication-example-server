const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const constants = require('../constants');

module.exports = (() => {

    const router = express.Router();

    router.post('/validatejwt', (req, res) => {
        // username and password is required
        if (req.body.token) {
            jwt.verify(req.body.token, constants.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(404).json({
                        success: false,
                        message: 'Token not matching'
                    });
                } else {
                    // find user
                    User.findOne({
                        'username': decoded.username
                    }, (err, user) => {
                        if (err) {
                            return res.status(500).json({
                                success: false
                            });
                        }

                        // user found
                        if (user) {
                            return res.status(200).json({
                                success: true
                            });
                        } else {
                            return res.status(404).json({
                                success: false,
                                message: 'User not found'
                            });
                        }
                    });
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }
    });
    return router;
})();
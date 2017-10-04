const bcrypt = require('bcrypt-nodejs');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const constants = require('../constants');

module.exports = (() => {

    const router = express.Router();

    router.post('/login', (req, res) => {
        // username and password is required
        if (req.body.username && req.body.password) {
            let username = req.body.username;
            let loginType = {};
            if (username.indexOf('@') !== -1) {
                loginType = {
                    email: username
                };
            } else {
                loginType = {
                    username
                };
            }
            console.log(loginType);
            // find user
            User.findOne(loginType, (err, user) => {
                if (err) {
                    return res.status(500).json({
                        success: false
                    });
                }

                // user found
                if (user) {
                    // compare passwords
                    bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                        if (err) {
                            return res.status(500).json({
                                success: false
                            });
                        }

                        // passwords match
                        if (isMatch) {
                            // create jwt
                            // sign with default (HMAC SHA256)
                            let token = jwt.sign({
                                username: user.username
                            }, constants.JWT_SECRET, {
                                expiresIn: '365d'
                            }); // expires in 1 year

                            return res.status(200).json({
                                success: true,
                                token
                            });
                        } else {
                            return res.status(401).json({
                                success: false,
                                message: 'Wrong password'
                            });
                        }
                    });
                } else {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Username and password is required'
            });
        }
    });
    return router;
})();
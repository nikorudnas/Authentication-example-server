const bcrypt = require('bcrypt-nodejs');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const constants = require('../constants');

module.exports = (() => {

    const router = express.Router();

    router.post('/register', (req, res) => {
        // username, email and password is required
        if (req.body.username && req.body.email && req.body.password) {
            let username = req.body.username;
            let email = req.body.email;
            // find user
            User.find({
                username,
                email
            }, (err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Error creating user.'
                    });
                } else {
                    // overwrite plain text password with encrypted password before saving
                    // generate a salt
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                            return res.status(500).json({
                                success: false
                            });
                        }

                        // hash (encrypt) our password using the salt
                        bcrypt.hash(req.body.password, salt, null, (err, hash) => {
                            if (err) {
                                return res.status(500).json({
                                    success: false
                                });
                            }

                            // create user object
                            let user = new User({
                                username,
                                email,
                                password: hash
                            });

                            // save user
                            user.save((err) => {
                                if (err) {
                                    return res.status(409).json({
                                        success: false,
                                        message: 'Username or email taken'
                                    });
                                } else {
                                    // Create and pass token to automatically login after register complete
                                    let token = jwt.sign({ username: user.username }, constants.JWT_SECRET, { expiresIn: '365d' }); // expires in 1 year

                                    return res.status(200).json({
                                        success: true,
                                        message: 'User created',
                                        token
                                    });
                                }
                            });
                        });
                    });
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Username, email and password is required'
            });
        }
    });
    return router;
})();
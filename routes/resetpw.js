const bcrypt = require('bcrypt-nodejs');
const express = require('express');
const crypto = require('crypto');
const User = require('../models/user');
const constants = require('../constants');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: constants.MAIL_USER,
        pass: constants.MAIL_PASSWORD
    }
});

module.exports = (() => {

    const router = express.Router();

    router.post('/resetpw', (req, res) => {
        // username and password is required
        if (req.body.creds) {
            let username = req.body.creds.username;
            let validateType = {};
            if (username.indexOf('@') !== -1) {
                validateType = {
                    email: username
                };
            } else {
                validateType = {
                    username
                };
            }
            // find user
            User.findOne(validateType, (err, user) => {
                if (err) {
                    return res.status(500).json({
                        success: false
                    });
                }
                // user found
                if (user) {

                    let token = crypto.randomBytes(20).toString('hex');

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save((err) => {
                        if (err) {
                            return res.status(409).json({
                                success: false,
                                message: 'Failed creating token. Contact admin.'
                            });
                        } else {
                            // Nodemailer here
                            // setup e-mail data with unicode symbols
                            var mailOptions = {
                                // sender address
                                from: 'Jaws Mediamanager ✔ <Maildemo9999@gmail.com>',
                                // list of receivers
                                to: user.email,
                                // Subject line
                                subject: 'Password reset',
                                // plaintext body
                                text: 'Please follow the link below to reset your email! :)',
                                // rich text html body
                                html: '<p><b>Hello!</b><br/><br/> You requested password reset. Please click this link to create a new password. <p><a href="' + constants.ADDRESS + constants.CLIENT_PORT + '/login/resetpw/try?token=' + token + '">Click here to change password!</a><br/><br/>If the link is not working, copy & paste this to your url: ' + constants.ADDRESS + constants.CLIENT_PORT + '/login/resetpw/try?token=' + token,
                            };

                            transporter.sendMail(mailOptions, (err) => {
                                if (err) {
                                    return res.status(409).json({
                                        success: false,
                                        message: 'Failed sending email. Contact admin.'
                                    });
                                } else {
                                    return res.status(200).json({
                                        success: true,
                                        message: 'Password reset success! Reset link is in your email and it is valid for 1 hour!',
                                        token
                                    });
                                }
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
                message: 'Username or email is required'
            });
        }
    });

    router.post('/confirmpw', (req, res) => {
        console.log(req.body);
        if (req.body.creds) {
            User.findOne({
                'resetPasswordToken': req.body.creds.token
            }, (err, user) => {
                if (err) {
                    return res.status(500).json({
                        success: false
                    });
                }
                // user found
                if (user) {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                            return res.status(500).json({
                                success: false
                            });
                        }

                        // hash (encrypt) our password using the salt
                        bcrypt.hash(req.body.creds.password, salt, null, (err, hash) => {
                            if (err) {
                                return res.status(500).json({
                                    success: false
                                });
                            }

                            user.resetPasswordToken = null;
                            user.resetPasswordExpires = null;
                            user.password = hash;

                            // save user
                            user.save((err) => {
                                if (err) {
                                    return res.status(409).json({
                                        success: false,
                                        message: 'Failed changing password'
                                    });
                                } else {
                                    return res.status(200).json({
                                        success: true,
                                        message: 'Password changed!'
                                    });
                                }
                            });
                        });
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
    return router;
})();
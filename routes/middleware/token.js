var express = require('express');
var jwt = require('jsonwebtoken');
var constants = require('../../constants');

module.exports = (function () {

    var router = express.Router();

    router.use(function (req, res, next) {
        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, constants.JWT_SECRET, function (err, decoded) {
                if (err) { return res.status(401).json({ success: false, message: 'Failed to authenticate token' }); }

                else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();
                }
            });
        }

        else {
            // if there is no token
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
    });
    return router;
})();

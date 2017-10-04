const express = require('express');

const login = require('./login');
const register = require('./register');
const validate = require('./validate');
const resetpw = require('./resetpw');
const tokenMiddleware = require('./middleware/token');

// combine all routes and export them to server.js
// access them from http://localhost:port/api/
const router = express.Router();
router.use(
    login,
    register,
    validate,
    resetpw,
    // everything after this requires a valid jwt token
    tokenMiddleware
);

module.exports = router;
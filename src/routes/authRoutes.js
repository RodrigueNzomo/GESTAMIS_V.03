const express = require('express');
const { signup, signin, verifyOtp } = require('../controllers/authController'); // Import verifyOtp controller

const router = express.Router();

// Signup route
router.post('/signup', signup);

// Signin route
router.post('/signin', signin);

// Verify OTP route
router.post('/verify-otp', verifyOtp);

module.exports = router;

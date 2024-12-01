const mongoose = require('mongoose');
const connectDB = require('./src/config/db'); // Adjust path if necessary
const { signup, verifyOtp, signin } = require('./src/controllers/authController');
require('dotenv').config(); // Load environment variables

// Mock User model for testing
const User = require('./src/models/User'); // Ensure this is your User model

// Static OTP for testing
const TEST_OTP = 123456;

// Store OTP for test usage
let generatedOtp = null;

// Clear previous test data
const clearTestData = async () => {
  console.log("Clearing previous test data...");
  await User.deleteOne({ email: 'test@example.com' });
  console.log("Test data cleared.");
};

// Test Signup
const testSignup = async () => {
  console.log("Testing Signup...");
  const req = {
    body: {
      name: "Test User",
      email: "test@example.com", // Email for which static OTP will be generated
      password: "SecurePassword123",
    },
  };
  const res = {
    status: (statusCode) => ({
      json: (response) => {
        console.log(`Signup Response [${statusCode}]:`, response);
        if (statusCode === 201) {
          // Collect OTP for test email
          generatedOtp = response.otp || TEST_OTP;
          console.log("Collected OTP:", generatedOtp);
        }
      },
    }),
  };
  await signup(req, res);
};

// Test OTP Verification
const testVerifyOtp = async () => {
  console.log("Testing OTP Verification...");
  if (!generatedOtp) {
    console.error("No OTP available to verify.");
    return;
  }
  const req = {
    body: {
      email: "test@example.com",
      otp: generatedOtp, // Use the collected static OTP
    },
  };
  const res = {
    status: (statusCode) => ({
      json: (response) => {
        console.log(`OTP Verification Response [${statusCode}]:`, response);
      },
    }),
  };
  await verifyOtp(req, res);
};

// Test Signin
const testSignin = async () => {
  console.log("Testing Signin...");
  const req = {
    body: {
      email: "test@example.com",
      password: "SecurePassword123",
    },
  };
  const res = {
    status: (statusCode) => ({
      json: (response) => {
        console.log(`Signin Response [${statusCode}]:`, response);
      },
    }),
  };
  await signin(req, res);
};

// Run Tests
const runTests = async () => {
  try {
    await connectDB(); // Connect to MongoDB
    console.log("MongoDB Connected...");
    await clearTestData(); // Clear previous test data
    await testSignup(); // Simulate a user signup
    if (generatedOtp) {
      await testVerifyOtp(); // Verify the collected OTP
      await testSignin(); // Test login with the same credentials
    } else {
      console.error("OTP not collected. Skipping OTP verification and signin.");
    }
  } catch (error) {
    console.error("Test Error:", error.message);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

runTests();

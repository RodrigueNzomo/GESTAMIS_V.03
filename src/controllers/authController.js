const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Signup controller
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    console.log('Signup Request:', { name, email });

    if (!name || !email || !password) {
      console.error('Signup Error: Missing fields');
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.error('Signup Error: User already exists for email:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Use a static OTP for testing email, dynamic OTP for others
    const otp = email === 'test@example.com' ? 123456 : crypto.randomInt(100000, 999999);
    console.log('Generated OTP:', otp);

    // Save the user without explicit password hashing
    const user = new User({
      name,
      email,
      password, // Plain password; hashing is handled by the User model's pre-save hook
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
      isVerified: false,
    });

    // Add logging before saving
    console.log('User before saving (Pre-save):', {
      name: user.name,
      email: user.email,
      password: user.password,
      otp: user.otp,
    });

    await user.save();

    console.log('User saved successfully:', { id: user._id, email: user.email });

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Account Verification',
      text: `Hello ${name},\n\nYour OTP for account verification is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);

    res.status(201).json({
      message: 'OTP sent to your email. Please verify your account.',
      otp: email === 'test@example.com' ? otp : undefined, // Include OTP only for testing email
    });
  } catch (error) {
    console.error('Signup Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// OTP Verification controller
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    console.log('OTP Verification Request:', { email, otp });

    const user = await User.findOne({ email });
    if (!user) {
      console.error('OTP Verification Error: User not found for email:', email);
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    console.log('Stored OTP:', user.otp);
    console.log('Stored OTP Type:', typeof user.otp);
    console.log('Received OTP:', otp);
    console.log('Received OTP Type:', typeof otp);

    const providedOtp = parseInt(otp, 10); // Convert to integer
    const storedOtp = parseInt(user.otp, 10); // Ensure stored OTP is also treated as integer

    if (providedOtp !== storedOtp) {
      console.error(
        `OTP Verification Error: OTP mismatch. Provided OTP: ${providedOtp}, Stored OTP: ${storedOtp}`
      );
      return res.status(400).json({ message: 'OTP is invalid' });
    }

    if (user.otpExpires < Date.now()) {
      console.error('OTP Verification Error: OTP expired for email:', email);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Update user after successful OTP verification
    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;
    await user.save();

    console.log('OTP verified successfully for email:', email);
    res.status(200).json({ message: 'Account verified successfully' });
  } catch (error) {
    console.error('OTP Verification Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Signin controller
const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Signin Request:', { email });

    const user = await User.findOne({ email });
    if (!user) {
      console.error('Signin Error: User not found for email:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      console.error('Signin Error: Account not verified for email:', email);
      return res.status(400).json({ message: 'Please verify your account before signing in' });
    }

    console.log('Database Password (Hashed):', user.password);
    console.log('Provided Password (Plaintext):', password);

    // Use the comparePassword instance method for password comparison
    const isMatch = await user.comparePassword(password);
    console.log('Password Match Result:', isMatch);

    if (!isMatch) {
      console.error('Signin Error: Password mismatch for email:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Signin successful for email:', email);

    // Send response with token
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Signin Error:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = { signup, verifyOtp, signin };

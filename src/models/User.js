const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true }, // Hashed password
    otp: { type: String }, // OTP sent to the user's email
    otpExpires: { type: Date, default: () => Date.now() + 10 * 60 * 1000 }, // OTP valid for 10 minutes
    isVerified: { type: Boolean, default: false }, // Email verification status
  },
  { timestamps: true }
);

// Middleware to hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  console.log('Original Password Before Hashing:', this.password);
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('Hashed Password Before Saving:', this.password);
  next();
});

// Middleware to convert email to lowercase before saving
userSchema.pre('save', function (next) {
  this.email = this.email.toLowerCase();
  next();
});

// Instance method to compare the provided password with the hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    console.error('Error comparing passwords:', err.message);
    throw err;
  }
};

// Instance method to compare the provided OTP with the stored OTP
userSchema.methods.compareOtp = function (candidateOtp) {
  return candidateOtp === this.otp;
};

module.exports = mongoose.model('User', userSchema);

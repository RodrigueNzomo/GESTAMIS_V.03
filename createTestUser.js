const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./src/models/User'); // Adjust path to your User model

const updatePassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://techleapproject:biTXFeE8YIvVufHZ@cluster0.izv9u.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 's.habiyambe@alustudent.com' });
    if (!user) {
      console.log('User not found');
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash('testpassword', 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    console.log('Password updated successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating password:', error);
  }
};

updatePassword();

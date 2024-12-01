const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB using the connection string from the environment variables
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);

    // Exit the process if the database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;


const bcrypt = require('bcrypt');

// Signup function: hashing the password
function signup(password) {
    const saltRounds = 10; // Higher values increase computation time
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    return hashedPassword;
}

// Login function: comparing the password
function login(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
}

// Test the functionality
const plainPassword = "SecurePassword123"; // Password entered by user at signup
const hashedPw = signup(plainPassword);
console.log(`Hashed Password (Signup): ${hashedPw}`);

// Simulating login
const enteredPassword = "SecurePassword123"; // Password entered by user at login
if (login(enteredPassword, hashedPw)) {
    console.log("Login successful: Passwords match!");
} else {
    console.log("Login failed: Passwords do not match!");
}

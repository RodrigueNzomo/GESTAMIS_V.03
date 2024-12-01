const bcrypt = require('bcrypt');

const testPasswordComparison = async () => {
  const plainPassword = 'SecurePassword123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  console.log('Plain Password:', plainPassword);
  console.log('Hashed Password:', hashedPassword);

  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('Password Match Result:', isMatch); // Should be true
};

testPasswordComparison().catch((err) => console.error('Error:', err.message));

const bcrypt = require('bcryptjs');

// The password from seed
const plainPassword = 'password123';

// The hash from the database (from the screenshot)
const hashFromDB = '$2a$10$SKuKgB2Ar/.WJZIZr...'; // You'll need to copy the full hash

// Test if they match
bcrypt.compare(plainPassword, hashFromDB).then(result => {
  console.log('Password matches:', result);
  
  // Also generate a new hash to compare
  bcrypt.hash(plainPassword, 10).then(newHash => {
    console.log('New hash generated:', newHash);
    
    // Test the new hash
    bcrypt.compare(plainPassword, newHash).then(result2 => {
      console.log('New hash matches:', result2);
    });
  });
});

// Made with Bob

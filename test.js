import jwt from 'jsonwebtoken';

// Function to generate a JWT token
const generateToken = (userId) => {
  // Create payload (usually includes user-specific info)
  const payload = { id: userId };

  // Generate the JWT token, signed with a secret key
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h', // Token expiry time (can be adjusted as needed)
  });

  return token;
};

generateToken();

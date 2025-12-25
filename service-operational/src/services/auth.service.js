// service-operational/src/services/auth.service.js
import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs'; // <--- Commented out: Not used for plain text

// Register Service
export const registerUserService = async (username, email, password, role) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }
  
  // WARNING: Storing password in plain text!
  const user = await User.create({ username, email, password, role });
  return user;
};

// Login Service
export const loginService = async (email, password) => {
  // 1. Find User
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // 2. Verify Password (DIRECT STRING COMPARISON)
  // We check if the input password exactly matches the database field
  if (password !== user.password) {
    throw new Error('Invalid credentials');
  }

  // 3. Generate Token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret_key', 
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  };
};
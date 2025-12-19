// service-operational/src/services/auth.service.js
import User from '../models/User.model.js';

/**
 * Handles the business logic for registering a user:
 * 1. Checks if email is already taken
 * 2. Creates the user in the database
 * 3. Returns the clean user object
 */
export const registerUserService = async (username, email, password, role) => {
  // 1. Check for duplicates
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }

  // 2. Create User
  // Note: Password hashing should happen here or in a pre-save hook in the Model
  const user = await User.create({
    username,
    email,
    password, 
    role: role || 'STAFF'
  });

  return user;
};
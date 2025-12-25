// service-operational/src/controllers/auth.controller.js
import { registerUserService } from '../services/auth.service.js';
import { loginService } from '../services/auth.service.js';

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // 1. Input Validation (Basic)
    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please add all fields');
    }

    // 2. Call the Service (Business Logic)
    const user = await registerUserService(username, email, password, role);

    // 3. Send Response
    // We only return public fields, keeping security tight
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    // 4. Pass to global error middleware
    // If the error is "User already exists", the middleware will handle it safely
    next(error);
  }
};


// @desc    Login user & get token
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Call the service
    const data = await loginService(email, password);
    
    res.json(data);
  } catch (err) {
    // If "Invalid credentials", send 401
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ message: err.message });
    }
    next(err);
  }
};
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { asyncHandler } from './hackathon.controller';

const JWT_SECRET = process.env.JWT_SECRET || 'hacktrack_fallback_jwt_secret_998822';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

// Generate token helper
const generateToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({
      success: false,
      data: null,
      error: 'Please provide name, email, and password',
    });
    return;
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({
      success: false,
      data: null,
      error: 'User already exists with this email',
    });
    return;
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      },
    });
  } else {
    res.status(450).json({
      success: false,
      data: null,
      error: 'Invalid user data provided',
    });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      data: null,
      error: 'Please provide email and password',
    });
    return;
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      },
    });
  } else {
    res.status(401).json({
      success: false,
      data: null,
      error: 'Invalid email or password credentials',
    });
  }
});

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: any, res: Response) => {
  // User will be appended to req object by authorization middleware
  if (!req.user) {
    res.status(401).json({
      success: false,
      data: null,
      error: 'Not authorized, profile unavailable',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

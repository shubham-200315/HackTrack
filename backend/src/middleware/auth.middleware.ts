import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { asyncHandler } from '../controllers/hackathon.controller';

const JWT_SECRET = process.env.JWT_SECRET || 'hacktrack_fallback_jwt_secret_998822';

export const protect = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        res.status(401).json({
          success: false,
          data: null,
          error: 'Not authorized, token missing',
        });
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

      // Get user from the token and inject into request
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401).json({
          success: false,
          data: null,
          error: 'User not found in system record',
        });
        return;
      }

      next();
    } catch (err: any) {
      console.error('JWT Auth Error:', err.message);
      res.status(401).json({
        success: false,
        data: null,
        error: 'Not authorized, token expired or invalid',
      });
    }
  } else {
    res.status(401).json({
      success: false,
      data: null,
      error: 'Not authorized, no authorization header found',
    });
  }
});

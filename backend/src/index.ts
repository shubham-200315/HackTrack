import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import hackathonRoutes from './routes/hackathon.routes';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins or specify React app URL in production
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'HackTrack Server is healthy and running.',
    timestamp: new Date().toISOString(),
  });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/hackathons', hackathonRoutes);

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    data: null,
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error: ', err);
  
  res.status(err.status || 500).json({
    success: false,
    data: null,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hacktrack';
    
    // Mongoose connection options (defaults are sufficient in newer mongoose versions)
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoURI);
    
    console.log('Successfully connected to MongoDB.');
  } catch (error) {
    console.error('Database connection error: ', error);
    process.exit(1);
  }
};

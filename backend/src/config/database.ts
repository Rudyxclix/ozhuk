import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export async function connectDatabase(): Promise<boolean> {
  const uri = config.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.warn('⚠️  MONGODB_URI is not set. Database persistence is unavailable.');
    isConnected = false;
    return false;
  }

  try {
    // Sanitize URI for safe console logging (mask password)
    const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`🔌 Connecting to MongoDB: ${sanitizedUri}`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
      isConnected = true;
    });

    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ Failed to connect to MongoDB:', message);
    isConnected = false;
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🛑 MongoDB connection closed');
  }
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

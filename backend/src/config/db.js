import mongoose from 'mongoose';

export async function connectDB() {
  // some .env values may be quoted; strip surrounding double-quotes if present
  const raw = process.env.MONGODB_URI;
  const uri = raw ? raw.replace(/^\"(.*)\"$/, '$1') : raw;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment');
  }

  // Mongoose connection options - keep defaults but set recommended flags
  await mongoose.connect(uri, {
    autoIndex: true,
    // other options can be added as needed
  });

  mongoose.connection.on('connected', () => {
    // connection established
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  return mongoose;
}

export default mongoose;

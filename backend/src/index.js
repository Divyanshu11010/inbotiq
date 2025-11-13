import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB();

    // Use Express's built-in listen helper for simplicity. It returns an http.Server instance.
    const server = app.listen(PORT, () => {
      console.info(`Server listening on port ${PORT}`);
    });

    // Graceful shutdown handling
    const graceful = () => {
      console.info('Shutting down');
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGINT', graceful);
    process.on('SIGTERM', graceful);
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

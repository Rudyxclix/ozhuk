import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { config } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { healthRoutes } from './routes/health.js';
import { reportRoutes } from './routes/reports.js';
import { wardRoutes } from './routes/wards.js';
import { uploadRoutes } from './routes/uploads.js';

export async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: config.NODE_ENV === 'development' ? 'info' : 'warn',
    },
  });

  // Enable CORS
  await fastify.register(cors, {
    origin: [config.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Enable Multipart with 10MB limit
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
      files: 1,
    },
  });

  // Register Routes
  await fastify.register(healthRoutes, { prefix: '/api' });
  await fastify.register(reportRoutes, { prefix: '/api/reports' });
  await fastify.register(wardRoutes, { prefix: '/api/wards' });
  await fastify.register(uploadRoutes, { prefix: '/api/uploads' });

  // Root endpoint info
  fastify.get('/', async () => {
    return {
      service: 'Ozhuk Civic Drainage Platform API',
      version: '0.2.0',
      endpoints: {
        health: '/api/health',
        reports: '/api/reports',
        stats: '/api/reports/stats',
        ticketLookup: '/api/reports/ticket/:ticketId',
        wards: '/api/wards',
      },
    };
  });

  return fastify;
}

async function start() {
  try {
    // Attempt database connection before listening
    await connectDatabase();

    const server = await buildServer();
    await server.listen({ port: config.PORT, host: config.HOST });
    console.log(`🌊 Ozhuk API Server running at http://${config.HOST}:${config.PORT}`);

    // Handle graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`\nReceived ${signal}, shutting down gracefully...`);
        await server.close();
        await disconnectDatabase();
        process.exit(0);
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

import { FastifyPluginAsync } from 'fastify';
import { isDatabaseConnected } from '../config/database.js';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (request, reply) => {
    const dbConnected = isDatabaseConnected();

    const response = {
      status: dbConnected ? 'ok' : 'degraded',
      database: dbConnected ? 'connected' : 'disconnected',
      service: 'ozhuk-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    if (!dbConnected) {
      return reply.code(503).send(response);
    }

    return response;
  });
};

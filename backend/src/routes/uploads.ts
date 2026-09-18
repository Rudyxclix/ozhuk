import { FastifyPluginAsync } from 'fastify';
import { Readable } from 'node:stream';
import { gridFSService } from '../services/gridfsService.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadRoutes: FastifyPluginAsync = async (fastify) => {
  // Stream photo directly into MongoDB Atlas GridFS
  fastify.post('/', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({
          error: 'No file uploaded',
          message: 'Please provide an image file with field name "file"',
        });
      }

      if (!ALLOWED_MIME_TYPES.includes(data.mimetype.toLowerCase())) {
        // Drain stream to avoid hanging client socket
        (data.file as unknown as Readable).resume();
        return reply.code(400).send({
          error: 'Unsupported media type',
          message: `Only JPEG, PNG, and WebP images are supported. Received: ${data.mimetype}`,
        });
      }

      const result = await gridFSService.uploadStream(
        data.file,
        data.filename || 'evidence.jpg',
        data.mimetype.toLowerCase()
      );

      // Check if file was truncated due to limit
      if (data.file.truncated) {
        return reply.code(413).send({
          error: 'Payload Too Large',
          message: 'Image exceeds maximum allowed size of 10 MB',
        });
      }

      return reply.code(201).send(result);
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || 500;
      fastify.log.error({ err }, 'Error handling POST /api/uploads');
      return reply.code(statusCode).send({
        error: statusCode === 503 ? 'Database Service Unavailable' : 'Failed to upload photo',
        message: error.message || 'An unexpected error occurred during photo storage',
      });
    }
  });

  // Stream photo directly out of MongoDB Atlas GridFS
  fastify.get('/:fileId', async (request, reply) => {
    try {
      const { fileId } = request.params as { fileId: string };
      const fileInfo = await gridFSService.getFileStream(fileId);

      reply.header('Content-Type', fileInfo.contentType);
      reply.header('Content-Length', fileInfo.length);
      reply.header('Cache-Control', 'public, max-age=31536000, immutable');
      reply.header('Content-Disposition', `inline; filename="${encodeURIComponent(fileInfo.fileName)}"`);

      return reply.send(fileInfo.stream);
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || 500;
      if (statusCode === 404) {
        return reply.code(404).send({
          error: 'Photo not found',
          message: 'The requested photo does not exist in storage',
        });
      }
      if (statusCode === 400) {
        return reply.code(400).send({
          error: 'Invalid identifier',
          message: 'The provided photo ID is malformed',
        });
      }
      return reply.code(statusCode).send({
        error: statusCode === 503 ? 'Database Service Unavailable' : 'Failed to retrieve photo',
        message: error.message || 'An unexpected error occurred during photo retrieval',
      });
    }
  });
};

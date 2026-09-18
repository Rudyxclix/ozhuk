import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { reportService } from '../services/reportService.js';

const createReportSchema = z.object({
  category: z.enum(['STORM_DRAIN', 'CANAL', 'CULVERT', 'OTHER']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  wardNumber: z.string().min(1),
  wardName: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  landmark: z.string().min(1),
  description: z.string().min(1),
  photoUrl: z.string().optional(),
  photoFileName: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED']),
  actor: z.string().min(1),
  notes: z.string().optional(),
  resolutionPhotoUrl: z.string().optional(),
});

const assignReportSchema = z.object({
  assignedTo: z.string().min(1),
  actor: z.string().min(1),
  notes: z.string().optional(),
});

const escalateReportSchema = z.object({
  actor: z.string().min(1),
  notes: z.string().optional(),
});

const resolveReportSchema = z.object({
  actor: z.string().min(1),
  notes: z.string().min(3, 'Resolution notes are required and must be at least 3 characters long'),
  resolutionPhotoUrl: z.string().optional(),
});

export const reportRoutes: FastifyPluginAsync = async (fastify) => {
  // List all reports with optional filters (Full model for authority view)
  fastify.get('/', async (request, reply) => {
    try {
      const query = request.query as { ward?: string; status?: string; severity?: string };
      const reports = await reportService.listReports(query);
      return { data: reports, count: reports.length };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || 500;
      return reply.code(statusCode).send({
        error: statusCode === 503 ? 'Database Service Unavailable' : 'Failed to fetch reports',
        message: error.message || 'An error occurred',
      });
    }
  });

  // Public Safe Open-Report Feed (Strict projection: excludes reporterId, internal IDs, authority audit notes)
  fastify.get('/public', async (request, reply) => {
    try {
      const query = request.query as { ward?: string; status?: string; severity?: string };
      const publicReports = await reportService.listPublicReports(query);
      return { data: publicReports, count: publicReports.length };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || 500;
      return reply.code(statusCode).send({
        error: statusCode === 503 ? 'Database Service Unavailable' : 'Failed to fetch public reports',
        message: error.message || 'An error occurred',
      });
    }
  });

  // Summary statistics
  fastify.get('/stats', async (request, reply) => {
    try {
      const stats = await reportService.getSummaryStats();
      return { data: stats };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || 500;
      return reply.code(statusCode).send({
        error: statusCode === 503 ? 'Database Service Unavailable' : 'Failed to calculate stats',
        message: error.message || 'An error occurred',
      });
    }
  });

  // Lookup by ticket ID (for public ticket check & citizen tracking)
  fastify.get('/ticket/:ticketId', async (request, reply) => {
    try {
      const { ticketId } = request.params as { ticketId: string };
      const report = await reportService.getReportByTicketId(ticketId);
      if (!report) {
        return reply.code(404).send({ error: 'Ticket not found', ticketId });
      }
      return { data: report };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || 500;
      return reply.code(statusCode).send({
        error: statusCode === 503 ? 'Database Service Unavailable' : 'Failed to query ticket',
        message: error.message || 'An error occurred',
      });
    }
  });

  // Get single report by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const report = await reportService.getReportById(id);
      if (!report) {
        return reply.code(404).send({ error: 'Report not found', id });
      }
      return { data: report };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || 500;
      return reply.code(statusCode).send({
        error: statusCode === 503 ? 'Database Service Unavailable' : 'Failed to query report',
        message: error.message || 'An error occurred',
      });
    }
  });

  // Create new citizen report
  fastify.post('/', async (request, reply) => {
    try {
      const parseResult = createReportSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          message: 'Invalid report payload submitted',
          details: parseResult.error.format(),
        });
      }
      const report = await reportService.createReport(parseResult.data);
      return reply.code(201).send({ data: report });
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || 500;
      fastify.log.error({ err }, 'Error handling POST /api/reports');
      return reply.code(statusCode).send({
        error: statusCode === 503 ? 'Database Service Unavailable' : 'Failed to create report',
        message: error.message || 'An unexpected error occurred',
      });
    }
  });

  // Assign officer
  fastify.patch('/:id/assign', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const parseResult = assignReportSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.code(400).send({ error: 'Validation failed', details: parseResult.error.format() });
      }
      const updated = await reportService.assignReport(id, parseResult.data);
      if (!updated) {
        return reply.code(404).send({ error: 'Report not found', id });
      }
      return { data: updated };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || 500;
      return reply.code(statusCode).send({
        error: statusCode === 503 ? 'Database Service Unavailable' : (statusCode === 400 ? 'Bad Request' : 'Failed to assign report'),
        message: error.message || 'An unexpected error occurred',
      });
    }
  });

  // Update report status (e.g. Start Work -> IN_PROGRESS)
  fastify.patch('/:id/status', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const parseResult = updateStatusSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.code(400).send({ error: 'Validation failed', details: parseResult.error.format() });
      }
      const updated = await reportService.updateStatus(id, parseResult.data);
      if (!updated) {
        return reply.code(404).send({ error: 'Report not found', id });
      }
      return { data: updated };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || 500;
      return reply.code(statusCode).send({
        error: statusCode === 503 ? 'Database Service Unavailable' : (statusCode === 400 ? 'Bad Request' : 'Failed to update report status'),
        message: error.message || 'An unexpected error occurred',
      });
    }
  });

  // Escalate report
  fastify.post('/:id/escalate', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const parseResult = escalateReportSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.code(400).send({ error: 'Validation failed', details: parseResult.error.format() });
      }
      const updated = await reportService.escalateReport(id, parseResult.data.actor, parseResult.data.notes);
      if (!updated) {
        return reply.code(404).send({ error: 'Report not found', id });
      }
      return { data: updated };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || 500;
      return reply.code(statusCode).send({
        error: statusCode === 503 ? 'Database Service Unavailable' : (statusCode === 400 ? 'Bad Request' : 'Failed to escalate report'),
        message: error.message || 'An unexpected error occurred',
      });
    }
  });

  // Resolve report with mandatory resolution notes
  fastify.post('/:id/resolve', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const parseResult = resolveReportSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.code(400).send({ error: 'Validation failed', details: parseResult.error.format() });
      }
      const updated = await reportService.resolveReport(
        id,
        parseResult.data.actor,
        parseResult.data.notes,
        parseResult.data.resolutionPhotoUrl
      );
      if (!updated) {
        return reply.code(404).send({ error: 'Report not found', id });
      }
      return { data: updated };
    } catch (err: unknown) {
      const error = err as { statusCode?: number; message?: string };
      const statusCode = error.statusCode || 500;
      return reply.code(statusCode).send({
        error: statusCode === 503 ? 'Database Service Unavailable' : (statusCode === 400 ? 'Bad Request' : 'Failed to resolve report'),
        message: error.message || 'An unexpected error occurred',
      });
    }
  });
};

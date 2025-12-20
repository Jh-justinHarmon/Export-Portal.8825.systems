
import { z } from 'zod';
import { insertExportJobSchema, exportJobs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  export: {
    create: {
      method: 'POST' as const,
      path: '/api/export',
      input: z.object({
        markdown: z.string(),
        target: z.enum(['email', 'docx', 'pdf']),
      }),
      responses: {
        200: z.object({
          job_id: z.string(),
          status: z.string(),
          message: z.string(),
        }),
        400: errorSchemas.validation,
      },
    },
  },
  jobs: {
    get: {
      method: 'GET' as const,
      path: '/api/jobs/:id',
      responses: {
        200: z.custom<typeof exportJobs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    pending: {
      method: 'GET' as const,
      path: '/api/jobs/pending',
      input: z.object({
        limit: z.coerce.number().min(1).max(100).optional().default(10),
      }).optional(),
      responses: {
        200: z.object({
          jobs: z.array(z.custom<typeof exportJobs.$inferSelect>()),
        }),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/jobs/:id',
      input: z.object({
        status: z.enum(['pending', 'processing', 'complete', 'failed']).optional(),
        artifactUrl: z.string().optional(),
        error: z.string().optional(),
        completedAt: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof exportJobs.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

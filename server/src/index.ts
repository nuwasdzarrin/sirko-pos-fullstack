import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { bearer } from '@elysiajs/bearer';
import { config } from 'dotenv';
import { db } from './database';

// Load environment variables
config({ path: '.env' });

const PORT = Number(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create Elysia app
const app = new Elysia({
  prefix: '/api/v1',
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
  },
})
  .use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  }))
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      exp: process.env.JWT_EXPIRES_IN || '1h',
    })
  )
  .use(bearer())
  .decorate('db', db)
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  }))
  .get('/health/db', async ({ db }) => {
    try {
      // Test database connection
      await db.select().limit(1);
      return {
        status: 'ok',
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  })
  .onError(({ error, code }) => {
    console.error(`Error (${code}):`, error);

    switch (code) {
      case 'VALIDATION':
        return {
          success: false,
          error: 'Validation Error',
          details: error.all,
        };
      case 'NOT_FOUND':
        return {
          success: false,
          error: 'Resource not found',
        };
      case 'INTERNAL_SERVER_ERROR':
        return {
          success: false,
          error: 'Internal server error',
        };
      default:
        return {
          success: false,
          error: 'An unexpected error occurred',
        };
    }
  })
  .listen(PORT);

console.log(`🚀 Sirko POS Server is running on port ${PORT}`);
console.log(`📊 Health check: http://localhost:${PORT}/api/v1/health`);
console.log(`💾 Database health: http://localhost:${PORT}/api/v1/health/db`);
console.log(`🌍 Environment: ${NODE_ENV}`);
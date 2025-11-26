import compression from 'compression'
import cors from 'cors'
import express, { type Application, type Request, type Response } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import prisma from './lib/prisma.js'
import logger from './lib/logger.js'
import adminRouter from './routes/admin/index.js'
import authRouter from './routes/auth.js'
import publicRouter from './routes/public.js'
import { authenticate } from './middlewares/authenticate.js'
import { authorizeAdmin } from './middlewares/authorize-admin.js'
import { errorHandler } from './middlewares/error-handler.js'
import { notFoundHandler } from './middlewares/not-found-handler.js'
import { generalRateLimiter } from './middlewares/rate-limit.js'

const app: Application = express()

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
)

// Compression
app.use(compression())

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin: string) => origin.trim()).filter(Boolean)
  : []

const corsOptions: cors.CorsOptions = {
  origin:
    allowedOrigins.length > 0
      ? (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
          } else {
            callback(new Error('Não permitido pelo CORS'))
          }
        }
      : process.env.NODE_ENV === 'development'
        ? true
        : false,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))

// Body parsing with size limit
const maxPayloadSize = process.env.MAX_PAYLOAD_SIZE || '10mb'
app.use(express.json({ limit: maxPayloadSize }))
app.use(express.urlencoded({ extended: true, limit: maxPayloadSize }))

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => {
          logger.info({ msg: message.trim() })
        },
      },
    }),
  )
}

// Health check with database verification
app.get('/health', async (_request: Request, response: Response) => {
  try {
    // Verificar conexão com banco de dados
    await prisma.$queryRaw`SELECT 1`
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      },
    }
    
    response.json(health)
  } catch (error) {
    logger.error({ err: error }, 'Health check failed')
    response.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    })
  }
})

// Rate limiting
app.use(generalRateLimiter)

app.use('/api/auth', authRouter)
app.use('/api', publicRouter)
app.use('/api/admin', authenticate, authorizeAdmin, adminRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app

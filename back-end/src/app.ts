import cors from 'cors'
import express, { type Application, type Request, type Response } from 'express'
import morgan from 'morgan'
import adminRouter from './routes/admin/index.js'
import authRouter from './routes/auth.js'
import publicRouter from './routes/public.js'
import { authenticate } from './middlewares/authenticate.js'
import { authorizeAdmin } from './middlewares/authorize-admin.js'
import { errorHandler } from './middlewares/error-handler.js'
import { notFoundHandler } from './middlewares/not-found-handler.js'

const app: Application = express()

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin: string) => origin.trim()).filter(Boolean)
  : undefined

app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: false,
  }),
)
app.use(express.json())

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.get('/health', (_request: Request, response: Response) => {
  response.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api', publicRouter)
app.use('/api/admin', authenticate, authorizeAdmin, adminRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app

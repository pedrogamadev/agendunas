import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import adminRouter from './routes/admin/index.js'
import publicRouter from './routes/public.js'
import { errorHandler } from './middlewares/error-handler.js'
import { notFoundHandler } from './middlewares/not-found-handler.js'

const app = express()

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null

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

app.get('/health', (request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api', publicRouter)
app.use('/api/admin', adminRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app

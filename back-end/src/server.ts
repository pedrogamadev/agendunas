import app from './app.js'
import logger from './lib/logger.js'

const port = Number.parseInt(process.env.PORT ?? '3001', 10)

app.listen(port, () => {
  logger.info({ port }, 'API AgenDunas iniciada')
})

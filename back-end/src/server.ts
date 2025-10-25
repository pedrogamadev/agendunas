import app from './app.js'

const port = Number.parseInt(process.env.PORT ?? '3001', 10)

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API AgenDunas disponível em http://localhost:${port}`)
})

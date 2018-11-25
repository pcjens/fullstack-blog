const logger = (req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(req.method, req.path, '-', req.body)
  }
  next()
}

const error = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = (req, res, next) => {
  const auth = req.get('authorization')
  if (auth !== undefined && auth.toLowerCase().startsWith('bearer ')) {
    req.token = auth.substring(7)
  }
  next()
}

module.exports = {
  logger,
  error,
  tokenExtractor
}

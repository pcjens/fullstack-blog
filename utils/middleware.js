const logger = (req, res, next) => {
  console.log(req.method, req.path, '-', req.body)
  next()
}

const error = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

module.exports = {
  logger,
  error
}

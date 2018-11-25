const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

const config = require('./utils/config')
const middleware = require('./utils/middleware')
const blogRouter = require('./controllers/blog')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

mongoose
  .connect(config.mongoUrl, { useNewUrlParser: true })
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('connected to database:', config.mongoUrlDisplay)
    }
  })
  .catch(err => console.log(err))
mongoose.set('useFindAndModify', false)

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('build'))

app.use(middleware.tokenExtractor)
app.use(middleware.logger)
app.use('/api/blogs', blogRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(middleware.error)

const server = http.createServer(app)

server.listen(config.port, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`Server running on port ${config.port}`)
  }
})

server.on('close', () => {
  mongoose.connection.close()
})

module.exports = {
  app, server
}

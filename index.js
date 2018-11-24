const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

const middleware = require('./utils/middleware')
const blogRouter = require('./controllers/blog')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const MONGODB_URI = process.env.MONGODB_URI
// Hide the password for display in stdout
const MONGODB_URI_DISPLAY = MONGODB_URI.replace(/\:[^//](.*)\@/, ':***@')
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => console.log('connected to database:', MONGODB_URI_DISPLAY))
  .catch(err => console.log(err))

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('build'))

app.use(middleware.logger)
app.use('/api/blogs', blogRouter)
app.use(middleware.error)

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

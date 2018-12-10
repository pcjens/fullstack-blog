if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

let mongoUrl = process.env.MONGODB_URI
let port = process.env.PORT | 3003

if (process.env.NODE_ENV === 'test') {
  port = process.env.TEST_PORT
  mongoUrl = process.env.TEST_MONGODB_URI
}

// Hide the password for display in stdout
const mongoUrlDisplay = mongoUrl.replace(/:[^//](.*)@/, ':***@')

module.exports = {
  mongoUrl, mongoUrlDisplay, port
}

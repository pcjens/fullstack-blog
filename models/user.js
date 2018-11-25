const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  ofAge: Boolean,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
})

userSchema.statics.format = (user) => {
  return {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    ofAge: user.ofAge,
    blogs: user.blogs
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User

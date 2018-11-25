const Blog = require('../models/blog')
const User = require('../models/user')

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(Blog.format)
}

const nonExistentId = async() => {
  const blog = new Blog()
  await blog.save()
  await blog.remove()
  return Blog.format(blog).id
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(User.format)
}

module.exports = {
  blogsInDb, nonExistentId, usersInDb
}

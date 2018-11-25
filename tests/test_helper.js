const Blog = require('../models/blog')

const format = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes
  }
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(format)
}

module.exports = {
  blogsInDb, format
}

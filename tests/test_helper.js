const Blog = require('../models/blog')

const format = (blog) => {
  return {
    _id: blog._id.toString(),
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

const nonExistentId = async() => {
  const blog = new Blog()
  await blog.save()
  await blog.remove()
  return format(blog)._id
}

module.exports = {
  blogsInDb, format, nonExistentId
}

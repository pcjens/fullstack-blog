const Blog = require('../models/blog')
const User = require('../models/user')

const blogRouter = require('express').Router()

blogRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog
      .find({})
      .populate('user', { username: 1, name: 1 })
    response.json(blogs.map(Blog.format))
  } catch (exception) {
    response.status(500).end()
  }
})

blogRouter.post('/', async (request, response) => {
  try {
    const body = request.body
    const newBlog = {
      likes: body.likes | 0,
      title: body.title,
      url: body.url,
      author: body.author,
    }

    if (newBlog.title === undefined) {
      return response.status(400).send({ error: 'title missing' })
    }
    if (newBlog.url === undefined) {
      return response.status(400).send({ error: 'url missing' })
    }
    if (body.userId === undefined) {
      return response.status(400).send({ error: 'userId missing' })
    }

    let user
    try {
      user = await User.findById(body.userId)
    } catch (exception) {
      return response.status(400).json({ error: 'userId not found in the database' })
    }

    newBlog.user = user._id
    const blog = new Blog(newBlog)
    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    await user.save()

    return response.status(201).json(Blog.format(result))
  } catch (exception) {
    console.log(exception)
    return response.status(500).end()
  }
})

blogRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    response.status(400).json({ error: 'malformatted id' })
  }
})

blogRouter.put('/:id', async (request, response) => {
  try {
    let updated = {}
    if (request.body.likes) updated.likes = request.body.likes
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, updated, { new: true })
    response.json(Blog.format(updatedBlog))
  } catch (exception) {
    response.status(400).json({ error: 'malformatted id' })
  }
})

module.exports = blogRouter

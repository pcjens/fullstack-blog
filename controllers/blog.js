const jwt = require('jsonwebtoken')
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
    if (!request.token) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const userId = decodedToken.id

    if (!userId) {
      return response.status(401).json({ error: 'token invalid' })
    }

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

    let user = await User.findById(userId)

    newBlog.user = user._id
    const blog = new Blog(newBlog)
    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    await user.save()

    return response.status(201).json(Blog.format(result))
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      return response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      return response.status(500).end()
    }
  }
})

blogRouter.delete('/:id', async (request, response) => {
  try {
    const blogToUpdate = await Blog.findById(request.params.id)
    if (blogToUpdate.user !== undefined) {
      if (!request.token) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }

      const decodedToken = jwt.verify(request.token, process.env.SECRET)
      const userId = decodedToken.id

      if (!userId) {
        return response.status(401).json({ error: 'token invalid' })
      }

      if (blogToUpdate.user.toString() !== userId) {
        return response.status(401).json({ error: 'not the owner of the blog' })
      }
    }

    await Blog.findByIdAndRemove(request.params.id)
    return response.status(204).end()
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      return response.status(401).json({ error: exception.message })
    } else {
      return response.status(400).json({ error: 'malformatted id' })
    }
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

blogRouter.get('/:id/comments', async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id)
    response.json(blog.comments)
  } catch (exception) {
    response.status(400).json({ error: 'malformatted id' })
  }
})

blogRouter.post('/:id/comments', async (request, response) => {
  try {
    if (request.body.comment === undefined)
      return response.status(400).json({ error: 'missing comment' })

    const blog = await Blog.findById(request.params.id)
    const comments = blog.comments.concat(request.body.comment)
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, { comments }, { new: true })
    return response.status(201).json(updatedBlog.comments)
  } catch (exception) {
    return response.status(400).json({ error: 'malformatted id' })
  }
})

module.exports = blogRouter

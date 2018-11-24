const Blog = require('../models/blog')

const blogRouter = require('express').Router()

blogRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

blogRouter.post('/', (request, response) => {
  const newBlog = { ...request.body }
  newBlog.likes |= 0
  if (!newBlog.title) return response.status(400).send({ error: 'title missing' })
  if (!newBlog.url) return response.status(400).send({ error: 'url missing' })
  const blog = new Blog(newBlog)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})

module.exports = blogRouter

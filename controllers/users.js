const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async(req, res) => {
  const users = await User
    .find({})
    .populate('blogs', { likes: 1, author: 1, title: 1, url: 1 })
  res.json(users.map(User.format))
})

usersRouter.post('/', async (req, res) => {
  try {
    const body = req.body

    if (body.username === undefined) {
      return res.status(400).json({ error: 'missing field: username' })
    }
    if (body.name === undefined) {
      return res.status(400).json({ error: 'missing field: name' })
    }
    if (body.password === undefined) {
      return res.status(400).json({ error: 'missing field: password' })
    }
    if (body.password.length <= 3) {
      return res.status(400).json({ error: 'password should be longer than 3 characters' })
    }
    if (body.ofAge === undefined) {
      body.ofAge = true
    }

    const othersWithTheSameUsername = await User.find({ username: body.username })
    if (othersWithTheSameUsername.length > 0) {
      return res.status(400).json({
        error: `a user with username '${body.username}' already exists`
      })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      ofAge: body.ofAge,
      passwordHash
    })

    const savedUser = await user.save()

    return res.status(201).json(User.format(savedUser))
  } catch (exception) {
    return res.status(500).end()
  }
})

module.exports = usersRouter

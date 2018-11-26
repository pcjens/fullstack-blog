const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

afterAll(() => {
  server.close()
})

describe('login api responses', () => {
  let rootUser = {}

  beforeAll(async () => {
    await User.remove({})
    rootUser = {
      username: 'root',
      name: 'Root',
      password: '12345',
      ofAge: true
    }
    await api
      .post('/api/users')
      .send(rootUser)
      .expect(201)
  })

  test('logging in works', async () => {
    const loginRes = await api
      .post('/api/login')
      .send({
        'username': rootUser.username,
        'password': rootUser.password
      })
      .expect(200)
    expect(loginRes.body.token).toBeDefined()
    expect(loginRes.body.username).toBeDefined()
    expect(loginRes.body.name).toBeDefined()
    expect(loginRes.body.ofAge).toBeDefined()
  })

  test('logging in without username doesn\'t work', async () => {
    const loginRes = await api
      .post('/api/login')
      .send({
        'password': rootUser.password
      })
      .expect(400)
    expect(loginRes.body).toEqual({ error: 'username missing' })
  })

  test('logging in without a password doesn\'t work', async () => {
    const loginRes = await api
      .post('/api/login')
      .send({
        'username': rootUser.username
      })
      .expect(400)
    expect(loginRes.body).toEqual({ error: 'password missing' })
  })

  test('logging in with the wrong password doesn\'t work', async () => {
    const loginRes = await api
      .post('/api/login')
      .send({
        'username': rootUser.username,
        'password': 'wrong'
      })
      .expect(401)
    expect(loginRes.body).toEqual({ error: 'invalid username or password' })
  })
})

describe('blog api responses', () => {
  let rootUserToken = ''

  test('blogs are returned', async () => {
    const initialState = await helper.blogsInDb()
    const res = await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(res.body.length).toBe(initialState.length)

    initialState.forEach(blog => {
      expect(res.body).toContainEqual(blog)
    })
  })

  test('adding a blog works', async () => {
    const blog = {
      title: 'Post testing',
      author: 'Tester',
      url: 'http://example.com/1970/01/01/post-testing',
      likes: 3
    }
    const initialState = await helper.blogsInDb()

    await api.post('/api/blogs')
      .set('Authorization', rootUserToken)
      .send(blog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const modifiedState = await helper.blogsInDb()

    expect(modifiedState.length).toBe(initialState.length + 1)
    expect(initialState.map(blog => blog.url)).not.toContain(blog.url)
    expect(modifiedState.map(blog => blog.url)).toContain(blog.url)
  })

  test('deleting a blog works', async () => {
    const res = await api.post('/api/blogs')
      .set('Authorization', rootUserToken)
      .send({
        'author': 'Another User',
        'title': 'Some Blog',
        'url': 'example.com/another-user-approaches'
      })
      .expect(201)
    const deletedBlog = res.body

    const initialState = await helper.blogsInDb()
    expect(initialState.map(blog => blog.id)).toContain(deletedBlog.id)

    await api.delete('/api/blogs/' + deletedBlog.id)
      .set('Authorization', rootUserToken)
      .expect(204)
    const modifiedState = await helper.blogsInDb()

    expect(modifiedState.map(blog => blog.id)).not.toContain(deletedBlog.id)
    expect(modifiedState.length).toBe(initialState.length - 1)
  })

  test('deleting a blog owned by no-one works', async () => {
    const deletedBlog = new Blog({
      'author': 'Another User',
      'title': 'Some Blog',
      'url': 'example.com/another-user-approaches'
    })
    await deletedBlog.save()

    const initialState = await helper.blogsInDb()
    expect(initialState.map(blog => blog.id)).toContain(deletedBlog.id)

    await api.delete('/api/blogs/' + deletedBlog.id)
      .set('Authorization', rootUserToken)
      .expect(204)
    const modifiedState = await helper.blogsInDb()

    expect(modifiedState.map(blog => blog.id)).not.toContain(deletedBlog.id)
    expect(modifiedState.length).toBe(initialState.length - 1)
  })

  test('deleting someone else\'s blog doesn\'t work', async () => {
    const newUser = {
      'username': 'anotheruser',
      'password': 'boop',
      'name': 'Another User'
    }
    await api.post('/api/users')
      .send(newUser)
      .expect(201)
    const loginRes = await api.post('/api/login')
      .send({
        'username': newUser.username,
        'password': newUser.password
      })
      .expect(200)
    const newUserToken = 'bearer ' + loginRes.body.token
    expect(newUserToken).toBeDefined()
    const res = await api.post('/api/blogs')
      .set('Authorization', newUserToken)
      .send({
        'author': 'Another User',
        'title': 'Some Blog',
        'url': 'example.com/another-user-approaches'
      })
      .expect(201)
    const deletedBlog = res.body

    const initialState = await helper.blogsInDb()
    expect(initialState.map(blog => blog.id)).toContain(deletedBlog.id)

    await api.delete('/api/blogs/' + deletedBlog.id)
      .set('Authorization', rootUserToken)
      .expect(401)
    const modifiedState = await helper.blogsInDb()

    expect(modifiedState.map(blog => blog.id)).toContain(deletedBlog.id)
    expect(modifiedState.length).toBe(initialState.length)
  })

  test('deleting a non-existent blog doesn\'t work', async () => {
    const nonExistentId = helper.nonExistentId()
    await api.delete('/api/blogs/' + nonExistentId)
      .set('Authorization', rootUserToken)
      .expect(400)
  })

  test('updating likes works', async () => {
    const initialState = await helper.blogsInDb()
    const targetBlog = initialState[0]
    await api.put('/api/blogs/' + targetBlog.id)
      .send({ 'likes': 400 })
      .expect(200)
    const modifiedState = await helper.blogsInDb()
    expect(modifiedState.filter(blog => blog.id === targetBlog.id).map(blog => blog.likes)).toContain(400)
  })

  test('default likes to zero', async () => {
    const newBlog = await api.post('/api/blogs')
      .set('Authorization', rootUserToken)
      .send({
        title: 'Default like amount testing',
        author: 'Tester',
        url: 'http://example.com/1970/01/02/post-testing',
      })
      .expect(201)
      .expect('Content-Type', /application\/json/)
    expect(newBlog.body.likes).toBe(0)
  })

  test('blog titles are mandatory', async () => {
    await api.post('/api/blogs')
      .set('Authorization', rootUserToken)
      .send({
        author: 'Tester',
        url: 'http://example.com/1970/01/02/a-blog-without-a-title',
      })
      .expect(400)
  })

  test('blog urls are mandatory', async () => {
    await api.post('/api/blogs')
      .set('Authorization', rootUserToken)
      .send({
        title: 'A post without an url!',
        author: 'Tester'
      })
      .expect(400)
  })

  test('blog authorization is mandatory', async () => {
    const res = await api.post('/api/blogs')
      .send({
        title: 'A post without an poster!',
        url: 'http://example.com/1970/01/03/ghost-post',
        author: 'Tester',
      })
      .expect(401)
    expect(res.body).toEqual({ error: 'token missing or invalid' })
  })

  beforeEach(async () => {
    await User.remove({})
    const rootUser = {
      username: 'root',
      name: 'Root',
      password: '12345',
      ofAge: true
    }
    await api
      .post('/api/users')
      .send(rootUser)
    const loginRes = await api
      .post('/api/login')
      .send({
        'username': 'root',
        'password': '12345'
      })
    rootUserToken = 'bearer ' + loginRes.body.token

    await Blog.remove({})

    await Promise.all(
      blogs
        .map(blog => new Blog(blog))
        .map(blog => blog.save()))
  })
})

describe('user api responses', async () => {
  test('getting users works', async () => {
    const initialState = await helper.usersInDb()

    const res = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body.length).toBe(initialState.length)
    const removeBlogs = user => {
      // TODO: Debug why two empty arrays don't seem to match when using toContainEqual
      const userWithoutBlogs = { ...user }
      delete userWithoutBlogs.blogs
      return userWithoutBlogs
    }
    initialState.forEach(user => {
      expect(res.body.map(removeBlogs)).toContainEqual(removeBlogs(user))
    })
  })

  test('user creation works with a unique username', async () => {
    const initialState = await helper.usersInDb()

    const newUser = {
      username: 'newuser',
      name: 'New User',
      password: '12345',
      ofAge: false
    }
    expect(initialState.map(user => user.username)).not.toContain(newUser.username)

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const modifiedState = await helper.usersInDb()
    expect(modifiedState.length).toBe(initialState.length + 1)
    expect(modifiedState.map(user => user.username)).toContain(newUser.username)
  })

  test('user creation doesn\'t work with a username already in the db', async () => {
    const initialState = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: '1337 H4x0r',
      password: '54321',
      ofAge: true
    }
    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(res.body).toEqual({ error: `a user with username '${newUser.username}' already exists` })
    const modifiedState = await helper.usersInDb()
    expect(modifiedState.length).toBe(initialState.length)
  })

  test('user creation doesn\'t work with passwords too short', async () => {
    const initialState = await helper.usersInDb()

    const newUser = {
      username: 'userwithabadpassword',
      name: 'Mr. Bad Pass',
      password: '123',
      ofAge: false
    }
    expect(initialState.map(user => user.username)).not.toContain(newUser.username)

    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(res.body).toEqual({ error: 'password should be longer than 3 characters' })
    const modifiedState = await helper.usersInDb()
    expect(modifiedState.length).toBe(initialState.length)
  })

  test('ofAge is true by default', async () => {
    const initialState = await helper.usersInDb()

    const newUser = {
      username: 'agelessone',
      name: 'The Eternal One',
      password: 'cthulhu'
    }
    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const modifiedState = await helper.usersInDb()
    expect(modifiedState.length).toBe(initialState.length + 1)
    expect(res.body.ofAge).toBe(true)
  })

  beforeEach(async () => {
    await User.remove({})
    const user = new User({ username: 'root', passwordHash: 'secret', name: 'Root', ofAge: true })
    await user.save()
  })
})

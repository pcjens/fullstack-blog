const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog.js')

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

describe('api responses', () => {
  test('blogs are returned', async () => {
    await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('adding a blog works', async () => {
    const initialState = await api.get('/api/blogs')
    await api.post('/api/blogs')
      .send({
        title: 'Post testing',
        author: 'Tester',
        url: 'http://example.com/1970/01/01/post-testing',
        likes: 3,
      })
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const modifiedState = await api.get('/api/blogs')
    expect(modifiedState.body.length).toBe(initialState.body.length + 1)
  })

  test('default likes to zero', async () => {
    const newBlog = await api.post('/api/blogs')
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
      .send({
        author: 'Tester',
        url: 'http://example.com/1970/01/02/a-blog-without-a-title',
      })
      .expect(400)
  })

  test('blog urls are mandatory', async () => {
    await api.post('/api/blogs')
      .send({
        title: 'A post without an url!',
        author: 'Tester',
      })
      .expect(400)
  })
})

beforeAll(async () => {
  await Blog.remove({})

  await Promise.all(
    blogs
      .map(blog => new Blog(blog))
      .map(blog => blog.save())
  )
})

afterAll(() => {
  server.close()
})
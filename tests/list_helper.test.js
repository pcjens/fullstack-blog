const listHelper = require('../utils/list_helper.js')

const blogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }
]

describe('total likes', () => {
  test('of no blogs is zero', () => {
    expect(listHelper.totalLikes([])).toBe(0)
  })

  test('of one blog is that blog\'s likes', () => {
    expect(listHelper.totalLikes([blogs[0]])).toBe(blogs[0].likes)
  })

  test('of multiple blogs is the sum of their likes', () => {
    expect(listHelper.totalLikes(blogs)).toBe(36)
  })

  test('of blogs without likes is zero', () => {
    expect(listHelper.totalLikes([blogs[4]])).toBe(0)
  })
})

describe('favorite blog', () => {
  test('is the one with most likes', () => {
    expect(listHelper.favoriteBlog(blogs)).toEqual({
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      __v: 0
    })
  })

  test('has the correct amount of likes', () => {
    expect(listHelper.favoriteBlog(blogs).likes).toBe(12)
  })
})

describe('most blogs', () => {
  test('is the author with the most blogs', () => {
    expect(listHelper.mostBlogs(blogs)).toEqual({
      "author": "Robert C. Martin",
      "blogs": 3
    })
  })

  test('is the author with the most blogs (another list)', () => {
    expect(listHelper.mostBlogs(blogs.slice(0, 4))).toEqual({
      "author": "Edsger W. Dijkstra",
      "blogs": 2
    })
  })
})

describe('most likes', () => {
  test('is the author with the most likes', () => {
    expect(listHelper.mostLikes(blogs)).toEqual({
      "author": "Edsger W. Dijkstra",
      "likes": 17
    })
  })
})

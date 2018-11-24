const totalLikes = (blogs) => {
  return blogs.map(blog => blog.likes).reduce((a, b) => a + b, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.sort((a, b) => b.likes - a.likes)[0]
}

const mostBlogs = (blogs) => {
  const authors = {}
  blogs.forEach(blog => {
    if (!authors[blog.author]) authors[blog.author] = 1
    else authors[blog.author] += 1
  })
  return Object.keys(authors)
    .sort((a, b) => authors[b] - authors[a])
    .map(author => {
      return {
        "author": author,
        "blogs": authors[author]
      }
    })[0]
}

const mostLikes = (blogs) => {
  const authors = {}
  blogs.forEach(blog => {
    if (!authors[blog.author]) authors[blog.author] = blog.likes
    else authors[blog.author] += blog.likes
  })
  return Object.keys(authors)
    .sort((a, b) => authors[b] - authors[a])
    .map(author => {
      return {
        "author": author,
        "likes": authors[author]
      }
    })[0]
}

module.exports = {
  totalLikes, favoriteBlog, mostBlogs, mostLikes
}

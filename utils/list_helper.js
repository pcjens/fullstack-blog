const totalLikes = (blogs) => {
  return blogs.map(blog => blog.likes).reduce((a, b) => a + b, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.sort((a, b) => b.likes - a.likes)[0]
}

module.exports = {
  totalLikes, favoriteBlog
}

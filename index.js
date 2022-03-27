const express = require('express')
const path = require('path')
const compression = require('compression')
require('dotenv').config()
const { searchVideos, getVideos, getComments, getSentiment } = require('./api')

// Set up Express object
const app = express()
const port = process.env.PORT || '8888'

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'dist')))
app.use(compression())

// Handle requests
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' })
})

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' })
})

app.get('/search', async (req, res) => {
  const keyword = req.query.keyword
  const orderBy = req.query.orderBy
  const nextPageToken = req.query.nextPageToken

  const allResponses = {} // Object to store responses from multiple API calls
  let videos = [] // Array to store Video IDs
  const commentExtract = [] // Array to store extracts of comments
  const hasComments = [] // Array to store if results include enough comments for analysis

  // Get search results
  try {
    const response = await searchVideos(keyword, orderBy, nextPageToken)
    console.log(response.data)

    // Extract video IDs
    videos = response.data.items.map(a => a.id).map(b => b.videoId)
    // console.log(videos)

    // Store nextPageToken for subsequent requests
    allResponses.nextPageToken = response.data.nextPageToken
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }

  // Get video details
  try {
    const response = await getVideos(videos)
    console.log(response.data)

    // Store video details
    allResponses.videos = response.data
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }

  // Check if videos have >= 5 comments
  for (let i = 0; i < allResponses.videos.items.length; i++) {
    (allResponses.videos.items[i].statistics.commentCount >= 5) ? hasComments.push(true) : hasComments.push(false)
  }
  allResponses.hasComments = hasComments

  // Get comments
  try {
    const responseArr = await getComments(allResponses)

    // Store responses in allResponses
    for (let i = 0; i < responseArr.length; i++) {
      // console.log(responses[i].data);
      allResponses['comments' + (i)] = responseArr[i].data
    }

    // Combine comments to one string
    for (let i = 0; i < responseArr.length; i++) {
      commentExtract[i] = ''
      for (let j = 0; j < allResponses['comments' + i].items.length; j++) {
        // Get at most 500 characters from each comment
        commentExtract[i] += '' + truncateString(allResponses['comments' + i].items[j].snippet.topLevelComment.snippet.textOriginal.replace(/\n/g, ' ').trim(), 500)
      }
    }
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }

  // Get sentiment data
  try {
    const responseArr = await getSentiment(commentExtract)

    // Store responses in allResponses
    for (let i = 0; i < responseArr.length; i++) {
      // console.log(responses[i].data);
      allResponses['comments' + i].sentiment = responseArr[i].data
    }
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }

  res.status(200).send(allResponses)
})

// Set up server listening
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})

// Function to truncate comments
function truncateString (str, num) {
  if (str.length <= num) {
    return str
  }
  return str.slice(0, num)
}

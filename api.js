const axios = require('axios')
const url = require('url')
require('dotenv').config()

// Reference: https://developers.google.com/youtube/v3/docs/search/list
function searchVideos (keyword, orderBy, nextPageToken) {
  const params = {
    key: process.env.API_KEY,
    q: keyword,
    type: 'video',
    order: orderBy,
    maxResults: 3
  }

  if (nextPageToken) {
    params.pageToken = nextPageToken
  }

  return axios.get('https://www.googleapis.com/youtube/v3/search', { params })
}

// Reference: https://developers.google.com/youtube/v3/docs/videos/list
function getVideos (videos) {
  return axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      key: process.env.API_KEY,
      part: 'statistics,snippet,id',
      id: videos.toString()
    }
  })
}

// Reference: https://developers.google.com/youtube/v3/docs/commentThreads/list
function getComments (allResponses) {
  const requests = [] // Array to store all requests

  const requestCommentThreads = []
  for (let i = 0; i < allResponses.videos.items.length; i++) {
    if (allResponses.hasComments[i]) {
      requestCommentThreads[i] = axios.get('https://www.googleapis.com/youtube/v3/commentThreads', {
        params: {
          key: process.env.API_KEY,
          part: 'id,snippet',
          videoId: allResponses.videos.items[i].id,
          maxResults: 5,
          order: 'relevance',
          textFormat: 'plainText'
        }
      })
      requests.push(requestCommentThreads[i])
    }
  }

  return axios.all(requests)
}

function getSentiment (commentExtract) {
  const sentimentRequests = [] // Array to store all requests
  for (let i = 0; i < commentExtract.length; i++) {
    const params = new url.URLSearchParams({ text: commentExtract[i] })
    sentimentRequests.push(axios.post('http://text-processing.com/api/sentiment/', params.toString()))
  }

  return axios.all(sentimentRequests)
}

module.exports = { searchVideos, getVideos, getComments, getSentiment }

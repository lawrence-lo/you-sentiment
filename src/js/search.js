const NumAbbr = require('number-abbreviate')
const numAbbr = new NumAbbr()

// Function to request data on submit
document.getElementById('search').onsubmit = function (e) {
  const keyword = document.getElementById('keyword').value
  const orderBy = document.getElementById('orderBy').value

  // Validation
  if (keyword === '' || keyword === null) {
    return false
  }

  // XMLHttpRequest
  const url = window.location.origin + '/search?keyword=' + keyword + '&orderBy=' + orderBy
  // console.log('Request sent:' + url)

  // Reference: https://www.w3schools.com/xml/xml_http.asp
  const xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function (e) {
    if (this.readyState === 4 && this.status === 200) {
      const videosResponse = JSON.parse(xhttp.responseText)
      // console.log(videosResponse)

      // Remove results and Load More button
      document.getElementById('results').innerHTML = ''
      if (document.getElementById('more')) {
        document.getElementById('more').remove()
      }

      // Display results
      renderResults(keyword, orderBy, videosResponse)
    }

    if (this.readyState === 4 && this.status === 500) {
      document.getElementById('results').innerHTML = 'Something went wrong.'
    }
  }

  xhttp.open('GET', url, true)
  xhttp.send()

  // Prevent Submission
  e.preventDefault()
  return false
}

// Function to display results
function renderResults (keyword, orderBy, videosResponse) {
  let commentsCounter = 0 // Keep track of comments index as not all videos have comments
  let sentimentPercentage = 0
  let sentimentLabel = ''
  let sentimentText = ''
  let sentimentClass = ''
  let videoTitle = ''
  let videoId = ''
  let videoDescription = ''
  let thumbnailUrl = ''
  let channelId = ''
  let channelTitle = ''
  let viewCount = ''
  let likeCount = ''
  let publishedAt = ''

  for (let i = 0; i < videosResponse.videos.items.length; i++) {
    // Variables for sentiment display
    if (videosResponse.hasComments[i]) {
      sentimentLabel = videosResponse['comments' + commentsCounter].sentiment.label
      sentimentPercentage = Math.trunc(videosResponse['comments' + commentsCounter].sentiment.probability[sentimentLabel] * 100)
      sentimentText = sentimentPercentage + '% ' + ((sentimentLabel === 'neutral') ? 'Neutral' : (sentimentLabel === 'pos') ? 'Positive' : 'Negative')
      sentimentClass = (sentimentLabel === 'neutral') ? 'bg-light' : (sentimentLabel === 'pos') ? 'bg-success' : 'bg-secondary'
      commentsCounter++
    } else {
      sentimentPercentage = 100
      sentimentText = 'N/A'
      sentimentClass = 'bg-warning'
    }

    // Variables for video details
    if (videosResponse.videos.items[i].snippet.title) {
      videoTitle = videosResponse.videos.items[i].snippet.title
    } else {
      videoTitle = 'NIL'
    }

    if (videosResponse.videos.items[i].id) {
      videoId = videosResponse.videos.items[i].id
    } else {
      videoId = 'NIL'
    }

    if (videosResponse.videos.items[i].snippet.description) {
      videoDescription = videosResponse.videos.items[i].snippet.description
    } else {
      videoDescription = 'NIL'
    }

    if (videosResponse.videos.items[i].snippet.thumbnails.high.url) {
      thumbnailUrl = videosResponse.videos.items[i].snippet.thumbnails.high.url
    } else {
      thumbnailUrl = '#'
    }

    if (videosResponse.videos.items[i].snippet.channelId) {
      channelId = videosResponse.videos.items[i].snippet.channelId
    } else {
      channelId = 'NIL'
    }

    if (videosResponse.videos.items[i].snippet.channelTitle) {
      channelTitle = videosResponse.videos.items[i].snippet.channelTitle
    } else {
      channelTitle = 'NIL'
    }

    if (videosResponse.videos.items[i].statistics.viewCount) {
      viewCount = numAbbr.abbreviate(videosResponse.videos.items[i].statistics.viewCount, 1)
    } else {
      viewCount = 'NIL'
    }

    if (videosResponse.videos.items[i].statistics.likeCount) {
      likeCount = numAbbr.abbreviate(videosResponse.videos.items[i].statistics.likeCount, 1)
    } else {
      likeCount = 'NIL'
    }

    if (videosResponse.videos.items[i].snippet.publishedAt) {
      publishedAt = videosResponse.videos.items[i].snippet.publishedAt.slice(0, 10)
    } else {
      publishedAt = 'NIL'
    }

    // Create card for display
    document.getElementById('results').innerHTML += '<div class="card m-3 rounded-0" style="width: 20rem;"><div class="card-header p-0"><div class="progress rounded-0" style="height: 30px;"><div class="progress-bar text-dark fw-bolder ' + sentimentClass + '" role="progressbar" style="width: ' + sentimentPercentage + '%;" aria-valuenow="' + sentimentPercentage + '" aria-valuemin="0" aria-valuemax="100">' + sentimentText + '</div></div></div><a href="https://www.youtube.com/watch?v=' + videosResponse.videos.items[i].id + '" target="_blank"><img src="' + thumbnailUrl + '" class="card-img rounded-0" alt="' + videoTitle + '"></a><div class="card-body"><h5 class="card-title fw-bolder"><a href="https://www.youtube.com/watch?v=' + videoId + '" target="_blank">' + videoTitle + '</a></h5><p class="card-text">' + truncateString(videoDescription, 100) + '</p></div><div class="card-footer text-muted text-center"><a class="d-block" href="https://www.youtube.com/channel/' + channelId + '" target="_blank">' + channelTitle + '</a>' + viewCount + ' views &middot; ' + likeCount + ' likes &middot; ' + publishedAt + '</div>'
  }

  // Create div for Load More button
  const loadMoreDiv = document.createElement('div')
  loadMoreDiv.setAttribute('id', 'more')
  loadMoreDiv.setAttribute('class', 'text-center mb-3')
  loadMoreDiv.innerHTML = '<button id="loadMore" type="button" class="btn btn-primary text-white rounded-pill">Load More</button>'
  document.getElementById('main').appendChild(loadMoreDiv)
  // Add Eventlistener for next request
  document.getElementById('loadMore').addEventListener('click', function () { requestNextResults(keyword, orderBy, videosResponse.nextPageToken) })
}

// Function to request more data after clicking Load More
function requestNextResults (keyword, orderBy, nextPageToken) {
  // XMLHttpRequest
  const url = window.location.origin + '/search?keyword=' + keyword + '&orderBy=' + orderBy + '&nextPageToken=' + nextPageToken
  // console.log('Request sent:' + url)

  const xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const videosResponse = JSON.parse(xhttp.responseText)
      // console.log(videosResponse)

      // Remove existing Load More button
      document.getElementById('more').remove()

      // Display results
      renderResults(keyword, orderBy, videosResponse)
    }

    if (this.readyState === 4 && this.status === 500) {
      document.getElementById('results').innerHTML = 'Something went wrong.'
    }
  }

  xhttp.open('GET', url, true)
  xhttp.send()
}

// Function to truncate video description
function truncateString (str, num) {
  if (str.length <= num) {
    return str
  }
  return str.slice(0, num) + '...'
}

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

  for (let i = 0; i < videosResponse.videos.items.length; i++) {
    // Setup variables for sentiment display
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

    // Create card for display
    document.getElementById('results').innerHTML += '<div class="card m-3 rounded-0" style="width: 20rem;"><div class="card-header p-0"><div class="progress rounded-0" style="height: 30px;"><div class="progress-bar text-dark fw-bolder ' + sentimentClass + '" role="progressbar" style="width: ' + sentimentPercentage + '%;" aria-valuenow="' + sentimentPercentage + '" aria-valuemin="0" aria-valuemax="100">' + sentimentText + '</div></div></div><a href="https://www.youtube.com/watch?v=' + videosResponse.videos.items[i].id + '" target="_blank"><img src="' + videosResponse.videos.items[i].snippet.thumbnails.high.url + '" class="card-img rounded-0" alt="' + videosResponse.videos.items[i].snippet.title + '"></a><div class="card-body"><h5 class="card-title fw-bolder"><a href="https://www.youtube.com/watch?v=' + videosResponse.videos.items[i].id + '" target="_blank">' + videosResponse.videos.items[i].snippet.title + '</a></h5><p class="card-text">' + truncateString(videosResponse.videos.items[i].snippet.description, 100) + '</p></div><div class="card-footer text-muted text-center"><a class="d-block" href="https://www.youtube.com/channel/' + videosResponse.videos.items[i].snippet.channelId + '" target="_blank">' + videosResponse.videos.items[i].snippet.channelTitle + '</a>' + abbreviateNumber(videosResponse.videos.items[i].statistics.viewCount).toUpperCase() + ' views &middot; ' + abbreviateNumber(videosResponse.videos.items[i].statistics.likeCount).toUpperCase() + ' likes &middot; ' + videosResponse.videos.items[i].snippet.publishedAt.slice(0, 10) + '</div>'
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

// Function to turn number into more readable format
// Reference: https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn
function abbreviateNumber (value) {
  let newValue = value
  if (value >= 1000) {
    const suffixes = ['', 'k', 'm', 'b', 't']
    const suffixNum = Math.floor(('' + value).length / 3)
    let shortValue = ''
    for (let precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision))
      const dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '')
      if (dotLessShortValue.length <= 2) { break }
    }
    if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1)
    newValue = shortValue + suffixes[suffixNum]
  }
  return newValue
}

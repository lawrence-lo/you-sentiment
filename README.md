# YouSentiment
In December 2021, YouTube removed the “dislikes” from all its videos, this has made it harder for users to judge the quality of videos. The purpose of YouSentiment is to create a new indicator that would help users determine the “positiveness/negativeness” of YouTube videos.

YouSentiment combines data from Text Processing API from [text-processing.com](http://text-processing.com/docs/index.html) and [YouTube Data API](https://developers.google.com/youtube/v3), providing users with a new way of discovering YouTube videos. When users search for videos on YouSentiment, the most relevant comments of each result would be sent to the Text Processing API for Sentiment Analysis, giving the probability of positive, negative or neutral sentiment.

[Demo](https://you-sentiment.herokuapp.com/)
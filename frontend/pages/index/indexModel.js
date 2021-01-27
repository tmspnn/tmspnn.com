const initData = JSON.parse($("#_data").textContent)

class IndexModel {
  user = { id: initData.user.id }
  recommendedKeywords = initData.recommended_keywords
  keyword = ""
  results = initData.recommended_keywords
  feeds = initData.feeds
  recommendedAuthors = initData.recommended_authors
  recommendedTopics = initData.recommended_topics

  setKeyword = (args) => {
    this.keyword = args.keyword
  }

  setResults = (args) => {
    this.results = args.results
  }

  addFeeds = (args) => {
    this.feeds.push(...args.feeds)
  }
}

export default new IndexModel()

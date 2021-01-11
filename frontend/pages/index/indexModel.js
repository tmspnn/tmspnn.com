import { $ } from "@util/DOM"
import { Model } from "@components/MVC"

const initData = JSON.parse($("#_data").textContent)

class IndexModel extends Model {
  user = { id: initData.user.id }
  recommendedKeywords = initData.recommended_keywords
  keyword = ""
  results = initData.recommended_keywords
  feeds = initData.feeds
  recommendedAuthors = initData.recommended_authors
  recommendedTopics = initData.recommended_topics

  constructor() {
    super("index")
  }

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

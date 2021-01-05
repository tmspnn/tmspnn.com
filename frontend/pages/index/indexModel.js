import { $ } from "@util/DOM"
import { Model } from "@components/MVC"

const initData = JSON.parse($("#_data").textContent)

class IndexModel extends Model {
  user = { id: initData.user.id }
  recommendedKeywords = initData.recommended_keywords
  keywords = initData.recommended_keywords
  feeds = initData.feeds
  recommendedAuthors = initData.recommended_authors
  recommendedTopics = initData.recommended_topics

  constructor() {
    super("index")
  }

  addFeeds = moreFeeds => {
    this.feeds.push(...moreFeeds)
  }
}

export default new IndexModel()

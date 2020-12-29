import { Model } from "@components/MVC"

class IndexModel extends Model {
  user = {}
  feeds = []
  recommendedAuthors = []
  recommendedTopics = []

  constructor() {
    super("index")
  }

  addFeeds = moreFeeds => {
    this.feeds.push(...moreFeeds)
  }
}

export default new IndexModel()
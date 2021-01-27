class ArticleModel extends Model {
  user = {
    id: 0,
    nickname: "",
    profile: ""
  }

  article = {
    id: 0,
    created_by: 0,
    title: "",
    author: "",
    profile: "",
    cover: "",
    keywords: [],
    summary: "",
    content: "",
    created_at: "",
    updated_at: "",
    pageview: 0,
    rating: 0,
    ratings_count: 0,
    comments_count: 0,
    status: "public",
    weight: 0
  }

  comments = []
  author = {}
  articlesByTheAuthor = []
  relatedArticles = []
  rated = false

  constructor() {
    super("article")
    const initData = JSON.parse($("#_data").textContent)
    this.setUserProps(initData.user)
    this.setArticleProps(initData.article)
  }

  setUserProps = (props) => {
    _.assign(this.user, props)
  }

  setArticleProps = (props) => {
    _.assign(this.article, props)
  }

  setRated = (args) => {
    this.rated = args.rated
  }
}

export default new ArticleModel()

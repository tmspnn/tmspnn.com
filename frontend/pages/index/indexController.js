// import { connect, send, disconnect } from "@util/ws"
import indexModel from "./indexModel"

class IndexController extends Controller {
  blocked = false

  constructor() {
    super("index")
  }

  searchKeyword = (args) => {
    if (this.blocked) return

    const { keyword } = args

    if (keyword == indexModel.keyword) return

    this.blocked = true
    this.mutate("setKeyword", { keyword })
    this.ui("customSpinner::show")

    getJSON({
      url: "/api/search?keyword=" + encodeURIComponent(keyword),
      cb: (json) => {
        const { data, html } = json
        this.mutate("setResults", { results: data })
          .ui("resultItem::destroy")
          .ui("searchBar::setResults", { results: data, html })
      },
      fail: (e) => {
        let err = "搜索失败, 请稍后再试"

        if (isJSON(e.message)) {
          err = JSON.parse(e.message).err
        }

        this.showToast(err)
      },
      final: () => {
        this.blocked = false
        this.ui("customSpinner::hide")
      }
    })
  }

  resetKeyword = () => {
    this.mutate("setKeyword", { keyword: "" })
  }

  loadMoreFeeds = () => {
    console.log(Date.now())
    if (this.blocked) return

    this.blocked = true
    this.ui("customSpinner::show")

    const latestId = _.last(indexModel.feeds).id

    getJSON({
      url: "/api/articles?latest=" + latestId,
      cb: (json) => {
        const { data, html } = json
        this.mutate("addFeeds", { feeds: data }).ui("index::addFeeds", { feeds: articles, html })
      },
      fail: (e) => {
        let err = "加载失败, 请稍后再试"

        if (isJSON(e.message)) {
          err = JSON.parse(e.message).err
        }

        this.showToast(err)
      },
      final: () => {
        this.blocked = false
        this.ui("customSpinner::hide")
      }
    })
  }

  showToast = (texts) => {
    this.ui("toast::show", { texts })
  }
}

export default new IndexController()

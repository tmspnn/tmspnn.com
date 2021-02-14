// import { connect, send, disconnect } from "@util/ws"

export default class IndexController extends Controller {
  data = JSON.parse($("#_data").textContent)
  keyword = ""
  defaultSearchResultsHtml = $(".-search-bar ul").outerHTML
  moreFeeds = []
  blocked = false

  constructor() {
    super("index")
  }

  searchKeyword = _.debounce((args) => {
    if (this.blocked || args.keyword == this.keyword) return

    this.blocked = true
    this.keyword = args.keyword
    this.ui("customSpinner::show")
    getJSON({
      url: "/api/search?keyword=" + encodeURIComponent(this.keyword),
      cb: (json) => {
        // json.data: array
        // json.html: string
        this.searchResults = json.data
        this.ui("resultItem::destroy").ui("searchBar::setResults", json)
      },
      fail: this.fail,
      final: this.final
    })
  }, 500)

  resetKeyword = () => {
    if (this.keyword != "") {
      this.keyword = ""
      this.ui("resultItem::destroy").ui("searchBar::setResults", {
        data: this.data.recommended_keywords,
        html: this.defaultSearchResultsHtml
      })
    }
  }

  changeSelectedResult = (args) => {
    this.ui("resultItem::setSelected", args)
  }

  loadMoreFeeds = () => {
    if (this.blocked) return

    this.blocked = true
    this.ui("customSpinner::show")
    const latestId = _.last(_.isEmpty(this.moreFeeds) ? this.data.feeds : this.moreFeeds).id
    getJSON({
      url: "/api/articles?latest=" + latestId,
      cb: (json) => {
        // json.data: array
        // json.html: string
        this.moreFeeds.push(...json.data)
        this.ui("index::addFeeds", json)
      },
      fail: this.fail,
      final: this.final
    })
  }

  toast = (texts) => {
    this.ui("toast::show", { texts })
  }

  fail = (e) => {
    let err = "加载失败, 请稍后再试"

    if (isJSON(e.message)) {
      err = JSON.parse(e.message).err
    }

    this.toast(err)
  }

  final = () => {
    this.blocked = false
    this.ui("customSpinner::hide")
  }
}

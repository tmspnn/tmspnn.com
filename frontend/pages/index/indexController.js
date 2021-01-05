// External packages
import _ from "lodash"

// Local modules
import { Controller } from "@components/MVC"
import { getJSON } from "@util/xhr"
// import { connect, send, disconnect } from "@util/ws"
import indexModel from "./indexModel"

class IndexController extends Controller {
  blocked = false

  constructor() {
    super("index")
  }

  searchKeyword = args => {
    const { keyword } = args
    getJSON({
      url: "/api/search?keyword=" + encodeURIComponent(keyword),
      cb: json => {
        console.log(json)
      }
    })
  }

  loadMoreFeeds = _.debounce(() => {
    console.log("load more")
  }, 500)
}

export default new IndexController()

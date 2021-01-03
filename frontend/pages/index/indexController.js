import { Controller } from "@components/MVC"
import indexModel from "./indexModel"
import { connect, send, disconnect } from "@util/ws"

class IndexController extends Controller {
  constructor() {
    super("index")

    connect()

    setTimeout(() => {
      send("js::asdasdasdasd")
    }, 3000)

    setTimeout(() => {
      disconnect()
    }, 6000)
  }

  loadMoreFeeds = () => {}
}

export default new IndexController()

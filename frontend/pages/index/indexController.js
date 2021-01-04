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
    }, 180000)
  }

  loadMoreFeeds = () => {}
}

export default new IndexController()

// TODO: use document.cookie="ws_last_active=" + Date.now() to detect other ws connection
// TODO: use window.postMessage to broadcast ws messages

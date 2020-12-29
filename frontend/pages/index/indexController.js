import { Controller } from "@components/MVC"
import indexModel from "./indexModel"

class IndexController extends Controller {
  constructor() {
    super("index")
  }

  loadMoreFeeds = () => {}
}

export default new IndexController()
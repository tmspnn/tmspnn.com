import { Controller } from "@components/MVC"
import { getJSON } from "@util/xhr"
import meModel from "./meModel"
import isJSON from "@util/isJSON"

class FollowingsController extends Controller {
  blocked = false

  constructor() {
    super("followings")
  }

  toast = (texts) => {
    this.ui("toast::show", { texts })
  }
}

export default new FollowingsController()

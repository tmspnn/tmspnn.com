import MeModel from "./MeModel"

const meModel = new MeModel()
export default class MeController extends Controller {
  blocked = false

  constructor() {
    super("me")
  }

  clickEditBtn = _.throttle(() => {
    this.ui("dialogUserMeta::show")
  }, 2000)

  toast = (texts) => {
    this.ui("toast::show", { texts })
  }
}

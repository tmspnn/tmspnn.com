export default class MeController extends Controller {
  blocked = false

  constructor() {
    super("me")
  }

  toast = (texts) => {
    this.ui("toast::show", { texts })
  }
}

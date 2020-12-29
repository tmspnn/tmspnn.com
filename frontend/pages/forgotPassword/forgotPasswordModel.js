import { Model } from "@components/MVC"

class ForgotPasswordModel extends Model {
  email = ""

  constructor() {
    super("forgotPassword")
  }

  setEmail = (args) => {
    this.email = args.email
  }
}

export default new ForgotPasswordModel()
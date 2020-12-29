import { Model } from "@components/MVC"

class SignUpModel extends Model {
  email = ""
  vcode = ""
  password = ""
  countdown = 0

  constructor() {
    super("signUp")
  }

  setEmail = (args) => {
    this.email = args.email
  }

  setVcode = (args) => {
    this.vcode = args.vcode
  }

  setPassword = (args) => {
    this.password = args.password
  }

  setCountdown = (args) => {
    this.countdown = args.countdown
  }
}

export default new SignUpModel()
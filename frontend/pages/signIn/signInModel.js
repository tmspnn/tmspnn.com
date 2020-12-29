// External modules
import qs from "qs"

// Local modules
import { Model } from "@components/MVC"

class SignInModel extends Model {
  email = ""
  password = ""
  from = ""
  queryString = ""

  constructor() {
    super("signIn")
    this.queryString = qs.parse(location.search.slice(1))
    this.from = this.queryString.from || "/"
  }

  setEmail = (args) => {
    this.email = args.email
  }

  setPassword = (args) => {
    this.password = args.password
  }
}

export default new SignInModel()
// External modules
import qs from "qs"

// Local modules
import { Model } from "@components/MVC"

class ResetPasswordModel extends Model {
  email = ""
  password = ""
  sequence = ""
  queryString = ""

  constructor() {
    super("resetPassword")
    this.queryString = qs.parse(location.search.slice(1))
    this.sequence = this.queryString.sequence
    this.email = this.queryString.email
  }

  setPassword = (args) => {
    this.password = args.password
  }
}

export default new ResetPasswordModel()
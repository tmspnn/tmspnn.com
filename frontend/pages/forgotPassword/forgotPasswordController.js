// External modules
import isEmail from "validator/lib/isEmail"

// Local modules
import { postJSON } from "@util/xhr"
import { Controller } from "@components/MVC"
import forgotPasswordModel from "./forgotPasswordModel"
import isJSON from "@util/isJSON"

class ForgotPasswordController extends Controller {
  blocked = false

  constructor() {
    super("forgotPassword")
  }

  keyupEmailInput = (args) => {
    this.mutate("setEmail", { email: args.email })
  }

  clickSubmitBtn = () => {
    if (this.blocked) return

    const { email } = forgotPasswordModel

    if (!email || !isEmail(email)) {
      return this.showToast("请输入正确的邮箱地址.")
    }

    this.blocked = true
    this.ui("customSpinner::show")

    postJSON({
      url: "/api/retrieve-password",
      data: { email },
      cb: (json) => {
        this.showToast("请通过您收到的邮件重设密码.")
      },
      fail: (e) => {
        const err = isJSON(e.message) ? JSON.parse(e.message).err : e.message
        this.showToast(err)
      },
      final: () => {
        this.blocked = false
        this.ui("customSpinner::hide")
      }
    })
  }

  showToast = (texts) => {
    this.ui("toast::show", { texts })
  }
}

export default new ForgotPasswordController()
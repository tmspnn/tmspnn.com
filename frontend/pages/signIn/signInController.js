// External modules
import isEmail from "validator/lib/isEmail"

// Local modules
import { postJSON } from "@util/xhr"
import { Controller } from "@components/MVC"
import signInModel from "./signInModel"
import isJSON from "@util/isJSON"

class SignInController extends Controller {
  blocked = false

  constructor() {
    super("signIn")
  }

  keyupEmailInput = (args) => {
    this.mutate("setEmail", { email: args.email })
  }

  keyupPasswordInput = (args) => {
    this.mutate("setPassword", { password: args.password })
  }

  clickEyeBtn = (args) => {
    this.ui("signIn::setPasswordVisibility", { visible: !args.currentVisibility })
  }

  clickSubmitBtn = () => {
    if (this.blocked) return

    const { email, password, from } = signInModel

    if (!email || !isEmail(email)) {
      return this.showToast("请输入正确的邮箱地址.")
    }

    if (!password || password.length < 6) {
      return this.showToast("请输入至少6位的密码.")
    }

    this.blocked = true

    postJSON({
      url: "/api/sign-in",
      data: { email, password },
      cb: (json) => {
        location.href = from
      },
      fail: (e) => {
        const err = isJSON(e.message) ? JSON.parse(e.message).err : e.message
        this.showToast(err)
      },
      final: () => {
        this.blocked = false
      }
    })
  }

  showToast = (texts) => {
    this.ui("toast::show", { texts })
  }
}

export default new SignInController()
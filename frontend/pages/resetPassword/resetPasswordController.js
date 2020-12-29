// External modules
import isEmail from "validator/lib/isEmail"

// Local modules
import { postJSON } from "@util/xhr"
import { Controller } from "@components/MVC"
import resetPasswordModel from "./resetPasswordModel"
import isJSON from "@util/isJSON"

class ResetPasswordController extends Controller {
  blocked = false

  constructor() {
    super("resetPassword")
  }

  keyupPasswordInput = (args) => {
    this.mutate("setPassword", { password: args.password })
  }

  clickEyeBtn = (args) => {
    this.ui("resetPassword::setPasswordVisibility", { visible: !args.currentVisibility })
  }

  clickSubmitBtn = () => {
    if (this.blocked) return

    const { password, sequence, email } = resetPasswordModel

    if (!password || password.length < 6) {
      return this.showToast("请输入至少6位的密码.")
    }

    this.blocked = true

    postJSON({
      url: "/api/reset-password",
      data: { email, sequence, password },
      cb: (json) => {
        this.showToast("密码重置成功, 请重新登录.")
        setTimeout(() => {
          location.href = "/sign-in"
        }, 5000)
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

export default new ResetPasswordController()
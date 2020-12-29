// External modules
import isEmail from "validator/lib/isEmail"

// Local modules
import { postJSON } from "@util/xhr"
import { Controller } from "@components/MVC"
import isJSON from "@util/isJSON"
import signUpModel from "./signUpModel"

class SignUpController extends Controller {
  blocked = false
  countdownInterval = 0

  constructor() {
    super("signUp")
  }

  keyupEmailInput = (args) => {
    this.mutate("setEmail", { email: args.email })
  }

  keyupVcodeInput = (args) => {
    this.mutate("setVcode", { vcode: args.vcode })
  }

  keyupPasswordInput = (args) => {
    this.mutate("setPassword", { password: args.password })
  }

  clickVcodeBtn = () => {
    if (!this.blocked && signUpModel.countdown == 0) {

      this.blocked = true
      this.ui("customSpinner::show")

      postJSON({
        url: "/api/verification-codes",
        data: { email: signUpModel.email },
        cb: (json) => {
          this.showToast("验证码已发送至您的邮箱.")
          this.startCountdown()
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
  }

  clickEyeBtn = (args) => {
    this.ui("signUp::setPasswordVisibility", { visible: !args.currentVisibility })
  }

  clickSubmitBtn = () => {
    if (this.blocked) return

    const { email, vcode, password } = signUpModel

    if (!email || !isEmail(email)) {
      return this.showToast("请输入正确的邮箱地址.")
    }

    if (!password || password.length < 6) {
      return this.showToast("请输入至少6位的密码.")
    }

    this.blocked = true
    this.ui("customSpinner::show")

    postJSON({
      url: "/api/sign-up",
      data: { email, vcode, password },
      cb: (json) => {
        location.href = "/"
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

  startCountdown = () => {
    this.mutate("setCountdown", { countdown: 60 })

    this.countdownInterval = setInterval(() => {
      this.mutate("setCountdown", { countdown: signUpModel.countdown - 1 })
      this.ui("signUp::setVcodeCountdown", { countdown: signUpModel.countdown })
      if (signUpModel.countdown == 0) {
        clearInterval(this.countdownInterval)
      }
    }, 1000)
  }

  showToast = (texts) => {
    this.ui("toast::show", { texts })
  }
}

export default new SignUpController()
import { View } from "@components/MVC"
import { $, addClass, removeClass } from "@util/DOM"
import PageContainer from "@components/PageContainer/PageContainer"
import CustomSpinner from "@components/CustomSpinner"
import Toast from "@components/Toast/Toast"

class SignInView extends View {
  _name = "signIn"

  // DOM references
  emailInput = null
  passwordInput = null
  eyeBtn = null
  submitBtn = null

  // Child components
  pageContainer = null
  customSpinner = null
  toast = null

  constructor() {
    super("signIn")
    this.emailInput = $("#email")
    this.passwordInput = $("#password")
    this.eyeBtn = $(".row:nth-child(3) > svg")
    this.submitBtn = $("button")
    this.pageContainer = new PageContainer("signIn")
    this.customSpinner = new CustomSpinner("signIn")
    this.toast = new Toast("signIn")

    const keyUpEvents = ["keyup", "change", "blur"]
    keyUpEvents.forEach(evt => {
      this.emailInput.on(evt, () => {
        this.dispatch("keyupEmailInput", { email: this.emailInput.value })
      })

      this.passwordInput.on(evt, () => {
        this.dispatch("keyupPasswordInput", { password: this.passwordInput.value })
      })
    })

    this.eyeBtn.on("click", () => {
      this.dispatch("clickEyeBtn", { currentVisibility: this.passwordInput.type != "password" })
    })

    this.submitBtn.on("click", () => this.dispatch("clickSubmitBtn"))

    window.on("keyup", e => {
      if (e.key == "Enter") {
        this.submitBtn.click()
      }
    })
  }

  setPasswordVisibility = args => {
    if (args.visible) {
      this.passwordInput.type = "text"
      addClass(this.eyeBtn, "light")
    } else {
      this.passwordInput.type = "password"
      removeClass(this.eyeBtn, "light")
    }
  }
}

export default new SignInView()

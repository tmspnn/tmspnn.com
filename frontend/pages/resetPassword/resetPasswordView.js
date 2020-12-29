import { View } from "@components/MVC"
import { $, $$, addClass, removeClass } from "@util/DOM"
import { postJSON } from "@util/xhr"
import PageContainer from "@components/PageContainer/PageContainer"
import CustomSpinner from "@components/CustomSpinner"
import Toast from "@components/Toast/Toast"

class ResetPasswordView extends View {
  _name = "resetPassword"

  // DOM references
  passwordInput = null
  eyeBtn = null
  submitBtn = null

  // Child components
  pageContainer = null
  customSpinner = null
  toast = null

  constructor() {
    super("resetPassword")
    this.passwordInput = $("#password")
    this.eyeBtn = $(".row:nth-child(2) > svg")
    this.submitBtn = $("button")
    this.pageContainer = new PageContainer("resetPassword")
    this.customSpinner = new CustomSpinner("resetPassword")
    this.toast = new Toast("resetPassword")

    const keyUpEvents = ["keyup", "change", "blur"]
    keyUpEvents.forEach(evt => {
      this.passwordInput.on(evt, () => {
        this.dispatch("keyupPasswordInput", { password: this.passwordInput.value })
      })
    })

    this.eyeBtn.on("click", () => {
      this.dispatch("clickEyeBtn", { currentVisibility: this.passwordInput.type != "password" })
    })

    this.submitBtn.on("click", () => this.dispatch("clickSubmitBtn"))

    window.on("keyup", e => {
      if (event.key == "Enter") {
        this.submitBtn.click()
      }
    })
  }

  setPasswordVisibility = (args) => {
    if (args.visible) {
      this.passwordInput.type = "text"
      addClass(this.eyeBtn, "light")
    } else {
      this.passwordInput.type = "password"
      removeClass(this.eyeBtn, "light")
    }
  }
}

export default new ResetPasswordView()
import { View } from "@components/MVC"
import { $, $$, addClass, removeClass } from "@util/DOM"
import { postJSON } from "@util/xhr"
import PageContainer from "@components/PageContainer/PageContainer"
import CustomSpinner from "@components/CustomSpinner"
import Toast from "@components/Toast/Toast"

class SignUpView extends View {
  _name = "signUp"

  // DOM references
  emailInput = null
  vcodeInput = null
  vcodeBtn = null
  passwordInput = null
  eyeBtn = null
  submitBtn = null

  // Child components
  pageContainer = null
  customSpinner = null
  toast = null

  constructor() {
    super("signUp")
    this.emailInput = $("#email")
    this.vcodeInput = $("#vcode")
    this.vcodeBtn = $(".acquire-vcode")
    this.passwordInput = $("#password")
    this.eyeBtn = $(".row:nth-child(4) > svg")
    this.submitBtn = $(".submit")
    this.pageContainer = new PageContainer("signUp")
    this.customSpinner = new CustomSpinner("signUp")
    this.toast = new Toast("signUp")

    const keyUpEvents = ["keyup", "change", "blur"]
    keyUpEvents.forEach(evt => {
      this.emailInput.on(evt, () => {
        this.dispatch("keyupEmailInput", { email: this.emailInput.value })
      })

      this.vcodeInput.on(evt, () => {
        this.dispatch("keyupVcodeInput", { vcode: this.vcodeInput.value })
      })

      this.passwordInput.addEventListener(evt, () => {
        this.dispatch("keyupPasswordInput", { password: this.passwordInput.value })
      })
    })

    this.vcodeBtn.on("click", () => this.dispatch("clickVcodeBtn"))

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

  setVcodeCountdown = (args) => {
    const { countdown } = args
    this.vcodeBtn.textContent = countdown > 0 ? countdown : "获取"
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

export default new SignUpView()
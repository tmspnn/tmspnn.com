import { View } from "@components/MVC"
import { $ } from "@util/DOM"
import { postJSON } from "@util/xhr"
import PageContainer from "@components/PageContainer/PageContainer"
import CustomSpinner from "@components/CustomSpinner"
import Toast from "@components/Toast/Toast"

class ForgotPasswordView extends View {
  _name = "forgotPassword"

  // DOM references
  emailInput = null
  submitBtn = null

  // Child components
  pageContainer = null
  customSpinner = null
  toast = null

  constructor() {
    super("forgotPassword")
    this.emailInput = $("#email")
    this.submitBtn = $("button")
    this.pageContainer = new PageContainer("forgotPassword")
    this.customSpinner = new CustomSpinner("forgotPassword")
    this.toast = new Toast("forgotPassword")

    const keyUpEvents = ["keyup", "change", "blur"]
    keyUpEvents.forEach(evt => {
      this.emailInput.on(evt, () => {
        this.dispatch("keyupEmailInput", { email: this.emailInput.value })
      })
    })

    this.submitBtn.on("click", () => this.dispatch("clickSubmitBtn"))

    window.on("keyup", e => {
      if (event.key == "Enter") {
        this.submitBtn.click()
      }
    })
  }
}

export default new ForgotPasswordView()
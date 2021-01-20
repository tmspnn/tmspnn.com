import PageContainer from "@components/PageContainer/PageContainer"
import CustomSpinner from "@components/CustomSpinner"
import Toast from "@components/Toast/Toast"

export default class ForgotPasswordView extends View {
  _name = "forgotPassword"

  // DOM references
  emailInput = $("#email")
  submitBtn = $("button")

  // Child components
  pageContainer = new PageContainer("forgotPassword")
  customSpinner = new CustomSpinner("forgotPassword")
  toast = new Toast("forgotPassword")

  constructor() {
    super("forgotPassword")

    this.submitBtn.on("click", () =>
      this.dispatch("clickSubmitBtn", {
        email: this.emailInput.value.trim()
      })
    )

    window.on("keyup", (e) => {
      if (e.key == "Enter") {
        this.submitBtn.click()
      }
    })
  }
}

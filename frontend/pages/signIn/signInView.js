import PageContainer from "@components/PageContainer/PageContainer";
import CustomSpinner from "@components/CustomSpinner";
import Toast from "@components/Toast/Toast";

export default class SignInView extends View {
  _name = "signIn";

  // DOM references
  emailInput = $("#email");
  passwordInput = $("#password");
  eyeBtn = $(".row:nth-child(3) > svg");
  submitBtn = $("button");

  // Child components
  pageContainer = new PageContainer("signIn");
  customSpinner = new CustomSpinner("signIn");
  toast = new Toast("signIn");

  constructor() {
    super("signIn");

    this.eyeBtn.on("click", this.onEyeBtnClick);

    this.submitBtn.on("click", () =>
      this.dispatch("clickSubmitBtn", {
        email: this.emailInput.value.trim(),
        password: this.passwordInput.value.trim(),
      })
    );

    document.body.on("keyup", (e) => {
      if (e.key == "Enter") {
        this.submitBtn.click();
      }
    });
  }

  onEyeBtnClick = () => {
    if (this.passwordInput.type == "password") {
      this.passwordInput.type = "text";
      addClass(this.eyeBtn, "light");
    } else {
      this.passwordInput.type = "password";
      removeClass(this.eyeBtn, "light");
    }
  };
}

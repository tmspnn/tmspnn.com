// @Local
import PageContainer from "@components/PageContainer/PageContainer";
import CustomSpinner from "@components/CustomSpinner";
import Toast from "@components/Toast/Toast";

export default class SignUpView extends View {
    _name = "signUp";

    // DOM references
    emailInput = $("#email");
    vcodeInput = $("#vcode");
    vcodeBtn = $(".acquire-vcode");
    passwordInput = $("#password");
    eyeBtn = $(".row:nth-child(4) > svg");
    submitBtn = $(".submit");

    // Child components
    pageContainer = new PageContainer("signUp");
    customSpinner = new CustomSpinner("signUp");
    toast = new Toast("signUp");

    constructor() {
        super("signUp");

        this.vcodeBtn.on("click", () =>
            this.dispatch("clickVcodeBtn", {
                email: this.emailInput.value.trim()
            })
        );

        this.eyeBtn.on("click", this.onEyeBtnClick);

        this.submitBtn.on("click", () =>
            this.dispatch("clickSubmitBtn", {
                email: this.emailInput.value.trim(),
                vcode: this.vcodeInput.value.trim(),
                password: this.passwordInput.value.trim()
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

    setVcodeCountdown = (args) => {
        const { countdown } = args;
        this.vcodeBtn.firstChild.textContent =
            countdown > 0 ? countdown : "获取";
    };
}

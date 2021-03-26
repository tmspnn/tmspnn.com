import PageContainer from "@components/PageContainer/PageContainer";
import CustomSpinner from "@components/CustomSpinner";
import Toast from "@components/Toast/Toast";

export default class ResetPasswordView extends View {
    _name = "resetPassword";

    // DOM references
    passwordInput = $("#password");
    eyeBtn = $(".row:nth-child(2) > svg");
    submitBtn = $("button");

    // Child components
    pageContainer = new PageContainer("resetPassword");
    customSpinner = new CustomSpinner("resetPassword");
    toast = new Toast("resetPassword");

    constructor() {
        super("resetPassword");

        this.eyeBtn.on("click", this.onEyeBtnClick);

        this.submitBtn.on("click", () =>
            this.dispatch("clickSubmitBtn", {
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
}

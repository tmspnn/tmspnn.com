// External modules
import { Klass } from "k-util";

// Local modules
import "./signUp.scss";
import "../../components/logoHeader.scss";
import Page from "../../components/Page";

const SignUp = Klass(
    {
        constructor() {
            this.Super();
            this.listen();

            const mobileInput = this.refs.mobileInput;
            const vcodeInput = this.refs.vcodeInput;
            const passInput = this.refs.passInput;

            // Auto completion
            const localMobile = localStorage.getItem("signUp.mobile");
            const localVcode = localStorage.getItem("signUp.vcode");

            if (localMobile) {
                mobileInput.value = localMobile;
            }
            if (localVcode) {
                vcodeInput.value = localVcode;
            }

            const eyeIcon = passInput.nextElementSibling;

            eyeIcon.on("click", () => {
                if (eyeIcon.hasClass("light")) {
                    passInput.type = "password";
                    eyeIcon.removeClass("light");
                } else {
                    passInput.type = "text";
                    eyeIcon.addClass("light");
                }
            });
        },

        countdown() {
            this.data.countdown = 60;

            this.data.countdownInterval = setInterval(() => {
                if (--this.data.countdown == 0) {
                    clearInterval(this.data.countdownInterval);
                    this.refs.vcodeBtn.textContent = "获取";
                } else {
                    this.refs.vcodeBtn.textContent = this.data.countdown;
                }
            }, 1000);
        },

        acquireVcode() {
            const mobile = this.refs.mobileInput.value.trim();

            this.postJSON("/api/vcodes", { mobile }).then((res) => {
                this.toast(`验证码${res.vcode}, 10分钟内有效.`);
                this.refs.vcodeInput.value = res.vcode;
                localStorage.setItem("signUp.mobile", mobile);
                localStorage.setItem("signUp.vcode", res.vcode);
            });
        },

        submit() {
            const mobile = this.refs.mobileInput.value.trim();
            const vcode = this.refs.vcodeInput.value.trim();
            const password = this.refs.passInput.value.trim();

            this.postJSON("/api/sign-up", { mobile, vcode, password }).then(
                () => {
                    localStorage.removeItem("signUp.mobile");
                    localStorage.removeItem("signUp.vcode");
                    location.replace("/settings");
                }
            );
        }
    },
    Page
);

new SignUp();

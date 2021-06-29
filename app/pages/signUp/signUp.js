// External modules
import { $ } from "k-dom";
import { Klass } from "k-util";

// Local modules
import "./signUp.scss";
import "../../components/logoHeader.scss";
import Page from "../../components/Page";

const SignUp = Klass(
    {
        constructor() {
            this.Super();
            this.element = $("#root");
            this.setData();
            this.listen();

            const { mobileInput, vcodeInput, passInput } = this.refs;

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
                    this.setData({ passInputType: "password" });
                    eyeIcon.removeClass("light");
                } else {
                    this.setData({ passInputType: "text" });
                    eyeIcon.addClass("light");
                }
            });
        },

        countdown() {
            this.data.countdown = 60;
            this.data.countdownInterval = setInterval(() => {
                if (--this.data.countdown == 0) {
                    clearInterval(this.data.countdownInterval);
                    this.setData({ vcodeBtnText: "获取" });
                } else {
                    this.setData({ vcodeBtnText: this.data.countdown });
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

            this.postJson("/api/sign-up", { mobile, vcode, password }).then(
                () => {
                    localStorage.removeItem("signUp.mobile");
                    localStorage.removeItem("signUp.vcode");
                    location.replace(history.state.prev || "/me");
                }
            );
        }
    },
    Page
);

new SignUp();

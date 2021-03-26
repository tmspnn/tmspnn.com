// @External
import isEmail from "validator/lib/isEmail";

export default class SignUpController extends Controller {
    blocked = false;
    countdown = 0;
    intervalId = 0;

    constructor() {
        super("signUp");
    }

    clickVcodeBtn = (args) => {
        if (this.blocked || this.intervalId != 0) return;

        const { email } = args;

        if (!isEmail(email)) {
            return this.showToast("请输入正确的邮箱地址.");
        }

        this.blocked = true;
        this.ui("customSpinner::show");

        postJSON({
            url: "/api/verification-codes",
            data: { email },
            cb: () => {
                this.showToast("验证码已发送至您的邮箱.");
                this.startCountdown();
            },
            fail: (e) => {
                const err = isJSON(e.message)
                    ? JSON.parse(e.message).err
                    : e.message;
                this.showToast(err);
            },
            final: () => {
                this.blocked = false;
                this.ui("customSpinner::hide");
            }
        });
    };

    clickSubmitBtn = (args) => {
        if (this.blocked) return;

        const { email, vcode, password } = args;

        if (!isEmail(email)) {
            return this.showToast("请输入正确的邮箱地址.");
        }

        if (!_.isNumber(+vcode)) {
            return this.showToast("请输入4位数字验证码.");
        }

        if (password.length < 6) {
            return this.showToast("请输入至少6位的密码.");
        }

        this.blocked = true;
        this.ui("customSpinner::show");

        postJSON({
            url: "/api/sign-up",
            data: args,
            cb: () => {
                location.href = "/";
            },
            fail: (e) => {
                const err = isJSON(e.message)
                    ? JSON.parse(e.message).err
                    : e.message;
                this.showToast(err);
            },
            final: () => {
                this.blocked = false;
                this.ui("customSpinner::hide");
            }
        });
    };

    startCountdown = () => {
        this.countdown = 60;
        this.intervalId = setInterval(() => {
            this.ui("signUp::setVcodeCountdown", {
                countdown: --this.countdown
            });
            if (this.countdown == 0) {
                clearInterval(this.intervalId);
                this.intervalId = 0;
            }
        }, 1000);
    };

    showToast = (texts) => {
        this.ui("toast::show", { texts });
    };
}

// @External
import isEmail from "validator/lib/isEmail";

export default class ForgotPasswordController extends Controller {
  blocked = false;

  constructor() {
    super("forgotPassword");
  }

  clickSubmitBtn = (args) => {
    if (this.blocked) return;

    const { email } = args;

    if (!isEmail(email)) {
      return this.showToast("请输入正确的邮箱地址.");
    }

    this.blocked = true;
    this.ui("customSpinner::show");

    postJSON({
      url: "/api/retrieve-password",
      data: { email },
      cb: () => {
        this.showToast("请通过您收到的邮件重设密码.");
      },
      fail: (e) => {
        const err = isJSON(e.message) ? JSON.parse(e.message).err : e.message;
        this.showToast(err);
      },
      final: () => {
        this.blocked = false;
        this.ui("customSpinner::hide");
      },
    });
  };

  showToast = (texts) => {
    this.ui("toast::show", { texts });
  };
}

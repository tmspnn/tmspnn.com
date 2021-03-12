// @External
import isEmail from "validator/lib/isEmail";
import qs from "qs";

export default class ResetPasswordController extends Controller {
  blocked = false;
  queryString = qs.parse(location.search.slice(1));

  constructor() {
    super("resetPassword");
  }

  clickSubmitBtn = (args) => {
    if (this.blocked) return;

    const { email, sequence } = this.queryString;

    if (!isEmail(email)) {
      return this.showToast("无效的邮箱地址.");
    }

    if (!sequence) {
      return this.showToast("无效的密码序列号.");
    }

    const { password } = args;

    if (password.length < 6) {
      return this.showToast("请输入至少6位的密码.");
    }

    this.blocked = true;
    this.ui("customSpinner::show");

    postJSON({
      url: "/api/reset-password",
      data: { email, sequence, password },
      cb: () => {
        this.showToast("密码重置成功, 请重新登录.");
        setTimeout(() => {
          location.href = "/sign-in";
        }, 5000);
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

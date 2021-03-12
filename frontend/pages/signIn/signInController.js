// @External
import isEmail from "validator/lib/isEmail";

export default class SignInController extends Controller {
  blocked = false;

  constructor() {
    super("signIn");
  }

  clickSubmitBtn = (args) => {
    if (this.blocked) return;

    const { email, password } = args;

    if (!isEmail(email)) {
      return this.showToast("请输入正确的邮箱地址.");
    }

    if (password.length < 6) {
      return this.showToast("请输入至少6位的密码.");
    }

    this.blocked = true;
    this.ui("customSpinner::show");

    postJSON({
      url: "/api/sign-in",
      data: args,
      cb: () => {
          const fromUrl = _.get(history, "state.from")
        location.href = fromUrl || "/";
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

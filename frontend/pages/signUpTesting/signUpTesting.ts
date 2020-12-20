import _ from "lodash";
import isEmail from "validator/lib/isEmail";
// Local modules
import "./signUpTesting.scss";
import { model, view, controller, Message } from "../../components/mvc";
import pageContainer from "../../components/pageContainer/pageContainer";
import spinner from "../../components/spinner";
import toast from "../../components/toast/toast";
import xhr from "../../components/xhr/xhr";

/**
 * Model
 */
_.assign(model, {
  email: "",
  mailsSent: [],

  setEmail(arg: Message & { value: string }) {
    model.email = arg.value;
  }
});

/**
 * View
 */
signUpTesting();
pageContainer();
spinner();
toast();
xhr();

function signUpTesting() {
  const $ = document.querySelector.bind(document);

  const emailInput = $("#email") as HTMLInputElement;
  const submitBtn = $("#btn") as HTMLButtonElement;

  emailInput.addEventListener("keyup", function () {
    view.dispatch("keyupEmailInput", { value: emailInput.value });
  });

  submitBtn.addEventListener("click", function () {
    view.dispatch("clickSubmitBtn");
  });
}

/**
 * Controller
 */
_.assign(controller, {
  keyupEmailInput(arg: Message & { value: string }) {
    controller.mutate("setEmail", { value: arg.value });
  },

  clickSubmitBtn() {
    const { email } = model;
    if (!email || !isEmail(email)) {
      return controller.showToast("请输入正确的邮箱地址");
    }
    controller.render("postJSON", {
      url: "/api/registration-invitations",
      data: { email },
      cb(json: JSON) {
        console.log(0);
      },
      onError(err: Error) {
        console.error(1, err);
      }
    });
  },

  showToast(text: string) {
    controller.render("toast", { text });
  }
});

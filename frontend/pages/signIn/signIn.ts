import _ from "lodash";
import isEmail from "validator/lib/isEmail";
import qs from "qs";
// Local modules
import "./signIn.scss";
import { model, view, controller, Message } from "../../components/mvc";
import isJSON from "../../util/isJSON";
import pageContainer from "../../components/pageContainer/pageContainer";
import spinner from "../../components/spinner";
import toast from "../../components/toast/toast";
import xhr from "../../components/xhr/xhr";

/**
 * Model
 */
const queryString = qs.parse(location.search.slice(1));
const from = queryString.from;

_.assign(model, {
  email: "",
  password: "",
  from,

  setEmail(arg: Message & { value: string }) {
    model.email = arg.value;
  },

  setPassword(arg: Message & { value: string }) {
    model.password = arg.value;
  }
});

/**
 * View
 */
signIn();
pageContainer();
spinner();
toast();
xhr();

function signIn() {
  const $ = document.querySelector.bind(document);

  const emailInput = $("#email") as HTMLInputElement;
  const passwordInput = $("#password") as HTMLInputElement;
  const eyeBtn = document.querySelector(".row:nth-child(3) > svg") as SVGElement;
  const submitBtn = $("button") as HTMLButtonElement;

  emailInput.addEventListener("keyup", function () {
    view.dispatch("keyupEmailInput", { value: emailInput.value });
  });

  passwordInput.addEventListener("keyup", function () {
    view.dispatch("keyupPasswordInput", { value: passwordInput.value });
  });

  eyeBtn.addEventListener("click", function () {
    view.dispatch("clickEyeBtn", { currentVisibility: passwordInput.type != "password" });
  });

  submitBtn.addEventListener("click", function () {
    view.dispatch("clickSubmitBtn");
  });

  function setPasswordVisibility(arg: Message & { value: boolean }) {
    if (arg.value) {
      passwordInput.type = "text";
      eyeBtn.classList.add("light");
    } else {
      passwordInput.type = "password";
      eyeBtn.classList.remove("light");
    }
  }

  view.setPasswordVisibility = setPasswordVisibility;
}

/**
 * Controller
 */
_.assign(controller, {
  blocked: false,

  keyupEmailInput(arg: Message & { value: string }) {
    controller.mutate("setEmail", { value: arg.value });
  },

  keyupPasswordInput(arg: Message & { value: string }) {
    controller.mutate("setPassword", { value: arg.value });
  },

  clickEyeBtn(arg: Message & { currentVisibility: boolean }) {
    controller.render("setPasswordVisibility", { value: !arg.currentVisibility });
  },

  clickSubmitBtn() {
    if (controller.blocked) return;

    const { email, password } = model;

    if (!email || !isEmail(email)) {
      return controller.showToast("请输入正确的邮箱地址");
    }

    if (!model.password || model.password.length < 6) {
      return controller.showToast("请输入至少6位的密码.");
    }

    controller.blocked = true;

    controller.render("postJSON", {
      url: "/api/sign-in",
      data: { email, password },
      cb(json: JSON) {
        location.href = model.from;
      },
      onError(e: Error) {
        const err = isJSON(e.message) ? JSON.parse(e.message).err : e.message;
        controller.showToast(err);
      },
      final() {
        controller.blocked = false;
      }
    });
  },

  showToast(text: string) {
    controller.render("toast", { text });
  }
});

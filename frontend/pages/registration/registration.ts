import _ from "lodash";
import qs from "qs";
import "./registration.scss";
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

_.assign(model, {
  email: queryString.email,
  invitationCode: queryString.invitation_code,
  nickname: "",
  password: "",

  setNickname(arg: Message & { value: string }) {
    model.nickname = arg.value.trim();
  },

  setPassword(arg: Message & { value: string }) {
    model.password = arg.value.trim();
  }
});

/**
 * View
 */
registration();
pageContainer();
spinner();
toast();
xhr();

function registration() {
  const $ = document.querySelector.bind(document);
  const nicknameInput = $("#nickname") as HTMLInputElement;
  const passwordInput = $("#password") as HTMLInputElement;
  const eyeBtn = document.querySelector(".row:nth-child(3) > svg") as SVGElement;
  const submitBtn = $("button") as HTMLButtonElement;

  nicknameInput.addEventListener("keyup", function () {
    view.dispatch("keyupNicknameInput", { value: nicknameInput.value });
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

  keyupNicknameInput(arg: Message & { value: string }) {
    controller.mutate("setNickname", { value: arg.value });
  },

  keyupPasswordInput(arg: Message & { value: string }) {
    controller.mutate("setPassword", { value: arg.value });
  },

  clickEyeBtn(arg: Message & { currentVisibility: boolean }) {
    controller.render("setPasswordVisibility", { value: !arg.currentVisibility });
  },

  clickSubmitBtn() {
    if (controller.blocked) return;

    if (!model.email) {
      return controller.showToast("无效的注册链接, 请重新获取注册邀请邮件.");
    }

    if (!model.invitationCode) {
      return controller.showToast("无效的邀请码.");
    }

    if (!model.nickname) {
      return controller.showToast("请输入昵称.");
    }

    if (!model.password || model.password.length < 6) {
      return controller.showToast("请输入至少6位的密码.");
    }

    controller.blocked = true;

    controller.render("postJSON", {
      url: "/api/users",
      data: {
        email: model.email,
        invitationCode: model.invitationCode,
        nickname: model.nickname,
        password: model.password
      },
      cb(json: JSON) {
        location.href = "/";
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

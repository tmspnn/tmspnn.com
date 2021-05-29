import "./signUp.scss";
import "@components/logoHeader.scss";
import Page from "@components/Page";
import PageController from "@components/PageController";
import toast from "@components/toast/toast";
import customSpinner from "@components/customSpinner";

const namespace = "signUp";

/**
 * @property {Number} root._data.scrollTop
 */
const root = new Page(namespace);
root.toast = toast(namespace);
root.customSpinner = customSpinner(namespace);

// DOM references
const { mobileInput, vcodeInput, vcodeBtn, passInput, signUpBtn } = root._refs;
const eyeIcon = passInput.nextElementSibling;

// UI reactions
root.countdown = () => {
    root._data.countdown = 60;
    root._data.countdownInterval = setInterval(() => {
        if (--root._data.countdown == 0) {
            clearInterval(root._data.countdownInterval);
            vcodeBtn.textContent = "获取";
        } else {
            vcodeBtn.textContent = root._data.countdown;
        }
    }, 1000);
};

// Event listeners
vcodeBtn.on("click", () => {
    if (root._data.countdown > 0) return;
    const mobile = mobileInput.value.trim();
    root.dispatch("acquireVcode", mobile);
});

eyeIcon.on("click", () => {
    if (hasClass(eyeIcon, "light")) {
        passInput.type = "password";
        removeClass(eyeIcon, "light");
    } else {
        passInput.type = "text";
        addClass(eyeIcon, "light");
    }
});

signUpBtn.on("click", () => {
    const mobile = mobileInput.value.trim();
    const password = passInput.value.trim();
    root.dispatch("submit", mobile, password);
});

/**
 * @property ctrl.data
 */
const ctrl = new PageController(namespace);

ctrl.handleException = (e) => {
    if (isJSON(e.message)) {
        const { err } = parseJSON(e.message);
        ctrl.toast(err || "服务器繁忙, 请稍后再试.");
    }
};

ctrl.acquireVcode = async (mobile) => {
    ctrl.postJson("/api/vcodes", { mobile })
        .then(() => {
            ctrl.toast("验证码已发送, 请登录邮箱查看.");
            ctrl.ui("root::countdown");
        })
        .catch(ctrl.handleException);
};

ctrl.submit = (mobile, password) => {
    ctrl.postJson("/api/sign-in", { mobile, password })
        .then((res) => console.log(res))
        .catch(ctrl.handleException);
};

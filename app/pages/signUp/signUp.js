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

// Auto completion
const localMobile = localStorage.getItem("signUp.mobile");
const localVcode = localStorage.getItem("signUp.vcode");
if (localMobile) {
    mobileInput.value = localMobile;
}
if (localVcode) {
    vcodeInput.value = localVcode;
}

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

root.setVcode = (vcode) => {
    vcodeInput.value = vcode;
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
    const vcode = vcodeInput.value.trim();
    const password = passInput.value.trim();
    root.dispatch("submit", mobile, vcode, password);
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
        .then((res) => {
            ctrl.toast(`验证码${res.vcode}, 10分钟内有效.`);
            ctrl.ui("root::countdown").ui("root::setVcode", res.vcode);
            localStorage.setItem("signUp.mobile", mobile);
            localStorage.setItem("signUp.vcode", res.vcode);
        })
        .catch(ctrl.handleException);
};

ctrl.submit = (mobile, vcode, password) => {
    ctrl.postJson("/api/sign-up", { mobile, vcode, password })
        .then(() => {
            localStorage.removeItem("signUp.mobile");
            localStorage.removeItem("signUp.vcode");
            const from = at(history, "state.from");
            location.replace(from || "/me");
        })
        .catch(ctrl.handleException);
};

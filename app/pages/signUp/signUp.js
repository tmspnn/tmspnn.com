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
const { emailInput, vcodeInput, vcodeBtn, passInput, signUpBtn } = root._refs;
const eyeIcon = passInput.nextElementSibling;

vcodeBtn.on("click", () => {
    const email = emailInput.value.trim();
    root.dispatch("acquireVcode", email);
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
    const email = emailInput.value.trim();
    const password = passInput.value.trim();
    root.dispatch("submit", email, password);
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

ctrl.acquireVcode = async (email) => {
    ctrl.postJson("/api/vcodes", { email })
        .then((res) => console.log(res))
        .catch(ctrl.handleException);
};

ctrl.submit = (email, password) => {
    ctrl.postJson("/api/sign-in", { email, password })
        .then((res) => console.log(res))
        .catch(ctrl.handleException);
};

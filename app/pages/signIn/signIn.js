import "./signIn.scss";
import Page from "@components/Page";
import PageController from "@components/PageController";
import "@components/logoHeader.scss";

const namespace = "signIn";

/**
 * @property {Number} root._data.scrollTop
 */
const root = new Page(namespace);

// DOM references
const { emailInput, passInput, signInBtn } = root._refs;
const eyeIcon = passInput.nextElementSibling;

eyeIcon.on("click", () => {
    if (hasClass(eyeIcon, "light")) {
        passInput.type = "password";
        removeClass(eyeIcon, "light");
    } else {
        passInput.type = "text";
        addClass(eyeIcon, "light");
    }
});

signInBtn.on("click", () => {
    const email = emailInput.value.trim();
    const password = passInput.value.trim();
    root.dispatch("submit", email, password);
});

/**
 * @property ctrl.data
 */
const ctrl = new PageController(namespace);

ctrl.submit = (email, password) => {
    ctrl.postJson("/api/sign-in", { email, password }).then((res) =>
        console.log(res)
    );
};

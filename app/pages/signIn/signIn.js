import "./signIn.scss";
import "@components/logoHeader.scss";
import Page from "@components/Page";

function signIn() {
    const pageName = "signIn";

    const root = new Page(pageName);

    // UI logic
    const { mobileInput, passInput, signInBtn } = root._refs;
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
        const mobile = mobileInput.value.trim();
        const password = passInput.value.trim();
        root.dispatch("submit", mobile, password);
    });

    // Business logic
    const { ctrl } = root;

    ctrl.submit = (mobile, password) => {
        ctrl.postJson("/api/sign-in", { mobile, password })
            .then(() => {
                const from = at(history, "state.from");
                location.replace(from || "/me");
            })
            .catch(ctrl.handleException);
    };
}

signIn();

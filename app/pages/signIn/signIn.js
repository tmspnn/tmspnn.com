// External modules
import { $ } from "k-dom";
import { Klass } from "k-util";

// Local modules
import "./signIn.scss";
import "../../components/logoHeader.scss";
import Page from "../../components/Page";

const SignIn = Klass(
    {
        constructor() {
            this.Super();
            this.element = $("#root");
            this.listen();

            const eyeIcon = this.refs.passInput.nextElementSibling;
            eyeIcon.on("click", () => {
                if (eyeIcon.hasClass("light")) {
                    this.refs.passInput.type = "password";
                    eyeIcon.removeClass("light");
                } else {
                    this.refs.passInput.type = "text";
                    eyeIcon.addClass("light");
                }
            });
        },

        submit() {
            const mobile = this.refs.mobileInput.value.trim();
            const password = this.refs.passInput.value.trim();

            this.postJSON("/api/sign-in", { mobile, password }).then(() => {
                // location.replace(history.state.prev || "/me");
            });
        }
    },
    Page
);

new SignIn();

// External modules

// Local modules
import "@components/feed.scss";
import "./author.scss";
import Page from "@components/Page";
import navbar from "@components/navbar/navbar";
import comment from "../article/comment";

function author() {
    const pageName = location.pathname;

    const root = new Page(pageName);

    // Child components
    root.$navbar = navbar(pageName, $(".-navbar"), {});
    root.$navbar.showBackBtn();

    root.$comments = $$(".-comment").map((el, idx) => {
        return comment(pageName, el, root.data.comments[idx]);
    });

    // UI logic

    // Business logic
    const { ctrl } = root;

    ctrl.onWsMessage = (msg) => {
        console.log("author onWsMessage: ", msg);
    };

    ctrl.clickBackBtn = () => {
        const from = at(history, "state.from");
        if (from) {
            history.back();
        } else {
            location.replace("/");
        }
    };
}

author();

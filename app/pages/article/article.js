// External
import "highlight.js/styles/github.css";
import hljs from "highlight.js";

// Local
import "@components/feed.scss";
import "./article.scss";
import Page from "@components/Page";
import PageController from "@components/PageController";
import navbar from "@components/navbar/navbar";
import ratingBar from "./ratingBar";

const namespace = "article";

function article() {
    // Initialization
    const root = new Page(namespace);
    hljs.highlightAll();

    // Child components
    root.$navbar = navbar(namespace, $(".-navbar"), {});
    root.$navbar.showBackBtn();
    root.$ratingBar = ratingBar(
        namespace,
        $(".rating-bar"),
        root._data.my_rating
    );

    // Behaviors
    const ctrl = new PageController(namespace);

    ctrl.onWsMessage = (msg) => {
        console.log("article onWsMessage: ", msg);
    };

    ctrl.rateArticle = (rating) => {
        if (rating == 0) return ctrl.toast("请给出1-5星的评价.");
        ctrl.postJson("/api/ratings", { rating }).then(() => {
            ctrl.ui("ratingBar::rated", rating);
        });
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

article();

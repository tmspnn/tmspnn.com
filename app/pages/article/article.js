// External modules
import "highlight.js/styles/github.css";
import hljs from "highlight.js";

// Local modules
import "@components/feed.scss";
import "./article.scss";
import Page from "@components/Page";
import navbar from "@components/navbar/navbar";
import ratingBar from "./ratingBar";
import comment from "./comment";

function article() {
    const pageName = "article";

    const root = new Page(pageName);
    root.prefetch = ["/", "/comment-editor?article_id=" + root.data.article.id];

    hljs.highlightAll();

    // Child components
    root.$navbar = navbar(pageName, $(".-navbar"), {});
    root.$navbar.showBackBtn();

    root.$ratingBar = ratingBar(
        pageName,
        $(".rating-bar"),
        root.data.my_rating
    );

    root.$comments = $$(".-comment").map((el, idx) => {
        return comment(pageName, el, root.data.comments[idx]);
    });

    // Event listeners
    $("button.comment").on("click", () => {
        root.go("/comment-editor?article_id=" + root.data.article.id);
    });

    // Behaviors
    const { ctrl } = root;

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

// External modules
import { $ } from "k-dom";
import { Klass } from "k-util";
import "highlight.js/styles/github.css";
import hljs from "highlight.js";

// Local modules
import "./article.scss";

import Page from "@components/Page";
import navbar from "@components/navbar/navbar";
import ratingBar from "./ratingBar";
import comment from "./comment";
import reportAbusePanel from "./reportAbusePanel";

function article() {
    const pageName = location.pathname;

    const root = new Page(pageName);

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

    root.$reportAbusePanel = reportAbusePanel(pageName);

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

    ctrl.advocateComment = (commentId) => {
        ctrl.putJson(`/api/comments/${commentId}/advocators`)
            .then((res) => {
                ctrl.ui(
                    `comment(${commentId})::onAdvocation`,
                    res.advocated ? 1 : -1
                );
            })
            .catch(ctrl.handleException);
    };

    ctrl.reportAbuse = (reference) => {
        const { commentId, reason } = reference;

        if (reason.length < 5) {
            return ctrl.toast("请选择或填写5个字以上的举报原因.");
        }

        ctrl.postJson("/api/abuse-reports", reference).then(() => {
            ctrl.toast("举报已提交!");
            ctrl.ui(`comment(${commentId})::destroy`).ui(
                "reportAbusePanel::hide"
            );
        });
    };
}

article();

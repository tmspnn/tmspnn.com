// External modules
import { $ } from "k-dom";
import { each, Klass } from "k-util";
import "highlight.js/styles/github.css";
import hljs from "highlight.js";

// Local modules
import "./article.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";
import RatingBar from "./RatingBar";
import Comment from "./Comment";
import ReportAbusePanel from "./ReportAbusePanel";

const Article = Klass(
    {
        constructor() {
            this.Super();
            this.setData();
            this.listen();

            hljs.highlightAll();

            // Child components
            new Navbar($(".-navbar"), { leftBtn: "back" });

            new RatingBar($(".rating-bar"), { rating: this.data.my_rating });

            each($$(".-comment"), (el, idx) => {
                new Comment(el, this.data.comments[idx]);
            });

            document.body.appendChild(new ReportAbusePanel().element);

            // Event listeners
            $("button.comment").on("click", () => this.editComment());

            // WebSocket
            if (this.ws) {
                this.ws.onMessage = this.onWsMessage.bind(this);
            }
        },

        onWsMessage(msg) {
            console.log("Article.onWsMessage: ", msg);
        },

        editComment() {
            this.$container.go(
                "/comment-editor?article_id=" + this.data.article.id
            );
        },

        rateArticle(rating) {
            if (rating == 0) {
                return this.toast("请给出1-5星的评价.");
            }
            this.postJSON("/api/ratings", { rating }).then(() => {
                this.dispatch("ratingBar.onRated", rating);
            });
        },

        clickBackBtn() {
            const from = at(history, "state.from");
            if (from) {
                history.back();
            } else {
                location.replace("/");
            }
        },

        advocateComment(commentId) {
            this.putJSON(`/api/comments/${commentId}/advocators`).then(
                (res) => {
                    this.dispatch(
                        `comment(${commentId}).onAdvocation`,
                        res.advocated ? 1 : -1
                    );
                }
            );
        },

        reportAbuse(reference) {
            const { commentId, reason } = reference;

            if (reason.length < 5) {
                return this.toast("请选择或填写5个字以上的举报原因.");
            }

            this.postJSON("/api/abuse-reports", reference).then(() => {
                this.toast("举报已提交!");
                this.dispatch(`comment(${commentId}).destroy`);
                this.dispatch("reportAbusePanel.hide");
            });
        }
    },
    Page
);

new Article();

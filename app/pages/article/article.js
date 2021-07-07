// External modules
import { $, $$ } from "k-dom";
import { each, Klass } from "k-util";
import "highlight.js/styles/github.css";
import hljs from "highlight.js";

// Local modules
import "./article.scss";
import Page from "../../components/Page";
import Navbar from "../../components/Navbar/Navbar";
import Comment from "./Comment";
import ReportAbusePanel from "./ReportAbusePanel";

const Article = Klass(
    {
        ratingText: ["很差", "差", "一般", "好", "很好"],

        constructor() {
            this.Super();
            this.listen();
            this.refs.stars = $$(".rating-bar .star");

            hljs.highlightAll();

            // Child components
            new Navbar({ leftBtn: "back" });

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

        onStarClick(e) {
            const div = e.currentTarget;
            const rating = 1 + (div.dataset.idx | 0);

            if (this.data.rating == rating) {
                this.data.rating = 0;
                each(this.refs.stars, (div) => div.removeClass("active"));
                this.refs.ratingText.textContent = "";
            } else {
                this.data.rating = rating;

                each(this.refs.stars, (div, idx) => {
                    +idx < this.data.rating
                        ? div.addClass("active")
                        : div.removeClass("active");
                });

                this.refs.ratingText.textContent =
                    this.ratingText[this.data.rating - 1];
            }
        },

        editComment() {
            this.$container.go(
                "/comment-editor?article_id=" + this.data.article.id
            );
        },

        rate(rating) {
            if (rating == 0) {
                return this.toast("请给出1-5星的评价.");
            }
            this.postJSON("/api/ratings", { rating }).then(() => {
                this.dispatch("ratingBar.onRated", rating);
            });
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

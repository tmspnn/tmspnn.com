import { $, DOM } from "k-dom";
import { Klass, View, toArray } from "k-util";
//
import "./ReportAbusePanel.scss";
import T from "./ReportAbusePanel.html";
//
const ReportAbusePanel = Klass(
    {
        name: "reportAbusePanel",

        constructor() {
            this.Super();
            this.element = DOM(T);
            this.listen();

            this.refs.panel.on(
                "click",
                (e) => {
                    e.stopPropagation();
                },
                { passive: false }
            );
        },

        show(comment) {
            this.data = comment;
            this.element.hidden = false;
            requestAnimationFrame(() => {
                this.refs.panel.removeClass("folded");
            });
        },

        hide() {
            this.refs.panel.addClass("folded");
            setTimeout(() => {
                this.element.hidden = true;
            }, 200);
        },

        toggleCheckMark(e) {
            e.currentTarget.toggleClass("active");
        },

        submit() {
            const reason =
                toArray(this.refs.ul.children)
                    .filter((el) => el.hasClass("active"))
                    .map((el) => el.textContent.trim())
                    .join(" | ") + this.refs.textarea.value.trim();

            this.dispatch(".reportAbuse", {
                reason,
                commentId: this.data.id
            });
        }
    },
    View
);

export default ReportAbusePanel;

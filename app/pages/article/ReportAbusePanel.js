// External modules
import { $, DOM } from "k-dom";
import { Klass, View, toArray } from "k-util";

// Local modules
import T from "./ReportAbusePanel.html";

const assign = Object.assign;

const ReportAbusePanel = Klass(
    {
        name: "reportAbusePanel",

        constructor() {
            this.Super();
            this.element = DOM(T);
            this.setData({ selfHidden: true });

            this.refs.panel.on(
                "click",
                (e) => {
                    e.stopPropagation();
                },
                { passive: false }
            );
        },

        show(comment) {
            this.setData(assign(comment, { selfHidden: false }));
            setTimeout(() => {
                this.refs.panel.removeClass("folded");
            }, 50);
        },

        hide() {
            this.refs.panel.addClass("folded");
            setTimeout(() => {
                this.setData("selfHidden", true);
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
                    .join(" | ") + textarea.value.trim();

            this.dispatch(".reportAbuse", {
                reason,
                commentId: this.data.id
            });
        }
    },
    View
);

export default ReportAbusePanel;

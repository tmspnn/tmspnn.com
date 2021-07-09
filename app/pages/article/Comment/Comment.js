import { Klass, View } from "k-util";
//
import "./Comment.scss";
//
const Comment = Klass(
    {
        constructor(element, data) {
            this.Super();
            this.name = `comment(${data.id})`;
            this.element = element;
            this.data = data;
            this.refs = {};
            this.listen();

            if (this.refs.reference.scrollHeight > 160) {
                this.refs.arrow.hidden = false;
            }
        },

        onAdvocation(n) {
            this.data.advocators_count += n;
            this.refs.advocatorsCount.textContent = this.data.advocators_count;

            this.data.advocated = n > 0;
            this.data.advocated
                ? this.refs.advocateBtn.addClass("active")
                : this.refs.advocateBtn.removeClass("active");
        },

        clickAdvocateBtn() {
            console.log(this.data.id);
            this.dispatch(".advocateComment", this.data.id);
        },

        clickReportAbuseBtn() {
            this.dispatch("reportAbusePanel.show", this.data);
        },

        clickArrow() {
            this.refs.referenceContent.toggleClass("folded");
        }
    },
    View
);

export default Comment;

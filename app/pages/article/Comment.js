// External modules
import { Klass, View } from "k-util";

const assign = Object.assign;

const Comment = Klass(
    {
        constructor(element, data) {
            this.Super();
            this.name = `comment(${data.id})`;
            this.element = element;
            this.setData(
                assign(data, {
                    advocateBtnClassName:
                        "advocate " + data.advocated ? "active" : ""
                })
            );
        },

        onAdvocation(n) {
            this.setData({
                advocated: n > 0,
                advocators_count: this.data.advocators_count + n,
                advocateBtnClassName: "advocate " + (n > 0 ? "active" : "")
            });
        },

        clickAdvocateBtn() {
            this.dispatch("advocateComment", this.data.id);
        },

        clickReportAbuseBtn() {
            this.dispatch("reportAbusePanel.show", this.data);
        }
    },
    View
);

export default Comment;

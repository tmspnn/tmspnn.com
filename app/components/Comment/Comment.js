export default class Comment extends View {
    _name = "comment";

    constructor(namespace, element, data) {
        super(namespace, element, data);
        this._refs.advocateBtn.on("click", () => {
            this.dispatch("changeAttitudeToComment", this._data);
        });
        this._refs.replyBtn.on("click", () => {
            this.ui("article::referToComment", this._data);
        });
        this._refs.reportAbuseBtn.on("click", () => {
            this.dispatch("reportCommentAbuse", this._data);
        });
    }

    setAdvocatorsCount = (count) => {
        this._refs.advocatorsCountSpan.textContent = count;
    };

    onAttitudeChange = (advocated, advocators_count) => {
        this._data.advocated = advocated;
        if (advocated) {
            addClass(this._refs.advocateBtn, "active");
        } else {
            removeClass(this._refs.advocateBtn, "active");
        }
        this._refs.advocatorsCountSpan.textContent = advocators_count;
    };

    onAbuseReport = (commentId) => {
        if (this._data.id == commentId) {
            this.destroy();
        }
    };
}

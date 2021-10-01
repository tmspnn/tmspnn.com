import { Klass, View } from "k-util";
import { DOM } from "k-dom";
//
import "./Toast.scss";

const T = `
<div class="-toast" hidden>
    <div class="text invisible" data-on="transitionend: onTextTransitionEnd" data-ref="textDiv"></div>
</div>
`;

const toastProto = {
    name: "toast",

    available: true,

    timeout: 1500,

    constructor() {
        this.Super();
        this.element = DOM(T);
        this.listen();
        document.body.appendChild(this.element);
    },

    show(text) {
        if (!this.available) return;

        this.available = false;
        this.element.hidden = false;

        setTimeout(() => {
            this.refs.textDiv.textContent = text;
            this.refs.textDiv.removeClass("invisible");
        }, 50);
    },

    hide() {
        this.refs.textDiv.addClass("invisible");
    },

    onTextTransitionEnd() {
        if (this.refs.textDiv.hasClass("invisible")) {
            this.element.hidden = true;
            this.available = true;
        } else {
            setTimeout(() => this.hide(), this.timeout);
        }
    }
};

export default Klass(toastProto, View);

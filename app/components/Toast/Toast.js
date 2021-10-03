import { View } from "k-util";
import { DOM } from "k-dom";
import "./Toast.scss";
import T from "./Toast.html";

export default class Toast extends View {
    constructor() {
        super();
        this.name = "toast";
        this.available = true;
        this.timeout = 1500;
        this.element = DOM(T);
        document.body.appendChild(this.element);
    }

    show(text) {
        if (!this.available) return;

        this.available = false;
        this.element.hidden = false;

        setTimeout(() => {
            this.refs.textDiv.textContent = text;
            this.refs.textDiv.removeClass("invisible");
        }, 50);
    }

    hide() {
        this.refs.textDiv.addClass("invisible");
    }

    onTextTransitionEnd() {
        if (this.refs.textDiv.hasClass("invisible")) {
            this.element.hidden = true;
            this.available = true;
        } else {
            setTimeout(() => this.hide(), this.timeout);
        }
    }
}

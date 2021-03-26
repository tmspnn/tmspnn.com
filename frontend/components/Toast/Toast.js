import "./Toast.scss";

export default class Toast extends View {
    _name = "toast";
    element = null;
    textsEl = null;
    timeout = 1500;
    available = true;

    constructor(namespace) {
        super(namespace);
        this.element = $(".-toast");
        this.textsEl = $(".texts", this.element);
    }

    show = (args) => {
        if (!this.available) return;
        this.available = false;
        this.element.hidden = false;
        setTimeout(() => {
            this.textsEl.addEventListener("transitionend", this.onTextsShow);
            this.textsEl.textContent = args.texts;
            removeClass(this.textsEl, "invisible");
        }, 50);
    };

    hide = () => {
        this.textsEl.addEventListener("transitionend", this.onTextsHide);
        addClass(this.textsEl, "invisible");
    };

    onTextsShow = () => {
        this.textsEl.removeEventListener("transitionend", this.onTextsShow);
        setTimeout(this.hide, this.timeout);
    };

    onTextsHide = () => {
        this.textsEl.removeEventListener("transitionend", this.onTextsHide);
        this.element.hidden = true;
        this.available = true;
    };
}

import "./toast.scss";

export default function toast(name) {
    const v = new View(
        name,
        html2DOM(`
        <div class="-toast" hidden>
            <div class="text invisible"></div>
        </div>`)
    );
    v._name = "toast";

    const textEl = $(".text", v._element);
    const timeout = 1500;
    let available = true;

    v.show = (text) => {
        if (!available) return;
        available = false;
        v._element.hidden = false;
        setTimeout(() => {
            textEl.on("transitionend", v.ontextShow);
            textEl.textContent = text;
            removeClass(textEl, "invisible");
        }, 52);
    };

    v.hide = () => {
        textEl.on("transitionend", v.ontextHide);
        addClass(textEl, "invisible");
    };

    v.ontextShow = () => {
        textEl.off("transitionend", v.ontextShow);
        setTimeout(v.hide, timeout);
    };

    v.ontextHide = () => {
        textEl.off("transitionend", v.ontextHide);
        v._element.hidden = true;
        available = true;
    };

    document.body.appendChild(v._element);

    return v;
}

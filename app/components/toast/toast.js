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

    v.show = (texts) => {
        if (!available) return;
        available = false;
        v._element.hidden = false;
        setTimeout(() => {
            textEl.on("transitionend", v.onTextsShow);
            textEl.textContent = texts;
            removeClass(textEl, "invisible");
        }, 52);
    };

    v.hide = () => {
        textEl.on("transitionend", v.onTextsHide);
        addClass(textEl, "invisible");
    };

    v.onTextsShow = () => {
        textEl.off("transitionend", v.onTextsShow);
        setTimeout(v.hide, timeout);
    };

    v.onTextsHide = () => {
        textEl.off("transitionend", v.onTextsHide);
        v._element.hidden = true;
        available = true;
    };

    document.body.appendChild(v._element);

    return v;
}

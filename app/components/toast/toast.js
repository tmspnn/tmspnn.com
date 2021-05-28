import "./toast.scss";

export default function toast(namespace) {
    const view = new View(
        namespace,
        html2DOM(`
        <div class="-toast" hidden>
            <div class="texts invisible"></div>
        </div>`)
    );
    view._name = "toast";

    const textsEl = $(".texts", view._element);
    const timeout = 1500;
    let available = true;

    view.show = (texts) => {
        if (!available) return;
        available = false;
        view._element.hidden = false;
        setTimeout(() => {
            textsEl.on("transitionend", view.onTextsShow);
            textsEl.textContent = texts;
            removeClass(textsEl, "invisible");
        }, 52);
    };

    view.hide = () => {
        textsEl.on("transitionend", view.onTextsHide);
        addClass(textsEl, "invisible");
    };

    view.onTextsShow = () => {
        textsEl.off("transitionend", view.onTextsShow);
        setTimeout(view.hide, timeout);
    };

    view.onTextsHide = () => {
        textsEl.off("transitionend", view.onTextsHide);
        view._element.hidden = true;
        available = true;
    };

    document.body.appendChild(view._element);

    return view;
}

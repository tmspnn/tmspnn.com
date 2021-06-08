export default function ratingBar(namespace, element, myRating) {
    if (myRating) return;

    const view = new View(namespace, element, myRating);
    view._name = "ratingBar";

    const starDivs = $$("div", element);
    const descSpan = $("span", element);
    const desc = ["很差", "差", "一般", "好", "很好"];
    const h3 = $("h3", element);
    const btn = $("button", element);

    starDivs.forEach((el, idx) => {
        el.on("click", () => {
            if (
                hasClass(el, "active") &&
                !hasClass(el.nextElementSibling, "active")
            ) {
                starDivs.forEach((e) => {
                    removeClass(e, "active");
                });
                descSpan.textContent = "";
            } else {
                starDivs.forEach((e, i) => {
                    if (i <= idx) {
                        addClass(e, "active");
                    } else {
                        removeClass(e, "active");
                    }
                });
                descSpan.textContent = desc[idx];
            }
        });
    });

    btn.on("click", () => {
        const myRating = starDivs.filter((el) => hasClass(el, "active")).length;
        view.dispatch("rateArticle", myRating);
    });

    view.rated = () => {
        h3.hidden = false;
        btn.hidden = true;
        descSpan.textContent = "";
    };

    return view;
}

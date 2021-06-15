import { hasClass, toggleClass } from "k-dom";

const checkIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
</svg>`;

export default function reportAbusePanel(pageName) {
    const v = new View(
        pageName,
        html2DOM(`
        <div class="-report-abuse-panel" hidden>
            <div class="panel folded">
                <ul>
                    <li>政治, 反动.${checkIcon}</li>
                    <li>淫秽, 暴力.${checkIcon}</li>
                    <li>侵犯版权, 著作权.${checkIcon}</li>
                </ul>
                <textarea placeholder="其他..."></textarea>
                <button>提交</button>
            </div>
        </div>
        `),
        null
    );
    v._name = "reportAbusePanel";

    const panel = $(".panel", v._element);
    const items = $$("li", panel);
    const btn = $("button", v._element);
    const textarea = $("textarea", v._element);

    v.show = (comment) => {
        v._data = comment;
        v._element.hidden = false;
        setTimeout(() => {
            removeClass(panel, "folded");
        }, 52);
    };

    v.hide = () => {
        addClass(panel, "folded");
        setTimeout(() => {
            v._element.hidden = true;
        }, 200);
    };

    v._element.on("click", v.hide);

    panel.on(
        "click",
        (e) => {
            e.stopPropagation();
        },
        { passive: false }
    );

    each(items, (el) => {
        el.on("click", () => {
            toggleClass(el, "active");
        });
    });

    btn.on("click", () => {
        const reason =
            items
                .filter((el) => hasClass(el, "active"))
                .map((el) => el.textContent.trim())
                .join(" | ") + textarea.value.trim();

        v.dispatch("reportAbuse", {
            reason,
            commentId: v._data.id
        });
    });

    document.body.appendChild(v._element);

    return v;
}

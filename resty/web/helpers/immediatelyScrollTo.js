/**
 * @param {HTMLElement} el
 * @param {Number} scrollTop
 */
export default function immediatelyScrollTo(el, scrollTop) {
    const maxScrollTop = Math.max(0, el.scrollHeight - window.innerHeight);

    if (scrollTop < 0 || scrollTop > maxScrollTop) return;

    el.scrollTop = scrollTop;

    if (scrollTop - el.scrollTop > 1) {
        requestAnimationFrame(() => immediatelyScrollTo(el, scrollTop));
    }
}

/**
 * @param {HTMLElement} el
 * @param {unsigned int} scrollTop
 */
export default function immediatelyScrollTo(el, scrollTop) {
    el.scrollTop = scrollTop;
    if (scrollTop - el.scrollTop > 1) {
        requestAnimationFrame(() => immediatelyScrollTo(el, scrollTop));
    }
}

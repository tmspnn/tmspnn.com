EventTarget.prototype.on = EventTarget.prototype.addEventListener;
EventTarget.prototype.off = EventTarget.prototype.removeEventListener;

export function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
}

export function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
}

export function cloneNode(el) {
    return el.cloneNode(true);
}

export function clearNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

export function replaceNode(newEl, el) {
    if (el.parentNode) {
        el.parentNode.replaceChild(newEl, el);
    }
}

export function removeNode(node) {
    if (typeof node.remove == "function") {
        node.remove();
    } else if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}

export function addClass(el, ...classNames) {
    el.classList.add(...classNames);
}

export function removeClass(el, ...classNames) {
    el.classList.remove(...classNames);
}

export function toggleClass(el, ...classNames) {
    el.classList.toggle(...classNames);
}

export function hasClass(el, className) {
    return el.classList.contains(className);
}

export function cloneScriptElement(el) {
    const script = document.createElement("script");
    if (el.id) script.id = el.id;
    if (el.src) script.src = el.src;
    script.type = el.type || "text/javascript";
    script.textContent = el.textContent || "";
    return script;
}

export function createStyleElement(texts) {
    const style = document.createElement("style");
    style.textContent = texts;
    return style;
}

export function filterVisibleElements(elements) {
    const visibleElements = [];

    for (let i = 0; i < elements.length; ++i) {
        const el = elements[i];
        if (el.offsetParent || el.offsetWidth > 0) {
            visibleElements.push(el);
        }
    }

    return visibleElements;
}

const parser = new DOMParser();
export function html2DOM(html) {
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.firstChild;
}

export function $(sel: string, ctx?: HTMLElement): HTMLElement | null {
  return (ctx || document).querySelector(sel);
}

export function $$(sel: string, ctx?: HTMLElement): Array<HTMLElement> {
  return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
}

export function cloneNode(el: Node): Node {
  return el.cloneNode(true);
}

export function replaceNode(el: Node, newEl: Node) {
  if (el.parentNode) {
    el.parentNode.replaceChild(newEl, el);
  }
}

export function addClass(el: HTMLElement, ...classNames: string[]) {
  el.classList.add(...classNames);
}

export function removeClass(el: HTMLElement, ...classNames: string[]) {
  el.classList.remove(...classNames);
}

export function hasClass(el: HTMLElement, className: string) {
  return el.classList.contains(className);
}

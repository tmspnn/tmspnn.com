export default function filterVisibleElements(
  elements: HTMLCollection | Array<HTMLElement> | NodeList
) {
  const visibleElements = [];

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;
    if (el.offsetParent || el.offsetWidth > 0) {
      visibleElements.push(el);
    }
  }

  return visibleElements;
}

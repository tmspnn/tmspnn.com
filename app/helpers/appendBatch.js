/**
 * @param {HTMLElement} parent
 * @param {HTMLElement[]} elements
 */
export default function appendBatch(parent, elements) {
    const docFrag = document.createDocumentFragment();

    for (let i = 0; i < elements.length; ++i) {
        docFrag.appendChild(elements[i]);
    }

    parent.appendChild(docFrag);
}

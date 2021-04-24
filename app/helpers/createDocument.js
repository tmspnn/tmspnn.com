import { clearNode, cloneScriptElement } from "@helpers/DOM";

export default function createDocument(html) {
    // Script tags in htmlDoc won't execute
    const htmlDoc = document.implementation.createHTMLDocument("");
    htmlDoc.documentElement.innerHTML = html;
    const doc = document.implementation.createHTMLDocument("");
    const scriptsInHead = [];
    const scriptsInBody = [];

    // Head
    clearNode(doc.head); // Remove the title tag
    const elementsInHead = htmlDoc.head.children;

    for (let i = 0; i < elementsInHead.length; ++i) {
        const el = elementsInHead[i];
        if (el instanceof HTMLScriptElement) {
            scriptsInHead.push(cloneScriptElement(el));
        } else {
            const clonedEl = doc.importNode(el, true);
            doc.head.appendChild(clonedEl);
        }
    }

    // body
    clearNode(doc.body);
    const elementsInBody = htmlDoc.body.children;

    for (let i = 0; i < elementsInBody.length; ++i) {
        const el = elementsInBody[i];
        if (el instanceof HTMLScriptElement) {
            scriptsInBody.push(cloneScriptElement(el));
        } else {
            const clonedEl = doc.importNode(el, true);
            doc.body.appendChild(clonedEl);
        }
    }

    return {
        documentElement: doc.documentElement,
        loaded: false,
        scriptsInHead,
        scriptsInBody
    };
}

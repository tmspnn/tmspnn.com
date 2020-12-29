import { clearNode, cloneScriptElement } from "@util/DOM"

export default function createDocument(html) {
  // script tags in htmlDoc won"t execute
  const htmlDoc = document.implementation.createHTMLDocument("")
  htmlDoc.documentElement.innerHTML = html
  const doc = document.implementation.createHTMLDocument("")
  const scriptsInHead = []
  const scriptsInBody = []

  // head
  clearNode(doc.head)
  const elementsInHead = htmlDoc.head.children

  for (let i = 0; i < elementsInHead.length; i++) {
    const el = elementsInHead[i]
    if (el instanceof HTMLScriptElement) {
      scriptsInHead.push(cloneScriptElement(el))
    } else {
      const clonedEl = doc.importNode(el, true)
      doc.head.appendChild(clonedEl)
    }
  }

  // body
  clearNode(doc.body)
  const elementsInBody = htmlDoc.body.children

  for (let i = 0; i < elementsInBody.length; i++) {
    const el = elementsInBody[i]
    if (el instanceof HTMLScriptElement) {
      scriptsInBody.push(cloneScriptElement(el))
    } else {
      const clonedEl = doc.importNode(el, true)
      doc.body.appendChild(clonedEl)
    }
  }

  return {
    documentElement: doc.documentElement,
    loaded: false,
    scriptsInHead,
    scriptsInBody
  }
}
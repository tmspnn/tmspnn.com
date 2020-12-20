import { view } from "../mvc";
import Doc from "../../interfaces/Doc";
import filterVisibleElements from "../../util/filterVisibleElements";
import isSameOrigin from "../../util/isSameOrigin";
import createDocument from "../../util/createDocument";
import createStyleElement from "../../util/createStyleElement";

const win = window as any;
const defaultStyles = `
  .-page-container > * {
    transition: all 120ms ease;
  }

  .-page-container > .invisible {
    opacity: 0;
    transform: translate3d(0, 2.4rem, 0);
  }
`;

let cache: { [k: string]: Doc } = {};
let lastUrl = "";
let currentUrl = location.href.replace(/#.*/, "");
let destUrl = "";
let transitingElementsCount = 0;
let pendingXHR: null | XMLHttpRequest = null;
let callback: null | ((...args: any[]) => void) = null;
let shouldPushState = false;

function pageContainer() {
  if (win._pageContainer) return;

  insertDefaultStyles(document);
  cache[location.href] = {
    documentElement: document.documentElement as HTMLHtmlElement,
    loaded: true
  };

  const anchors = document.getElementsByTagName("a");

  for (let i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener("click", onLinkClick, { passive: false });
  }

  history.replaceState({ url: currentUrl, from: null }, "");
  addEventListener("popstate", onPopState);

  win._pageContainer = pageContainer;
}

pageContainer.toPage = toPage;

export default pageContainer;

function insertDefaultStyles(doc: Document) {
  doc.head.insertBefore(createStyleElement(defaultStyles), doc.head.firstChild);
}

function onLinkClick(e: Event) {
  const a = e.currentTarget as HTMLAnchorElement;
  const url = a.href.replace(/#.*/, "");

  if (!isSameOrigin(url)) return;

  e.preventDefault();
  e.stopPropagation();

  if (currentUrl == url || destUrl == url) return;

  destUrl = url;
  shouldPushState = true;
  switchPage();
}

function onPopState(e: PopStateEvent) {
  destUrl = e.state.url;
  shouldPushState = false;
  switchPage();
}

function toPage(url: string, pushState: boolean = true) {
  const anchor = document.createElement("a");
  anchor.href = url; // transform relative paths to absolute paths
  const parsedUrl = anchor.href.replace(/#.*/, "");

  if (!isSameOrigin(parsedUrl) || currentUrl == parsedUrl) return;

  destUrl = parsedUrl;
  shouldPushState = pushState;
  switchPage();
}

function switchPage() {
  const elementsToHide = filterVisibleElements(
    document.querySelectorAll(".-page-container > :not(.invisible)")
  );

  if (elementsToHide.length > 0) {
    if (transitingElementsCount == 0) {
      // Hide current page
      for (let i = 0; i < elementsToHide.length; i++) {
        const el = elementsToHide[i] as HTMLElement;
        transitingElementsCount++;
        el.addEventListener("transitionend", onElementTransitionEnd);
        el.classList.add("invisible");
      }
    }
  } else {
    setTimeout(nextStep, 0);
  }

  // Load new page
  if (!(destUrl in cache)) {
    loadPage();
  }

  callback = showDestPage;
}

function onElementTransitionEnd(e: Event) {
  e.currentTarget!.removeEventListener("transitionend", onElementTransitionEnd);

  if (--transitingElementsCount == 0) {
    nextStep();
  }
}

function showDestPage() {
  if (transitingElementsCount != 0 || !cache[destUrl]) return;

  const doc = cache[destUrl];
  const elementsToShow = doc.documentElement.querySelectorAll(".-page-container > *");

  if (elementsToShow.length > 0) {
    for (let i = 0; i < elementsToShow.length; i++) {
      elementsToShow[i].classList.add("invisible");
    }

    if (document.documentElement != doc.documentElement) {
      loadDocument(doc);
    }

    setTimeout(function () {
      const transitingElements = filterVisibleElements(
        document.querySelectorAll(".-page-container > .invisible")
      );

      for (let i = 0; i < transitingElements.length; i++) {
        const el = transitingElements[i] as HTMLElement;
        transitingElementsCount++;
        el.addEventListener("transitionend", onElementTransitionEnd);
        el.classList.remove("invisible");
      }
    }, 20);
  } else {
    setTimeout(nextStep, 0);
  }

  if (shouldPushState) {
    history.pushState({ url: destUrl, from: currentUrl }, "", destUrl);
  }

  callback = cleanUp;
}

function loadDocument(doc: Doc) {
  document.replaceChild(doc.documentElement, document.documentElement);

  if (!doc.loaded) {
    for (let i = 0; i < doc.scriptsInHead!.length; i++) {
      document.head.appendChild(doc.scriptsInHead![i]);
    }

    for (let i = 0; i < doc.scriptsInBody!.length; i++) {
      document.body.appendChild(doc.scriptsInBody![i]);
    }

    doc.loaded = true;
  }
}

function loadPage() {
  beforeLoadingPage();
  pendingXHR = new XMLHttpRequest();
  pendingXHR.open("GET", destUrl, true);
  pendingXHR.onload = onXHRLoad;
  pendingXHR.onerror = onXHRError;
  pendingXHR.onprogress = onLoadingProgress;
  pendingXHR.send();
}

function onXHRLoad() {
  const status = pendingXHR!.status;

  if (status >= 200 && status < 400) {
    const docNScripts = createDocument(pendingXHR!.responseText);
    const head = docNScripts.documentElement.querySelector("head");
    head!.insertBefore(createStyleElement(defaultStyles), head!.firstChild);
    cache[destUrl] = docNScripts;
    afterLoadingPage();
    nextStep();
  } else {
    onXHRError();
  }
}

function onXHRError() {
  const status = pendingXHR!.status;
  afterLoadingPage();
  view.dispatch("error", {
    _sentBy: "pageContainer",
    type: "HTTP",
    status,
    message: status + ": Failed to load " + destUrl
  });
}

function onLoadingProgress(e: ProgressEvent) {
  const progress = e.loaded / e.total;
  view.dispatch("loadingProgress", {
    _sentBy: "pageContainer",
    progress
  });
}

function beforeLoadingPage() {
  view.dispatch("loadingUrl", {
    _sentBy: "pageContainer",
    url: destUrl
  });
}

function afterLoadingPage() {
  view.dispatch("loadingUrl", {
    _sentBy: "pageContainer",
    url: null
  });
}

function cleanUp() {
  lastUrl = currentUrl;
  currentUrl = destUrl;
  destUrl = "";
  callback = null;
  pendingXHR = null;
}

function nextStep() {
  if (typeof callback == "function") callback();
}

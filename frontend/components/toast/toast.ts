import "./toast.scss";
import { view, Message } from "../mvc";

const timeout = 1500;

export default function toast() {
  const toastDiv = document.querySelector(".-toast") as HTMLDivElement;
  const textsDiv = toastDiv.querySelector(".texts") as HTMLDivElement;
  let available = true;

  function show(arg: Message) {
    if (!available) return;
    available = false;
    toastDiv.hidden = false;
    setTimeout(function () {
      textsDiv.addEventListener("transitionend", onShow);
      textsDiv.textContent = arg.texts;
      textsDiv.classList.remove("invisible");
    }, 50);
  }

  function onShow(e: TransitionEvent) {
    textsDiv.removeEventListener("transitionend", onShow);
    setTimeout(hide, timeout);
  }

  function hide() {
    textsDiv.addEventListener("transitionend", onHide);
    textsDiv.classList.add("invisible");
  }

  function onHide(e: TransitionEvent) {
    textsDiv.removeEventListener("transitionend", onHide);
    toastDiv.hidden = true;
    available = true;
  }

  view.toast = show;
}

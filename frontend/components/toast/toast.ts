import "./toast.scss";
import { view, Message } from "../mvc";

const timeout = 1500;

export default function toast() {
  const toastDiv = document.querySelector(".-toast") as HTMLDivElement;
  const textDiv = toastDiv.querySelector(".text") as HTMLDivElement;
  let available = true;

  function show(arg: Message) {
    if (!available) return;
    available = false;
    toastDiv.hidden = false;
    setTimeout(function () {
      textDiv.addEventListener("transitionend", onShow);
      textDiv.textContent = arg.text;
      textDiv.classList.remove("invisible");
    }, 50);
  }

  function onShow(e: TransitionEvent) {
    textDiv.removeEventListener("transitionend", onShow);
    setTimeout(hide, timeout);
  }

  function hide() {
    textDiv.addEventListener("transitionend", onHide);
    textDiv.classList.add("invisible");
  }

  function onHide(e: TransitionEvent) {
    textDiv.removeEventListener("transitionend", onHide);
    toastDiv.hidden = true;
    available = true;
  }

  view.toast = show;
}

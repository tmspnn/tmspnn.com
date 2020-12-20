export default function cloneElementScript(el: HTMLScriptElement) {
  const script = document.createElement("script");

  if (el.src) {
    script.src = el.src;
  } else {
    script.textContent = el.textContent;
  }

  if (el.id) script.id = el.id;
  if (el.type) script.type = el.type;

  return script;
}

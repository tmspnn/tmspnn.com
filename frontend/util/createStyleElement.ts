export default function createStyleElement(s: string) {
  const style = document.createElement("style");
  style.textContent = s;
  return style;
}

export default function isJSON(v) {
  try {
    return typeof JSON.parse(v) == "object";
  } catch (e) {
    return false;
  }
}

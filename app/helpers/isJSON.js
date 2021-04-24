export default function isJSON(v) {
    try {
        return JSON.parse(v) instanceof Object;
    } catch (e) {
        return false;
    }
}

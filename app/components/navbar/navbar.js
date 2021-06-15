import "./navbar.scss";

export default function navbar(namespace, element, data) {
    // Initialization
    const v = new View(namespace, element, data);
    v._name = "navbar";

    const { _refs } = v;

    // UI reactions
    v.setTitle = (title) => {
        _refs.center.textContent = title;
    };

    v.showBackBtn = () => {
        _refs.backBtn.hidden = false;
    };

    v.hideBackBtn = () => {
        _refs.backBtn.hidden = true;
    };

    v.showShareBtn = () => {
        _refs.shareBtn.hidden = false;
    };

    v.hideShareBtn = () => {
        _refs.shareBtn.hidden = true;
    };

    // Event listeners
    _refs.backBtn.on("click", () => v.dispatch("clickBackBtn"));

    _refs.shareBtn.on("click", () => v.dispatch("clickShareBtn"));

    return v;
}

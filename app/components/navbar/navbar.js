import "./navbar.scss";

export default function navbar(namespace, element, data) {
    // Initialization
    const view = new View(namespace, element, data);
    view._name = "navbar";

    const { _element, _data, _refs } = view;

    // UI reactions
    view.setTitle = (title) => {
        _refs.center.textContent = title;
    };

    view.showBackBtn = () => {
        _refs.backBtn.hidden = false;
    };

    view.hideBackBtn = () => {
        _refs.backBtn.hidden = true;
    };

    view.showShareBtn = () => {
        _refs.shareBtn.hidden = false;
    };

    view.hideShareBtn = () => {
        _refs.shareBtn.hidden = true;
    };

    // Event listeners

    return view;
}

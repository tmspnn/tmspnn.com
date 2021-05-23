import { $ } from "k-dom";
import "./tabbar.scss";

export default function tabbar(namespace, element, data) {
    const view = new View(namespace, element, data);
    view._name = "tabbar";

    const { _element, _data, _refs } = view;

    // UI reactions

    // Event listeners

    return view;
}

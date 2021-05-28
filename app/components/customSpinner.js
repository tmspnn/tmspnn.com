import { Spinner } from "spin.js";
import "spin.js/spin.css";

export default function customSpinner(namespace) {
    const view = new View(namespace);
    view._name = "customSpinner";

    const spinner = new Spinner({ color: "rgba(0, 0, 0, 0.4)", lines: 10 });

    view.show = () => {
        spinner.spin(document.body);
    };

    view.hide = () => {
        spinner.stop();
    };

    return view;
}

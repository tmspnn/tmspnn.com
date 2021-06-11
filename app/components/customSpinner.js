import { Spinner } from "spin.js";
import "spin.js/spin.css";

export default function customSpinner(name) {
    const v = new View(name);
    v._name = "customSpinner";

    const spinner = new Spinner({ color: "rgba(0, 0, 0, 0.4)", lines: 10 });

    v.show = () => {
        spinner.spin(document.body);
    };

    v.hide = () => {
        spinner.stop();
    };

    return v;
}

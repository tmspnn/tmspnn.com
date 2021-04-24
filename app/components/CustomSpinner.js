import "spin.js/spin.css";
import { Spinner } from "spin.js";

export default class CustomSpinner extends View {
    _name = "customSpinner";
    spinner = null;

    constructor(namespace) {
        super(namespace);
        this.spinner = new Spinner({ color: "rgba(0, 0, 0, 0.4)", lines: 10 });
    }

    show = () => {
        this.spinner.spin(document.body);
    };

    hide = () => {
        this.spinner.stop();
    };
}

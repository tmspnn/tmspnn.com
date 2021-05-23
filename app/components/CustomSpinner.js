import { Spinner } from "spin.js";
import "spin.js/spin.css";

export default class CustomSpinner extends View {
    spinner = new Spinner({ color: "rgba(0, 0, 0, 0.4)", lines: 10 });

    constructor(namespace) {
        super(namespace);
        this._name = "customSpinner";
    }

    show = () => {
        this.spinner.spin(document.body);
    };

    hide = () => {
        this.spinner.stop();
    };
}

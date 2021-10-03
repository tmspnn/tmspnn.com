import "spin.js/spin.css";
import { Spinner as SpinJS } from "spin.js";
import { View } from "k-util";

export default class Spinner extends View {
    constructor() {
        super();
        this.name = "spinner";
        this.spinner = new SpinJS({
            color: "rgba(0, 0, 0, 0.4)",
            lines: 10
        });
    }

    show() {
        this.spinner.spin(document.body);
    }

    hide() {
        this.spinner.stop();
    }
}

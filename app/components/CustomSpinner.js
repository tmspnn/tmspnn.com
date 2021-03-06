import { Klass, View } from "k-util";
import { Spinner } from "spin.js";
import "spin.js/spin.css";

const CustomSpinner = Klass(
    {
        name: "customSpinner",

        spinner: null,

        constructor() {
            this.Super();
            this.listen();

            this.spinner = new Spinner({
                color: "rgba(0, 0, 0, 0.4)",
                lines: 10
            });
        },

        show() {
            this.spinner.spin(document.body);
        },

        hide() {
            this.spinner.stop();
        }
    },

    View
);

export default CustomSpinner;

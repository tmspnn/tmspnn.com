import "spin.js/spin.css";
import { Spinner } from "spin.js";
// Local modules
import { view } from "./mvc";

const spinner = new Spinner({ color: "rgba(0, 0, 0, 0.4)", lines: 10 });

function show() {
  spinner.spin(document.body);
}

function hide() {
  spinner.stop();
}

function init() {
  view.showSpinner = show;
  view.hideSpinner = hide;
}

export default init;

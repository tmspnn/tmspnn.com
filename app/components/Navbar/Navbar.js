import { at, View } from "k-util";
import { $ } from "k-dom";
import "./Navbar.scss";

export default class Navbar extends View {
    constructor(options) {
        super();
        this.name = "navbar";
        this.element = $(".-navbar");

        const leftBtn = at(options, "leftBtn");

        if (leftBtn) {
            this.refs[options.leftBtn + "Btn"].hidden = false;
        }

        const rightBtn = at(options, "rightBtn");

        if (rightBtn) {
            this.refs[options.rightBtn + "Btn"].hidden = false;
        }
    }

    stepBack() {
        this.dispatch(".stepBack");
    }

    share() {
        this.dispatch(".share");
    }

    close() {
        this.dispatch(".close");
    }

    settings() {
        this.dispatch(".settings");
    }

    publish() {
        this.dispatch(".publish");
    }
}

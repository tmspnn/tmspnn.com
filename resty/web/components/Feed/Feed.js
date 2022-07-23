import { template } from "lodash";
import { DOM } from "k-dom";
import { View } from "k-util";
import T from "./Feed.html";
import "./Feed.scss";

const t = template(T);

export default class Feed extends View {
    /**
     * data: object
     * element: HTMLElement
     */
    constructor(data) {
        super();
        this.data = data;
        this.element = DOM(t(data));
        this.element.destroy = this.destroy.bind(this);
    }
}

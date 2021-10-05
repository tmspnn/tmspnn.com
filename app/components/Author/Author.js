import { template } from "lodash";
import { DOM } from "k-dom";
import { View } from "k-util";
import T from "./Author.html";
import "./Author.scss";

const t = template(T);

export default class Author extends View {
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

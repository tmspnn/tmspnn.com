export default class ResultItem extends View {
    _name = "resultItem";
    _element = null;
    data = null;

    constructor(namespace, element, data) {
        super(namespace);
        this._element = element;
        this.data = data;
    }

    setSelected = (args) => {
        if (this.data.index == args.index) {
            addClass(this._element, "selected");
        } else {
            removeClass(this._element, "selected");
        }
    };

    onClick = (args) => {
        if (args.index == this.data.index) {
            this._element.firstElementChild.click();
        }
    };
}

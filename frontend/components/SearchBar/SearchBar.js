import "./SearchBar.scss";
import ResultItem from "./ResultItem";

export default class SearchBar extends View {
    _name = "searchBar";
    _element = $(".-search-bar");
    input = $("input", this._element);
    searchIcon = $("label", this._element);
    resultList = $("ul", this._element);
    selectedResultIdx = -1;

    constructor(namespace) {
        super(namespace);
        const data = JSON.parse($("#_data").textContent);
        _.forEach(this.resultList.children, (li, i) => {
            const itemData = _.assign(data.recommended_keywords[i], {
                index: i
            });
            new ResultItem(this._namespace, li, itemData);
        });
        this.input.on("keyup", this.onInputKeyup);
        this.searchIcon.on("click", this.onInputKeyup);
    }

    onInputKeyup = (e) => {
        switch (e.key) {
            case "ArrowUp":
                if (this.selectedResultIdx > 0) {
                    --this.selectedResultIdx;
                    this.dispatch("changeSelectedResult", {
                        index: this.selectedResultIdx
                    });
                }
                break;
            case "ArrowDown":
                if (
                    this.selectedResultIdx <
                    this.resultList.children.length - 1
                ) {
                    ++this.selectedResultIdx;
                    this.dispatch("changeSelectedResult", {
                        index: this.selectedResultIdx
                    });
                }
                break;
            case "Enter":
                if (this.selectedResultIdx > -1) {
                    this.ui("resultItem::onClick", {
                        index: this.selectedResultIdx
                    });
                }
                break;
            default:
                const keyword = this.input.value.trim();
                if (keyword.length > 0) {
                    this.dispatch("searchKeyword", { keyword });
                } else {
                    this.dispatch("resetKeyword");
                }
        }
    };

    setResults = (args) => {
        const { data, html } = args;
        clearNode(this.resultList);
        const ul = html2DOM(html);
        _.forEach(ul.children, (li, i) => {
            data[i].index = i;
            new ResultItem(this._namespace, li, data[i]);
        });
        replaceNode(ul, this.resultList);
        this.resultList = ul;
        this.selectedResultIdx = -1;
    };
}

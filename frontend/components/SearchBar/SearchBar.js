import "./SearchBar.scss";
import { $ } from "@util/DOM";
import { View } from "@components/MVC";

export default class SearchBar extends View {
    _name = "searchBar"
    element = null

    constructor(namespace) {
        super(namespace)
        this.element = $(".-search-bar")
    }
}
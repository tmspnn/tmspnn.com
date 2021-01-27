import "./SearchBar.scss"
import ResultItem from "./ResultItem"

export default class SearchBar extends View {
  // Reserved properties
  _name = "searchBar"
  _element = $(".-search-bar")

  // DOM references
  input = $("input", this._element)
  searchIcon = $("label", this._element)
  resultList = $("ul", this._element)

  constructor(namespace) {
    super(namespace)

    // Event listeners
    this.input.on("keyup", this.onInputKeyup)
    this.searchIcon.on("click", this.onInputKeyup)
  }

  onInputKeyup = () => {
    const keyword = this.input.value.trim()
    if (keyword.length > 0) {
      this.dispatch("searchKeyword", { keyword })
    } else {
      this.dispatch("resetKeyword")
    }
  }

  setResults = (args) => {
    const { results, html } = args

    clearNode(this.resultList)

    const ul = html2DOM(html)
    const docFrag = document.createDocumentFragment()

    _.forEach(ul.children, (li, idx) => {
      docFrag.appendChild(new ResultItem(this._namespace, li, results[idx])._element)
    })

    this.resultList.appendChild(docFrag)
  }
}

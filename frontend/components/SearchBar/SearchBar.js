// External packages
import _ from "lodash"

// Local modules
import "./SearchBar.scss"
import { $ } from "@util/DOM"
import { View } from "@components/MVC"

export default class SearchBar extends View {
  // Reserved properties
  _name = "searchBar"
  _element = $(".-search-bar")

  // DOM references
  input = $("input", this._element)
  searchIcon = $("label", this._element)
  resultList = $("ul", this._element)
  mainDiv = $(".main")

  constructor(namespace) {
    super(namespace)

    // Event listeners
    this.input.on("focus", this.onInputFocus)
    this.input.on("blur", this.onInputBlur)
    this.input.on("keyup", this.onInputKeyup)
    this.searchIcon.on("click", this.onInputKeyup)
    this.mainDiv.on("scroll", this.onMainDivScroll)
  }

  onInputFocus = () => {
    this.resultList.hidden = false
  }

  onInputBlur = () => {
    this.resultList.hidden = true
  }

  onInputKeyup = () => {
    const keyword = this.input.value.trim()
    if (keyword.length > 0) {
      this.dispatch("searchKeyword", { keyword })
    } else {
      this.dispatch("resetKeywords")
    }
  }

  onMainDivScroll = () => {
    const { scrollHeight, scrollTop } = this.mainDiv

    if (scrollHeight - scrollTop - window.innerHeight < window.innerHeight) {
      this.dispatch("loadMoreFeeds")
    }
  }

  setKeywords = keywords => {
    console.log(keywords)
  }
}

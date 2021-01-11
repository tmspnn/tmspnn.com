import { View } from "@components/MVC"

export default class ResultItem extends View {
  // Reserved properties
  _name = "resultItem"
  _element = null

  // Custom properties
  data = null

  constructor(namespace, element, data) {
    super(namespace)
    this._element = element
    this.data = data
  }
}

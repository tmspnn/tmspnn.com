import "./Feed.scss"
export default class Feed extends View {
  _name = "feed"
  _element = null

  data = null

  constructor(namespace, element, data) {
    super(namespace)
    this.element = element
    this.data = data
  }
}

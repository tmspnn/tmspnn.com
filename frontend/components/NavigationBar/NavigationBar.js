import "./NavigationBar.scss"

export default class NavigationBar extends View {
  _name = "navigationBar"
  element = null

  constructor(namespace) {
    super(namespace)
    this.element = $(".-navigation-bar")
  }
}

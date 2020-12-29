import "./NavigationBar.scss"
import { View } from "@components/MVC"
import { $ } from "@util/DOM"

export default class NavigationBar extends View {
  _name = "navigationBar"
  element = null

  constructor(namespace) {
    super(namespace)
    this.element = $(".-navigation-bar")
  }
}
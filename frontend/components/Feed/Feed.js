import "./Feed.scss"
import { View } from "@components/MVC"
import { $ } from "@util/DOM"

export default class Feed extends View {
  _name = "feed"
  element = null
  data = null

  constructor(namespace, element, data) {
    super(namespace)
    this.element = element
    this.data = data
  }
}
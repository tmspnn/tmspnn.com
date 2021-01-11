import "./Feed.scss"
import { View } from "@components/MVC"
import { html2DOM } from "@util/DOM"
import { user, clock, eye, badge_check } from "@components/icons"
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

import "./ProgressBar.scss";
import { View } from "@components/MVC";
import { $ } from "@util/DOM"

export default class ProgressBar extends View {
  _name = "progressBar"
  _element = null

  constructor(namespace) {
    super(namespace)
    this._element = $(".-progress-bar")
  }

  setProgress = (completionRate) => {
    const transform = `translate3d(0, -${100 * (1 - completionRate)}%, 0)`
    this._element.style.transform = transform
    this._element.style.webkitTransform = transform
  }
}
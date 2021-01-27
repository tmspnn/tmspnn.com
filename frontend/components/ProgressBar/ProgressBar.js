import "./ProgressBar.scss"

export default class ProgressBar extends View {
  _name = "progressBar"
  _element = $(".-progress-bar")

  constructor(namespace) {
    super(namespace)
  }

  setProgress = (args) => {
    const { completionRate } = args

    const transform =
      completionRate > 0 && completionRate < 1
        ? `translate3d(0, -${100 * (1 - completionRate)}%, 0)`
        : "translate3d(-100%, 0, 0)"

    this._element.style.transform = transform
    this._element.style.webkitTransform = transform
  }
}

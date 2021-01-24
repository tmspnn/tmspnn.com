import "./DialogUserMeta.scss"

export default class DialogUserMeta extends View {
  _name = "dialogUserMeta"
  _element = $(".-dialog.user-meta")

  // @DOM references
  xBtn = $(".x-btn")

  constructor(namespace) {
    super(namespace)

    this.xBtn.on("click", this.hide)

    window.on("keyup", (e) => {
      if (e.key == "Escape") {
        this.hide()
      }
    })
  }

  show = () => {
    addClass(this._element, "visible")
  }

  hide = () => {
    removeClass(this._element, "visible")
  }
}

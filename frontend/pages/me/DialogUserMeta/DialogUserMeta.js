import "./DialogUserMeta.scss"

export default class DialogUserMeta extends View {
  _name = "dialogUserMeta"
  _element = $(".-dialog.user-meta")

  // @DOM references
  xBtn = $(".x-btn")
  bgPreviewDiv = $(".bg-preview")
  bgInput = $("#bg-image-input")

  constructor(namespace) {
    super(namespace)

    this.xBtn.on("click", this.hide)
    this.bgPreviewDiv.on("click", () => this.bgInput.click())
    this.bgInput.on("change", () => {
      if (this.bgInput.files.length > 0) {
      }
    })

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

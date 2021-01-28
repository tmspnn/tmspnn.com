import PageContainer from "@components/PageContainer/PageContainer"
import CustomSpinner from "@components/CustomSpinner"
import Toast from "@components/Toast/Toast"
import ProgressBar from "@components/ProgressBar/ProgressBar"
import customizeTrix from "./customizeTrix"

export default class EditorView extends View {
  _name = "editor"

  // @DOM references
  titleInput = $("#title")
  keywordInputs = $$(".keyword")
  trixEditorEl = $("trix-editor")
  saveBtn = $("button.save")
  previewBtn = $("button.preview")
  publicCheckbox = $("#is-public")
  pageContainer = new PageContainer("editor")
  customSpinner = new CustomSpinner("editor")
  toast = new Toast("editor")
  progressBar = new ProgressBar("editor")

  constructor() {
    super("editor")

    // Alter trix editor
    customizeTrix()

    // Event listeners
    this.saveBtn.on("click", () => {
      this.dispatch("clickSaveBtn", {
        title: this.titleInput.value.trim(),
        isPublic: hasClass(this.publicCheckbox, "active"),
        keywords: this.keywordInputs.map((el) => el.value.trim()).filter((v) => v.length > 0),
        htmlContent: this.trixEditorEl.value.trim(),
        textContent: this.trixEditorEl.editor.getDocument().toString()
      })
    })

    this.previewBtn.on("click", () => {
      this.dispatch("clickPreviewBtn")
    })

    this.publicCheckbox.on("click", () => {
      toggleClass(this.publicCheckbox, "active")
      this.saveBtn.click()
    })

    window.on("trix-attachment-add", (e) => this.dispatch("onAttachmentAdd", e))

    window.on(
      "keydown",
      (e) => {
        const withCtrlOrCmdKeyDown = e.ctrlKey || e.metaKey

        // ctrl/cmd + s to save the article
        if (withCtrlOrCmdKeyDown && e.key == "s") {
          e.preventDefault()
          e.stopPropagation()
          this.saveBtn.click()
        }
      },
      { passive: false }
    )
  }
}

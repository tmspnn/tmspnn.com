import { View } from "@components/MVC"
import { $, $$, hasClass, toggleClass } from "@util/DOM"
import PageContainer from "@components/PageContainer/PageContainer"
import CustomSpinner from "@components/CustomSpinner"
import Toast from "@components/Toast/Toast"
import ProgressBar from "@components/ProgressBar/ProgressBar"

class EditorView extends View {
  _name = "editor"
  titleInput = null
  keywordInputs = []
  trixEditorEl = null
  saveBtn = null
  previewBtn = null
  publicCheckbox = null
  pageContainer = null
  customSpinner = null
  toast = null
  progressBar = null

  constructor() {
    super("editor")
    this.titleInput = $("#title")
    this.keywordInputs = $$(".keyword")
    this.trixEditorEl = $("trix-editor")
    this.saveBtn = $("button.save")
    this.previewBtn = $("button.preview")
    this.publicCheckbox = $("#is-public")
    this.pageContainer = new PageContainer("editor")
    this.customSpinner = new CustomSpinner("editor")
    this.toast = new Toast("editor")
    this.progressBar = new ProgressBar("editor")

    this.saveBtn.on("click", () => {
      this.dispatch("clickSaveBtn", {
        title: this.titleInput.value.trim(),
        isPublic: hasClass(this.publicCheckbox, "active"),
        keywords: this.keywordInputs.map(el => el.value.trim()).filter(v => v.length > 0),
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

    window.on("trix-attachment-add", e => this.dispatch("onAttachmentAdd", e))

    window.on("keydown", e => {
      const withCtrlOrCmdKeyDown = e.ctrlKey || e.metaKey

      // ctrl/cmd + s to save the article
      if (withCtrlOrCmdKeyDown && e.key == "s") {
        this.saveBtn.click()
      }
    })
  }
}

export default new EditorView()
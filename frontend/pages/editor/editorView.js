import PageContainer from "@components/PageContainer/PageContainer";
import CustomSpinner from "@components/CustomSpinner";
import Toast from "@components/Toast/Toast";
import ProgressBar from "@components/ProgressBar/ProgressBar";
import customizeTrix from "./customizeTrix";

export default class EditorView extends View {
  _name = "editor";

  // @DOM references
  titleInput = $("#title");
  keywordInputs = $$(".keyword");
  trixEditorEl = $("trix-editor");
  saveBtn = $("button.save");
  previewBtn = $("button.preview");
  publicCheckbox = $("#is-public");
  pageContainer = new PageContainer("editor");
  customSpinner = new CustomSpinner("editor");
  toast = new Toast("editor");
  progressBar = new ProgressBar("editor");

  constructor() {
    super("editor");

    // Alter trix editor
    customizeTrix();

    // Event listeners
    this.saveBtn.on("click", () => {
      const coverImg = $("img", this.trixEdtorEl);
      this.dispatch("clickSaveBtn", {
        title: this.titleInput.value.trim(),
        cover: coverImg && coverImg.src,
        isPublic: hasClass(this.publicCheckbox, "active"),
        keywords: this.keywordInputs
          .map((el) => el.value.trim())
          .filter((v) => v.length > 0),
        html: this.trixEditorEl.value.trim(),
      });
    });

    this.previewBtn.on("click", () => {
      this.dispatch("clickPreviewBtn");
    });

    this.publicCheckbox.on("click", () => {
      toggleClass(this.publicCheckbox, "active");
      this.saveBtn.click();
    });

    document.body.on("trix-attachment-add", (e) =>
      this.dispatch("onAttachmentAdd", e)
    );

    document.body.on(
      "keydown",
      (e) => {
        const withCtrlOrCmdKeyDown = e.ctrlKey || e.metaKey;

        // ctrl/cmd + s to save the article
        if (withCtrlOrCmdKeyDown && e.key == "s") {
          e.preventDefault();
          e.stopPropagation();
          return this.saveBtn.click();
        }

        const coverImg = $("img", this.trixEditorEl);
        this.dispatch("saveLocally", {
          title: this.titleInput.value.trim(),
          cover: coverImg && coverImg.src,
          isPublic: hasClass(this.publicCheckbox, "active"),
          keywords: this.keywordInputs
            .map((el) => el.value.trim())
            .filter((v) => v.length > 0),
          html: this.trixEditorEl.value.trim(),
        });
      },
      { passive: false }
    );
  }
}

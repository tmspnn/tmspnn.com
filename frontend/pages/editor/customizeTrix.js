import { $ } from "@util/DOM"

export default function customizeTrix() {
  const boldBtn = $(".trix-button--icon-bold")
  boldBtn.title = "粗体"
  boldBtn.textContent = "粗"

  const italicBtn = $(".trix-button--icon-italic")
  italicBtn.title = "斜体"
  italicBtn.textContent = "斜"

  const strikeBtn = $(".trix-button--icon-strike")
  strikeBtn.title = "划线"
  strikeBtn.textContent = "划"

  const linkBtn = $(".trix-button--icon-link")
  linkBtn.title = "链接"

  const linkDialog = $(".trix-dialog--link")
  const urlInput = $('[name="href"]', linkDialog)
  urlInput.placeholder = "请输入链接地址"
  const linkInput = $('input[value="Link"]', linkDialog)
  linkInput.value = "链接"
  const unlinkInput = $('input[value="Unlink"]', linkDialog)
  unlinkInput.value = "取消链接"

  const headingbtn = $(".trix-button--icon-heading-1")
  headingbtn.title = "标题"

  const quoteBtn = $(".trix-button--icon-quote")
  quoteBtn.title = "引用"

  const codeBtn = $(".trix-button--icon-code")
  codeBtn.title = "代码"

  const listBtn = $(".trix-button--icon-bullet-list")
  listBtn.title = "列表"

  const orderedListBtn = $(".trix-button--icon-number-list")
  orderedListBtn.title = "标号列表"

  const decreaseNestingBtn = $(".trix-button--icon-decrease-nesting-level")
  decreaseNestingBtn.title = "减少缩进级别"

  const increaseNestingBtn = $(".trix-button--icon-increase-nesting-level")
  increaseNestingBtn.title = "增加缩进级别"

  const attachmentBtn = $(".trix-button--icon-attach")
  attachmentBtn.title = "附件: 图片/视频/PDF..."

  const undoBtn = $(".trix-button--icon-undo")
  undoBtn.title = "上一步"

  const redoBtn = $(".trix-button--icon-redo")
  redoBtn.title = "下一步"
}

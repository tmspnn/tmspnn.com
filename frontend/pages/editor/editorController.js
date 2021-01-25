// @External
import { Base64 } from "js-base64"

// @Local
import editorModel from "./editorModel"

class EditorController extends Controller {
  blocked = false

  constructor() {
    super("editor")
  }

  clickSaveBtn = (args) => {
    if (this.blocked) return

    if (args.title.length < 1) {
      return this.showToast("请输入标题")
    }

    if (args.textContent.length < 100) {
      return this.showToast("请输入100字以上的内容")
    }

    this.mutate("setArticleProps", args)

    this.blocked = true

    if (editorModel.article.id > 0) {
      this.updateArticle()
    } else {
      this.createArticle()
    }
  }

  updateArticle = () => {
    xhr({
      url: "/api/articles/" + editorModel.article.id,
      method: "put",
      data: editorModel.article,
      success: (res) => {
        alert("success: ", res)
      },
      fail: (e) => {
        const err = isJSON(e.message) ? JSON.parse(e.message).err : e.message
        this.showToast(err)
      },
      final: () => {
        this.blocked = false
      }
    })
  }

  createArticle = () => {
    postJSON({
      url: "/api/articles",
      data: editorModel.article,
      cb: () => {},
      fail: (e) => {
        const err = isJSON(e.message) ? JSON.parse(e.message).err : e.message
        this.showToast(err)
      },
      final: () => {
        this.blocked = false
      }
    })
  }

  clickPreviewBtn = () => {}

  onAttachmentAdd = (e) => {
    const { attachment } = e
    const { file } = attachment

    if (file) {
      this.blocked = true
      this.ui("customSpinner::show")

      const { policy, signature } = editorModel
      const uid = editorModel.user.id
      const dateStr = new Date().toISOString().slice(0, 10).split("-").join("/")
      const fileNameBase64 = Base64.encode(file.name)
      const key = `public/users/${uid}/${dateStr}/${fileNameBase64}`

      uploadToOSS({
        file,
        key,
        policy,
        signature,
        onProgress: (progressEvent) => {
          const { loaded, total } = progressEvent
          const progress = (100 * loaded) / total
          attachment.setUploadProgress(progress)
        },
        cb: () => {
          const url = "https://oss.tmspnn.com/" + key
          attachment.setAttributes({ url, href: url })
        },
        fail: (e) => {
          const err = isJSON(e.message) ? JSON.parse(e.message).err : e.message
          this.showToast(err)
        },
        final: () => {
          this.blocked = false
          this.ui("customSpinner::hide")
        }
      })
    }
  }

  showToast = (texts) => {
    this.ui("toast::show", { texts })
  }
}

export default new EditorController()

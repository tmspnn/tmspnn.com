// External modules
import _ from "lodash"

// Local modules
import { Model } from "@components/MVC"
import { $ } from "@util/DOM"

class EditorModel extends Model {
  user = { id: 0 }

  article = {
    id: 0,
    isPublic: false,
    title: "",
    keywords: [],
    summary: "",
    content: ""
  }

  policy = ""
  signature = ""

  constructor() {
    super("editor")

    const initData = JSON.parse($("#_data").textContent)

    this.user.id = initData.user.id

    this.policy = initData.oss_policy
    this.signature = initData.oss_signature

    const { article } = initData

    if (!_.isEmpty(article)) {
      this.setArticleProps({
        id: article.id,
        isPublic: article.status == "public",
        title: article.title,
        keywords: article.keywords,
        summary: article.summary,
        content: article.content
      })
    }
  }

  setUserProps = (args) => {
    _.assign(this.user, args)
  }

  setArticleProps = (args) => {
    _.assign(this.article, args)
  }
}

export default new EditorModel()
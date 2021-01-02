import { postJSON } from "@util/xhr"
import { Controller } from "@components/MVC"
import articleModel from "./articleModel"
import isJSON from "@util/isJSON"

class ArticleController extends Controller {
  blocked = false

  constructor() {
    super("article")
  }

  clickRatingBtn = args => {
    if (this.blocked) return
    if (!articleModel.user.id) {
      return this.redirectToSignIn()
    }
    const { starsCount } = args
    if (starsCount < 1 || starsCount > 5) {
      return this.showToast("请给出1-5星的评价.")
    }
    this.blocked = true
    this.ui("customSpinner::show")
    postJSON({
      url: "/api/ratings",
      data: {
        articleId: articleModel.article.id,
        starsCount
      },
      cb: () => {
        this.mutate("setRated", { rated: true })
        this.showToast("评价成功")
        this.ui("hideRatingBtn")
      },
      fail: () => {
        this.showToast("评价失败, 请稍后再试")
      },
      final: () => {
        this.blocked = false
        this.ui("customSpinner::hide")
      }
    })
  }

  clickCommentBtn = args => {
    if (this.blocked) return
    if (!articleModel.user.id) {
      return this.redirectToSignIn()
    }
    const { comment } = args
    if (comment.trim().length < 5) {
      return this.showToast("请输入5个字以上的评论.")
    }
    this.blocked = true
    this.ui("customSpinner::show")
    postJSON({
      url: "/api/comments",
      data: {
        articleId: articleModel.article.id,
        comment
      },
      cb: res => {
        this.mutate("addComment", res)
        this.showToast("评论成功")
        this.ui("onNewComment", res)
      },
      fail: () => {
        this.showToast("评论失败, 请稍后再试")
      },
      final: () => {
        this.blocked = false
        this.ui("customSpinner::hide")
      }
    })
  }

  redirectToSignIn = () => {
    this.dispatch("pageContainer::toPage", {
      url: "/sign-in?from=" + encodeURIComponent("/articles/" + articleModel.article.id)
    })
  }

  showToast = texts => {
    this.ui("toast::show", { texts })
  }
}

export default new ArticleController()

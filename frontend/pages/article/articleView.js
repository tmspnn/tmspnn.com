import PageContainer from "@components/PageContainer/PageContainer"
import CustomSpinner from "@components/CustomSpinner"
import Toast from "@components/Toast/Toast"

class ArticleView extends View {
  _name = "article"
  starsCount = 0
  ratingDesc = ["", "很差", "差", "一般", "好", "很好"]

  // DOM references
  starIcons = $$(".stars > svg")
  ratingDescSpan = $(".stars > span")
  ratingBtn = $(".rating-btn")
  commentInput = $(".comment > textarea")
  commentBtn = $(".comment-btn")

  // Child components
  pageContainer = new PageContainer("article")
  customSpinner = new CustomSpinner("article")
  toast = new Toast("article")

  constructor() {
    super("article")

    this.starIcons.forEach((el, idx) => {
      el.on("click", () => {
        this.setStarsCount(this.starsCount == idx + 1 ? 0 : idx + 1)
      })
    })

    this.ratingBtn.on("click", () => {
      this.dispatch("clickRatingBtn", { starsCount: this.starsCount })
    })

    this.commentInput.on("focus", () => this.dispatch("focusCommentInput"))

    this.commentBtn.on("click", () => {
      this.dispatch("clickCommentBtn", { comment: this.commentInput.value.trim() })
    })
  }

  setStarsCount = (starsCount) => {
    this.starsCount = starsCount
    this.starIcons.forEach((el, idx) => {
      idx <= starsCount - 1 ? addClass(el, "active") : removeClass(el, "active")
    })
    this.ratingDescSpan.textContent = this.ratingDesc[starsCount]
  }

  hideRatingBtn = () => {
    this.ratingBtn.hidden = true
  }
}

export default new ArticleView()

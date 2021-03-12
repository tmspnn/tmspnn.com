// External modules
// import hljs from "highlight.js/lib/core"

// Local modules
import Comment from "@components/Comment/Comment";
import PageContainer from "@components/PageContainer/PageContainer";
import CustomSpinner from "@components/CustomSpinner";
import Toast from "@components/Toast/Toast"

const initData = JSON.parse($("#_data").textContent)

export default class ArticleView extends View {
  _name = "article";
  starsCount = 0;
  ratingDesc = ["", "很差", "差", "一般", "好", "很好"];
    referenceComment = null

  // DOM references
  starIcons = $$(".stars > svg");
  ratingDescSpan = $(".stars > span");
  ratingBtn = $(".rating-btn");
  commentInput = $(".comment > textarea");
  commentBtn = $(".comment-btn");
    commentsDiv = $(".comments")

  // Child components
  pageContainer = new PageContainer("article");
  customSpinner = new CustomSpinner("article");
  toast = new Toast("article");
  comments = _.map($$(".-comment"), (div, i) => new Comment("article", div, initData.comments[i]));

  constructor() {
    super("article");

      if (!initData.my_rating) {
        this.starIcons.forEach((el, idx) => {
            el.on("click", () => {
                this.setStarsCount({
                    starsCount: this.starsCount == idx + 1 ? 0 : idx + 1,
                });
            });
        });

        this.ratingBtn.on("click", () => {
          if (this.starsCount > 0 && this.starsCount <= 5) {
            this.dispatch("clickRatingBtn", { starsCount: this.starsCount });
          }
        });
      }
    
    this.commentBtn.on("click", () => {
      this.dispatch("clickCommentBtn", {
        comment: this.commentInput.value.trim(),
          referenceId: this.referenceComment? this.referenceComment.id:null
      });
    });

      this.commentInput.on("keyup", () => {
        if (!this.commentInput.value.trim()) {
            this.commentInput.placeholder = "请输入评论..."
            this.referenceComment = null
        }
      })

    // $$("pre").forEach((block) => hljs.highlightBlock(block))
  }

  setStarsCount = (args) => {
    const { starsCount } = args;
    this.starsCount = starsCount;
    this.starIcons.forEach((el, idx) => {
      idx <= starsCount - 1
        ? addClass(el, "active")
        : removeClass(el, "active");
    });
    starsCount > 0 ? this.showRatingBtn() : this.hideRatingBtn();
    this.ratingDescSpan.textContent = this.ratingDesc[starsCount];
  };

  showRatingBtn = () => {
    this.ratingBtn.style.visibility = "visible";
  };

  hideRatingBtn = () => {
    this.ratingBtn.style.visibility = "hidden";
  };

    referToComment = (c) => {
        this.commentInput.placeholder = `回复 ${c.author}: `
        this.referenceComment = c
        this.commentInput.focus()
    }

    onNewComment = (c) => {
        this.referenceComment = null
        this.commentInput.placeholder = "请输入评论..."
        this.commentsDiv.insertBefore(new Comment("article", html2DOM(c.html), c)._element, this.commentsDiv.firstElementChild)
    }

    clearCommentInput = () => {
        this.commentInput.value = ""
    }
}

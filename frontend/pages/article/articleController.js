import Comment from "@components/Comment/Comment"

export default class ArticleController extends Controller {
  data = JSON.parse($("#_data").textContent);
  blocked = false;

  constructor() {
    super("article");

      if (!this.data.comments.length) {
        this.data.comments = []
      }

    if (this.data.my_rating) {
      this.ui("article::setStarsCount", { starsCount: this.data.my_rating });
      this.ui("article::hideRatingBtn");
    }
  }

  clickRatingBtn = (args) => {
    if (this.blocked) return;

    if (!this.data.user.id) {
      return this.redirectToSignIn();
    }

    const { starsCount } = args;

    if (starsCount < 1 || starsCount > 5) {
      return this.toast("请给出1-5星的评价.");
    }

    this.blocked = true;
    this.ui("customSpinner::show");

    postJSON({
      url: `/api/articles/${this.data.article.id}/ratings`,
      data: { starsCount },
      cb: () => {
        this.data.rated = true;
        this.toast("评价成功");
        this.ui("article::hideRatingBtn");
      },
      fail: () => {
        this.toast("评价失败, 请稍后再试");
      },
      final: () => {
        this.blocked = false;
        this.ui("customSpinner::hide");
      }
    });
  };

  clickCommentBtn = (args) => {
    if (this.blocked) return;

    if (!this.data.user.id) {
      return this.redirectToSignIn();
    }

    const { comment, reference_id } = args;

    if (comment.trim().length < 5) {
      return this.showToast("请输入5个字以上的评论.");
    }

    this.blocked = true;
    this.ui("customSpinner::show");

    postJSON({
      url: `/api/articles/${this.data.article.id}/comments`,
      data: args,
      cb: (res) => {
          const comment = JSON.parse(res)
        this.data.comments.push(comment)
        this.toast("评论成功");
        this.ui("article::onNewComment", comment);
          this.ui("article::clearCommentInput")
      },
      fail: () => {
        this.toast("评论失败, 请稍后再试");
      },
      final: () => {
        this.blocked = false;
        this.ui("customSpinner::hide");
      }
    });
  };

    changeAttitudeToComment = (comment) => {
        if (this.blocked) return;

        if (!this.data.user.id) {
            return this.redirectToSignIn()
        }

        this.blocked = true;
        this.ui("customSpinner::show")

        xhr({
            url: `/api/comments/${comment.id}/attitudes`,
            method: "put",
            contentType: "application/json",
            data: JSON.stringify({
                attitude: comment.advocated ? "rev_advocate" : "advocate"
            }),
            success: () => {
                const c = _.find(this.data.comments, c => c.id == comment.id)
                c.advocators_count = comment.advocated ? c.advocators_count - 1 : c.advocators_count + 1
                c.advocated = !c.advocated
                this.ui("comment::onAttitudeChange", c.advocated, c.advocators_count)
            },
            fail: () => {
                this.toast("点赞/取消失败, 请稍后再试.")
            },
            final: () => {
                this.blocked = false
                this.ui("customSpinner::hide")
            }
        })  
    }

  redirectToSignIn = () => {
    this.ui("pageContainer::toPage", {
      url: "/sign-in?from=" + encodeURIComponent("/articles/" + this.data.article.id)
    });
  };

  toast = (texts) => {
    this.ui("toast::show", { texts });
  };
}

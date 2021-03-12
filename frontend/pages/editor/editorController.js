import { Base64 } from "js-base64";

export default class EditorController extends Controller {
  blocked = false;
  data = JSON.parse($("#_data").textContent);

  constructor() {
    super("editor");
    // Load local copy
  }

  clickSaveBtn = (args) => {
    if (this.blocked) return;

    if (args.title.length < 1) {
      return this.toast("请输入标题");
    }

    _.assign(this.data.article, args);

    this.blocked = true;

    if (this.data.article.id > 0) {
      this.updateArticle();
    } else {
      this.createArticle();
    }
  };

  updateArticle = () => {
    xhr({
      url: "/api/articles/" + this.data.article.id,
      method: "put",
      data: this.data.article,
      success: () => {
        this.toast("更新成功!");
      },
      fail: (e) => {
        const err = isJSON(e.message) ? JSON.parse(e.message).err : e.message;
        this.toast(err);
      },
      final: () => {
        this.blocked = false;
      },
    });
  };

  createArticle = () => {
    postJSON({
      url: "/api/articles",
      data: this.data.article,
      cb: (res) => {
        this.data.article.id = res.id;
        this.toast("更新成功");
      },
      fail: (e) => {
        const err = isJSON(e.message) ? JSON.parse(e.message).err : e.message;
        this.toast(err);
      },
      final: () => {
        this.blocked = false;
      },
    });
  };

  clickPreviewBtn = () => {};

  onAttachmentAdd = (e) => {
    const { attachment } = e;
    const { file } = attachment;

    if (file) {
      this.blocked = true;
      this.ui("customSpinner::show");

      const { oss_policy, oss_signature } = this.data;
      const uid = this.data.user.id;
      const dateStr = new Date()
        .toISOString()
        .slice(0, 10)
        .split("-")
        .join("/");
      const fileNameBase64 = Base64.encode(file.name);
      const key = `public/users/${uid}/${dateStr}/${fileNameBase64}`;

      uploadToOSS({
        file,
        key,
        policy: oss_policy,
        signature: oss_signature,
        onProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const progress = (100 * loaded) / total;
          attachment.setUploadProgress(progress);
          this.ui("progressBar::setProgress", {
            completionRate: progress / 100,
          });
        },
        cb: () => {
          const url = "https://oss.tmspnn.com/" + key;
          attachment.setAttributes({ url, href: "#" });
        },
        fail: (e) => {
          this.toast(isJSON(e.message) ? JSON.parse(e.message).err : e.message);
        },
        final: () => {
          this.blocked = false;
          this.ui("customSpinner::hide");
        },
      });
    }
  };

  saveLocally = (args) => {
    (args.id = this.data.article.id),
      (args.updatedAt = Math.round(Date.now() / 1000)); // unix timestamp
    localStorage.setItem(`article(${args.id})`, JSON.stringify(args));
  };

  toast = (texts) => {
    this.ui("toast::show", { texts });
  };
}

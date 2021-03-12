import "./DialogUserMeta.scss";

export default class DialogUserMeta extends View {
  _name = "dialogUserMeta";
  _element = $(".-dialog.user-meta");
  bgUrl = null;
  profileUrl = null;

  // @DOM references
  xBtn = $(".x-btn", this._element);
  bgPreviewDiv = $(".bg-preview", this._element);
  bgInput = $("#bg-image-input");
  profilePreviewDiv = $(".profile-preview", this._element);
  profileInput = $("#profile-input");
  nicknameInput = $("#nickname-input");
  descTextArea = $("#desc-input");
  districtInput = $("#district-input");
  submitBtn = $(".footer > button", this._element);

  constructor(namespace) {
    super(namespace);

    this.xBtn.on("click", this.hide);
    this.bgPreviewDiv.on("click", () => this.bgInput.click());
    this.bgInput.on("change", () => {
      if (this.bgInput.files.length > 0) {
        this.dispatch("changeBgImage", { file: this.bgInput.files[0] });
      }
    });
    this.profilePreviewDiv.on("click", () => this.profileInput.click());
    this.profileInput.on("change", () => {
      if (this.profileInput.files.length > 0) {
        this.dispatch("changeProfile", { file: this.profileInput.files[0] });
      }
    });

    this.submitBtn.on("click", () =>
      this.dispatch("submitUserMeta", {
        bgImage: this.bgUrl,
        profile: this.profileUrl,
        nickname: this.nicknameInput.value.trim(),
        desc: this.descTextArea.value.trim(),
        district: this.districtInput.value.trim(),
      })
    );

    document.body.on("keyup", (e) => {
      if (e.key == "Escape") {
        this.hide();
      }
    });
  }

  setBgImage = (args) => {
    this.bgUrl = args.url;
    this.bgPreviewDiv.style.backgroundImage = `url(${args.url})`;
  };

  setProfile = (args) => {
    this.profileUrl = args.url;
    this.profilePreviewDiv.style.backgroundImage = `url(${args.url})`;
  };

  show = () => {
    addClass(this._element, "visible");
  };

  hide = () => {
    removeClass(this._element, "visible");
  };
}

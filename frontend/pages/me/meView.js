import PageContainer from "@components/PageContainer/PageContainer";
import ProgressBar from "@components/ProgressBar/ProgressBar";
import DialogUserMeta from "./DialogUserMeta/DialogUserMeta";

export default class MeView extends View {
  _name = "me";

  // #DOM references
  editBtn = $(".edit-btn");
  districtLabel = $("li.district > label");
  nicknameSpan = $("li.nickname > span");
  descLi = $("li.desc");
  districtSpan = $("li.district > span");
  articlesCountSpan = $("li.articles-count > span");
  followingsCountSpan = $("li.followings-count > span");
  followersCountSpan = $("li.followers-count > span");
  mainDiv = $(".main");
  bgContainer = $(".bg-container");
  bgImg = $("img", this.bgContainer);
  profileDiv = $(".profile-container > .profile");

  // #Child components
  pageContainer = new PageContainer("me");
  progressBar = new ProgressBar("me");
  dialogUserMeta = new DialogUserMeta("me");

  constructor() {
    super("me");

    this.editBtn.on("click", () => {
      this.dispatch("clickEditBtn");
    });

    this.districtLabel.on("click", () => this.editBtn.click());
    this.profileDiv.on("click", () => this.editBtn.click());
    this.bgContainer.on("click", () => this.editBtn.click());
    this.mainDiv.on("scroll", () => {
      const { scrollTop } = this.mainDiv;
      if (this.bgImg) {
        const transform = `translate3d(0, ${scrollTop / 2}px, 0)`;
        this.bgImg.style.transform = transform;
        this.bgImg.style.webkitTransform = transform;
        this.bgImg.style.msTransform = transform;
        this.bgImg.style.mozTransform = transform;
      }
    });
  }

  setUserMeta = (args) => {
    const { bgImage, profile, nickname, desc, district } = args;
    this.nicknameSpan.textContent = nickname;
    this.descLi.textContent = desc;
    this.districtSpan.textContent = district;
    this.bgImg.src = bgImage;
    this.bgImg.hidden = false;
    this.profileDiv.style.backgroundImage = `url(${profile})`;
    clearNode(this.profileDiv);
  };
}

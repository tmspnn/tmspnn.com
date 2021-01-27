import PageContainer from "@components/PageContainer/PageContainer"
import ProgressBar from "@components/ProgressBar/ProgressBar"
import DialogUserMeta from "./DialogUserMeta/DialogUserMeta"

export default class MeView extends View {
  _name = "me"

  // @DOM references
  editBtn = $(".edit-btn")
  nicknameSpan = $("li.nickname > span")
  descLi = $("li.desc")
  districtSpan = $("li.district > span")
  articlesCountSpan = $("li.articles-count > span")
  followingsCountSpan = $("li.followings-count > span")
  followersCountSpan = $("li.followers-count > span")
  bgImg = $(".bg-container > img")
  profileDiv = $(".profile-container > .profile")

  // @Child components
  pageContainer = new PageContainer("me")
  progressBar = new ProgressBar("me")
  dialogUserMeta = new DialogUserMeta("me")

  constructor() {
    super("me")

    this.editBtn.on("click", () => {
      this.dispatch("clickEditBtn")
    })
  }

  setUserMeta = (args) => {
    const { bgImage, profile, nickname, desc, district } = args
    this.nicknameSpan.textContent = nickname
    this.descLi.textContent = desc
    this.districtSpan.textContent = district
    this.bgImg.src = bgImage
    this.bgImg.hidden = false
    this.profileDiv.style.backgroundImage = `url(${profile})`
  }
}

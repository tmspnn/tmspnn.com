import PageContainer from "@components/PageContainer/PageContainer"
import DialogUserMeta from "./DialogUserMeta/DialogUserMeta"

export default class MeView extends View {
  _name = "me"

  // @DOM references
  editBtn = $(".edit-btn")

  // @Child components
  pageContainer = new PageContainer("me")
  dialogUserMeta = new DialogUserMeta("me")

  constructor() {
    super("me")

    this.editBtn.on("click", () => {
      this.dispatch("clickEditBtn")
    })
  }
}

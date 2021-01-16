import { $ } from "@util/DOM"
import { View } from "@components/MVC"
import PageContainer from "@components/PageContainer/PageContainer"

class MeView extends View {
  _name = "me"

  pageContainer = new PageContainer("me")
}

export default new MeView()

// Local modules
import { $ } from "@util/DOM"
import { View } from "@components/MVC"
import NavigationBar from "@components/NavigationBar/NavigationBar"
import SearchBar from "@components/SearchBar/SearchBar"
import Feed from "@components/Feed/Feed"
import PageContainer from "@components/PageContainer/PageContainer"
import CustomSpinner from "@components/CustomSpinner"
import ProgressBar from "@components/ProgressBar/ProgressBar"

class IndexView extends View {
  _name = "index"

  navigationBar = new NavigationBar("index")
  mainDiv = $(".main")
  searchBar = new SearchBar("index")
  feedsDiv = $(".feeds")
  pageContainer = new PageContainer("index")
  customSpinner = new CustomSpinner("index")
  progressBar = new ProgressBar("index")

  constructor() {
    super("index")
    this.mainDiv.on("scroll", this.onMainDivScroll)
  }

  onMainDivScroll = _.throttle(() => {
    const { scrollHeight, scrollTop } = this.mainDiv

    if (scrollHeight - scrollTop - window.innerHeight < window.innerHeight) {
      this.dispatch("loadMoreFeeds")
    }
  }, 3000)

  addFeeds = (args) => {
    const { feeds, html } = args

    const tmpDiv = document.createElement("div")
    tmpDiv.innerHTML = html

    feeds.forEach((a, i) => {
      this.mainDiv.appendChild(new Feed("index", tmpDiv.children[i], a)._element)
    })
  }
}

export default new IndexView()

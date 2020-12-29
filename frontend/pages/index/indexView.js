import { View } from "@components/MVC"
import { $$ } from "@util/DOM"
import NavigationBar from "@components/NavigationBar/NavigationBar"
import SearchBar from "@components/SearchBar/SearchBar"
import Feed from "@components/Feed/Feed"
import PageContainer from "@components/PageContainer/PageContainer"
import CustomSpinner from "@components/CustomSpinner"
import ProgressBar from "@components/ProgressBar/ProgressBar"

class IndexView extends View {
  _name = "index"

  navigationBar = null
  searchBar = null
  feeds = []
  pageContainer = null
  customSpinner = null
  progressBar = null

  constructor() {
    super("index")
    this.navigationBar = new NavigationBar("index")
    this.searchBar = new SearchBar("index")
    this.feeds = $$(".-feed").map((el, idx) => new Feed("index", el, { index: idx }))
    this.pageContainer = new PageContainer("index")
    this.customSpinner = new CustomSpinner("index")
    this.progressBar = new ProgressBar("index")
  }

  // Todo: load more feeds when scrolling down to the bottom of the page
}

export default new IndexView()
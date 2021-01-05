import { $$ } from "@util/DOM"
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
  searchBar = new SearchBar("index")
  feeds = $$(".-feed").map((el, idx) => new Feed("index", el, { index: idx }))
  pageContainer = new PageContainer("index")
  customSpinner = new CustomSpinner("index")
  progressBar = new ProgressBar("index")

  constructor() {
    super("index")
  }
}

export default new IndexView()

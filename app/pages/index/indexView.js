import PageContainer from "@components/PageContainer/PageContainer";
import SearchBar from "@components/SearchBar/SearchBar";
import CustomSpinner from "@components/CustomSpinner";
import ProgressBar from "@components/ProgressBar/ProgressBar";

export default class IndexView extends View {
    _name = "index";
    mainDiv = $(".main");
    searchBar = new SearchBar("index");
    feedsDiv = $(".feeds");
    pageContainer = new PageContainer("index");
    customSpinner = new CustomSpinner("index");
    progressBar = new ProgressBar("index");

    constructor() {
        super("index");
        this.mainDiv.on("scroll", this.onMainDivScroll);
    }

    onMainDivScroll = _.throttle(() => {
        const { scrollHeight, scrollTop } = this.mainDiv;
        if (scrollHeight - scrollTop < 2 * window.innerHeight) {
            this.dispatch("loadMoreFeeds");
        }
    }, 3000);

    addFeeds = (args) => {
        const { html } = args;
        const tmpDiv = document.createElement("div");
        tmpDiv.innerHTML = html;
        _.forEach(tmpDiv.children, (div) => this.mainDiv.appendChild(div));
    };
}

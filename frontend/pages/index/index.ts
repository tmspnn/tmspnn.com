// External modules
import _ from "lodash";

// Local modules
import "./index.scss";
import { model, view, controller, Message } from "../../components/mvc";
import { $, $$, addClass, removeClass } from "../../util/DOM";
import ee from "../../util/ee";
import navigationBar from "../../components/navigationBar/navigationBar";
import searchBar from "../../components/searchBar/searchBar";
import feed from "../../components/feed/feed";
import pageContainer from "../../components/pageContainer/pageContainer";
import spinner from "../../components/spinner";
import xhr from "../../components/xhr/xhr";

// <DOM
// DOM/>

// <Model
_.assign(model, JSON.parse($("#_data")!.textContent!));
// Model/>

// <View
index();
spinner();
xhr();
pageContainer();

function index() {
  navigationBar();
  searchBar();

  const feedDivs = $$(".-feed");

  _.forEach(feedDivs, (div, idx) => feed(div, model.feeds[idx]));
}
// View/>

// <Controller
_.assign(controller, {});
// Controller/>

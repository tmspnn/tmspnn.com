import "./article.scss";
import ee from "../../util/ee";
import pageContainer from "../../components/pageContainer/pageContainer";

const $ = document.querySelector.bind(document);

/**
 * Model
 */
const model: {
  title: string;
} = JSON.parse($("#page-data")!.textContent!);

/**
 * View
 */
pageContainer();

/**
 * Controller
 */
const controller: { [k: string]: any } = {};

ee.on("controller", function (args: { [k: string]: any }) {
  const { _method } = args;
  if (typeof controller[_method] == "function") {
    controller[_method](args);
  }
});

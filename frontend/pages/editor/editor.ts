import { Base64 } from "js-base64";
import "trix/dist/trix.css";
import "trix";
import _ from "lodash";
import qs from "qs";
// Local modules
import "./editor.scss";
import { model, view, controller, Message } from "../../components/mvc";
import isJSON from "../../util/isJSON";
import pageContainer from "../../components/pageContainer/pageContainer";
import spinner from "../../components/spinner";
import toast from "../../components/toast/toast";
import xhr from "../../components/xhr/xhr";
import uploadToOSS from "../../util/uploadToOSS";

/**
 * DOM
 */
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const contentInput = $(".richtext-editor > input") as HTMLInputElement;
const titleInput = $("#title") as HTMLInputElement;
const keywordInputs = $$(".keyword") as NodeListOf<HTMLInputElement>;
const saveBtn = $(".save") as HTMLButtonElement;

/**
 * Model
 */
const queryString = qs.parse(location.search.slice(1));
const articleId = queryString.article_id;
const pageData = JSON.parse($("#page-data")!.textContent!);

_.assign(model, {
  article: {
    id: articleId,
    status: "",
    get title() {
      return titleInput.value;
    },
    get keywords() {
      return _(keywordInputs)
        .filter(inputEl => !_.isEmpty(inputEl.value))
        .map(el => el.value)
        .value();
    },
    get content() {
      return contentInput.value;
    }
  },
  user: { id: pageData.uid },
  policy: pageData.policy,
  signature: pageData.signature,

  setStatus(arg: Message & { value: string }) {
    model.article.status = arg.value;
  }
});

/**
 * View
 */
editor();
pageContainer();
spinner();
toast();
xhr();

function editor() {
  saveBtn.addEventListener("click", () => view.dispatch("clickSaveBtn"));

  addEventListener("trix-attachment-add", function (e: any) {
    const file = e.attachment.file as File;
    if (!file) return;
    const dateStr = new Date().toISOString().slice(0, 10).split("-").join("/");

    uploadToOSS({
      file,
      key: `public/users/${model.user.id}/${dateStr}/${file.name}`,
      policy: model.policy,
      signature: model.signature,
      cb(res) {
        console.log(res);
      },
      onError(e: Error) {
        const err = isJSON(e.message) ? JSON.parse(e.message).err : e.message;
        controller.showToast(err);
      },
      final() {}
    });
  });
}

/**
 * Controller
 */
_.assign(controller, {
  blocked: false,

  clickSaveBtn(arg: Message) {
    // Todo: verify the inputs

    controller.blocked = true;
    controller.render("postJSON", {
      url: "/api/articles",
      data: {
        title: model.article.title,
        keywords: model.article.keywords,
        content: model.article.content,
        status: model.article.status
      },
      cb() {
        console.log("cb called");
      },
      onError() {
        console.log("onError called");
      },
      final() {
        console.log("final called");
      }
    });
  },

  showToast(text: string) {
    controller.render("toast", { text });
  }
});

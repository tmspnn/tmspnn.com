// Trix editor
import "trix/dist/trix.css";
import Trix from "trix";

// Local modules
import "./editor.scss";
import EditorView from "./EditorView";
import EditorController from "./EditorController";

Trix.config.lang.captionPlaceholder = "添加描述";
new EditorView();
new EditorController();
